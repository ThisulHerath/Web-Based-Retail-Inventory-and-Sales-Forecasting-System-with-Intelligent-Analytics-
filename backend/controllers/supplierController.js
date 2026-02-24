import Supplier from '../models/Supplier.js';
import Purchase from '../models/Purchase.js';

// Sri Lankan phone number validation
const isValidSLPhone = (phone) => {
    if (!phone) return true;
    const cleaned = phone.replace(/[\s\-()]/g, '');
    return /^(?:0[1-9][0-9]{8}|\+?94[1-9][0-9]{8})$/.test(cleaned);
};

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

        if (!supplierName) {
            return res.status(400).json({ message: 'Supplier name is required' });
        }

        if (phone && !isValidSLPhone(phone)) {
            return res.status(400).json({ message: 'Please enter a valid Sri Lankan phone number (e.g., 07X XXXXXXX)' });
        }

        const supplier = await Supplier.create({
            supplierName,
            companyName,
            email,
            phone,
            address,
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

        if (phone && !isValidSLPhone(phone)) {
            return res.status(400).json({ message: 'Please enter a valid Sri Lankan phone number (e.g., 07X XXXXXXX)' });
        }

        const updates = {};
        if (supplierName) updates.supplierName = supplierName;
        if (companyName !== undefined) updates.companyName = companyName;
        if (email !== undefined) updates.email = email;
        if (phone !== undefined) updates.phone = phone;
        if (address !== undefined) updates.address = address;
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
