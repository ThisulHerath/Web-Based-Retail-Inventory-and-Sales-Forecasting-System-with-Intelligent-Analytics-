import { supabase } from '../config/db.js';
import InventoryReport from '../models/InventoryReport.js';

const validateDates = (fromDate, toDate) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const now = new Date();

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
        return { valid: false, message: 'fromDate and toDate must be valid date strings' };
    }

    if (from > to) {
        return { valid: false, message: 'fromDate must be earlier than toDate' };
    }

    if (from > now || to > now) {
        return { valid: false, message: 'fromDate and toDate cannot be in the future' };
    }

    return { valid: true, from, to };
};

const buildReportData = async (fromDate, toDate) => {
    let txQuery = supabase
        .from('stock_transactions')
        .select('id, product_id, type, quantity, date, created_by, notes, created_at')
        .gte('date', fromDate)
        .lte('date', toDate)
        .order('date', { ascending: false });

    const { data: txRows, error: txError } = await txQuery;
    if (txError) throw txError;

    const productIds = [...new Set((txRows || []).map((t) => t.product_id).filter(Boolean))];
    const userIds = [...new Set((txRows || []).map((t) => t.created_by).filter(Boolean))];

    const productMap = {};
    const userMap = {};

    if (productIds.length > 0) {
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, product_name, sku')
            .in('id', productIds);
        if (productsError) throw productsError;

        (products || []).forEach((p) => {
            productMap[p.id] = {
                productId: p.id,
                productName: p.product_name,
                sku: p.sku,
            };
        });
    }

    if (userIds.length > 0) {
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, name, email')
            .in('id', userIds);
        if (usersError) throw usersError;

        (users || []).forEach((u) => {
            userMap[u.id] = {
                userId: u.id,
                userName: u.name,
                userEmail: u.email,
            };
        });
    }

    const transactions = (txRows || []).map((tx) => ({
        transactionId: tx.id,
        productId: tx.product_id,
        productName: productMap[tx.product_id]?.productName || 'Unknown Product',
        sku: productMap[tx.product_id]?.sku || '',
        type: tx.type,
        quantity: tx.quantity,
        date: tx.date,
        createdAt: tx.created_at,
        createdBy: userMap[tx.created_by]?.userName || 'Unknown User',
        createdByEmail: userMap[tx.created_by]?.userEmail || '',
        notes: tx.notes || '',
    }));

    const summary = transactions.reduce(
        (acc, tx) => {
            acc.totalActions += 1;
            if (tx.type === 'stock-in') {
                acc.stockInActions += 1;
                acc.totalStockInQty += Number(tx.quantity) || 0;
            }
            if (tx.type === 'stock-out') {
                acc.stockOutActions += 1;
                acc.totalStockOutQty += Number(tx.quantity) || 0;
            }
            return acc;
        },
        {
            totalActions: 0,
            stockInActions: 0,
            stockOutActions: 0,
            totalStockInQty: 0,
            totalStockOutQty: 0,
        }
    );

    return { summary, transactions };
};

// @desc    Create inventory report for date range
// @route   POST /api/inventory/reports
// @access  Private (Admin & Manager)
export const createInventoryReport = async (req, res) => {
    try {
        const { title, fromDate, toDate, notes = '' } = req.body;

        if (!title || !fromDate || !toDate) {
            return res.status(400).json({ message: 'title, fromDate, and toDate are required' });
        }

        const dateValidation = validateDates(fromDate, toDate);
        if (!dateValidation.valid) {
            return res.status(400).json({ message: dateValidation.message });
        }

        const { summary, transactions } = await buildReportData(dateValidation.from.toISOString(), dateValidation.to.toISOString());

        const report = await InventoryReport.create({
            title,
            fromDate: dateValidation.from.toISOString(),
            toDate: dateValidation.to.toISOString(),
            notes,
            summary,
            transactions,
            createdBy: req.user._id,
        });

        res.status(201).json({ message: 'Inventory report created successfully', report });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all inventory reports
// @route   GET /api/inventory/reports
// @access  Private (Admin & Manager)
export const getInventoryReports = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.max(1, Math.min(100, Number(limit)));

        const result = await InventoryReport.find({}, {
            limit: limitNum,
            skip: (pageNum - 1) * limitNum,
        });

        res.status(200).json({
            reports: result.data,
            totalItems: result.count,
            totalPages: Math.ceil(result.count / limitNum),
            currentPage: pageNum,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get one inventory report
// @route   GET /api/inventory/reports/:id
// @access  Private (Admin & Manager)
export const getInventoryReportById = async (req, res) => {
    try {
        const report = await InventoryReport.findById(req.params.id);
        if (!report) return res.status(404).json({ message: 'Inventory report not found' });

        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update inventory report
// @route   PUT /api/inventory/reports/:id
// @access  Private (Admin & Manager)
export const updateInventoryReport = async (req, res) => {
    try {
        const existing = await InventoryReport.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: 'Inventory report not found' });

        const nextTitle = req.body.title || existing.title;
        const nextFromDate = req.body.fromDate || existing.fromDate;
        const nextToDate = req.body.toDate || existing.toDate;
        const nextNotes = req.body.notes !== undefined ? req.body.notes : existing.notes;

        if (!nextTitle || !nextFromDate || !nextToDate) {
            return res.status(400).json({ message: 'title, fromDate, and toDate are required' });
        }

        const dateValidation = validateDates(nextFromDate, nextToDate);
        if (!dateValidation.valid) {
            return res.status(400).json({ message: dateValidation.message });
        }

        const { summary, transactions } = await buildReportData(dateValidation.from.toISOString(), dateValidation.to.toISOString());

        const report = await InventoryReport.updateById(req.params.id, {
            title: nextTitle,
            fromDate: dateValidation.from.toISOString(),
            toDate: dateValidation.to.toISOString(),
            notes: nextNotes,
            summary,
            transactions,
            updatedBy: req.user._id,
        });

        res.status(200).json({ message: 'Inventory report updated successfully', report });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete inventory report
// @route   DELETE /api/inventory/reports/:id
// @access  Private (Admin & Manager)
export const deleteInventoryReport = async (req, res) => {
    try {
        const existing = await InventoryReport.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: 'Inventory report not found' });

        await InventoryReport.deleteById(req.params.id);
        res.status(200).json({ message: 'Inventory report deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
