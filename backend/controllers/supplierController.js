import Supplier from '../models/Supplier.js';
import Purchase from '../models/Purchase.js';

// Sri Lankan phone number validation
const isValidSLPhone = (phone) => {
    if (!phone) return true;
    const cleaned = phone.replace(/[\s\-()]/g, '');
    return /^(?:0[1-9][0-9]{8}|\+?94[1-9][0-9]{8})$/.test(cleaned);
};

const normalizeEmail = (email = '') => email.trim().toLowerCase();
const normalizePhone = (phone = '') => phone.trim().replace(/[\s\-()]/g, '');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private (Admin & Manager)
export const getAllSuppliers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', isActive } = req.query;

        let query = {};
        if (search) {
            query.$or = [
                { supplierName: { $regex: search } },
                { companyName: { $regex: search } },
            ];
        }
        if (isActive !== undefined && isActive !== '') {
            query.isActive = isActive === 'true';
        }

        const suppliers = await Supplier.find(query, {
            populateProducts: true,
            limit: Number(limit),
            skip: (Number(page) - 1) * Number(limit),
        });

        const count = await Supplier.countDocuments(query);

        res.status(200).json({
            suppliers,
            totalPages: Math.ceil(count / Number(limit)),
            currentPage: Number(page),
            totalSuppliers: count,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single supplier by ID
// @route   GET /api/suppliers/:id
// @access  Private (Admin & Manager)
export const getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdPopulated(req.params.id);

        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        // Get purchase summary for this supplier
        const purchases = await Purchase.findSorted(
            { supplier: req.params.id },
            'purchaseDate',
            -1
        );

        const totalPurchaseValue = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
        const lastPurchaseDate = purchases.length > 0 ? purchases[0].purchaseDate : null;

        res.status(200).json({
            supplier,
            purchaseSummary: {
                totalPurchases: purchases.length,
                totalPurchaseValue,
                lastPurchaseDate,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private (Admin & Manager)
export const createSupplier = async (req, res) => {
    try {
        const { supplierName, companyName, email, phone, address } = req.body;
        const normalizedSupplierName = supplierName?.trim();
        const normalizedCompanyName = companyName?.trim();
        const normalizedEmail = normalizeEmail(email || '');
        const normalizedPhone = normalizePhone(phone || '');
        const normalizedAddress = address?.trim();

        if (!normalizedSupplierName) {
            return res.status(400).json({ message: 'Supplier name is required' });
        }

        if (!normalizedCompanyName) {
            return res.status(400).json({ message: 'Company name is required' });
        }

        if (!normalizedEmail) {
            return res.status(400).json({ message: 'Email is required' });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        if (!normalizedPhone) {
            return res.status(400).json({ message: 'Phone is required' });
        }

        if (normalizedPhone && !isValidSLPhone(normalizedPhone)) {
            return res.status(400).json({ message: 'Please enter a valid Sri Lankan phone number (e.g., 07X XXXXXXX)' });
        }

        if (!normalizedAddress) {
            return res.status(400).json({ message: 'Address is required' });
        }

        const duplicate = await Supplier.findDuplicate({
            supplierName: normalizedSupplierName,
            email: normalizedEmail,
            phone: normalizedPhone,
        });

        if (duplicate) {
            return res.status(409).json({
                message: `Duplicate supplier found for ${duplicate.field}`,
                code: 'DUPLICATE_SUPPLIER',
                field: duplicate.field,
            });
        }

        const supplier = await Supplier.create({
            supplierName: normalizedSupplierName,
            companyName: normalizedCompanyName,
            email: normalizedEmail,
            phone: normalizedPhone,
            address: normalizedAddress,
        });

        res.status(201).json(supplier);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private (Admin & Manager)
export const updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);

        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        const { supplierName, companyName, email, phone, address, isActive } = req.body;

        const normalizedSupplierName = supplierName !== undefined ? supplierName.trim() : undefined;
        const normalizedCompanyName = companyName !== undefined ? companyName.trim() : undefined;
        const normalizedEmail = email !== undefined ? normalizeEmail(email) : undefined;
        const normalizedPhone = phone !== undefined ? normalizePhone(phone) : undefined;
        const normalizedAddress = address !== undefined ? address.trim() : undefined;

        if (normalizedPhone && !isValidSLPhone(normalizedPhone)) {
            return res.status(400).json({ message: 'Please enter a valid Sri Lankan phone number (e.g., 07X XXXXXXX)' });
        }

        const duplicate = await Supplier.findDuplicate({
            supplierName: normalizedSupplierName !== undefined ? normalizedSupplierName : supplier.supplierName,
            email: normalizedEmail !== undefined ? normalizedEmail : supplier.email,
            phone: normalizedPhone !== undefined ? normalizedPhone : supplier.phone,
            excludeId: req.params.id,
        });

        if (duplicate) {
            return res.status(409).json({
                message: `Duplicate supplier found for ${duplicate.field}`,
                code: 'DUPLICATE_SUPPLIER',
                field: duplicate.field,
            });
        }

        const updates = {};
        if (normalizedSupplierName) updates.supplierName = normalizedSupplierName;
        if (normalizedCompanyName !== undefined) updates.companyName = normalizedCompanyName;
        if (normalizedEmail !== undefined) updates.email = normalizedEmail;
        if (normalizedPhone !== undefined) updates.phone = normalizedPhone;
        if (normalizedAddress !== undefined) updates.address = normalizedAddress;
        if (isActive !== undefined) updates.isActive = isActive;

        const updatedSupplier = await Supplier.updateById(req.params.id, updates);
        res.status(200).json(updatedSupplier);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (Admin only)
export const deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);

        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        // Prevent deletion if supplier has purchases
        const purchaseCount = await Purchase.countDocuments({ supplier: req.params.id });
        if (purchaseCount > 0) {
            return res.status(400).json({
                message: `Cannot delete supplier. They have ${purchaseCount} existing purchase(s). Deactivate instead.`,
            });
        }

        await Supplier.deleteOne(req.params.id);
        res.status(200).json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get supplier stats (for dashboard)
// @route   GET /api/suppliers/stats/summary
// @access  Private (Admin & Manager)
export const getSupplierStats = async (req, res) => {
    try {
        const totalSuppliers = await Supplier.countDocuments();
        const activeSuppliers = await Supplier.countDocuments({ isActive: true });

        res.status(200).json({ totalSuppliers, activeSuppliers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
