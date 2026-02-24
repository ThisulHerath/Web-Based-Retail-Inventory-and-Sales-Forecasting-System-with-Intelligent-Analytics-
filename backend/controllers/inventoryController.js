import Inventory from '../models/Inventory.js';
import Product from '../models/Product.js';

// @desc    Get all inventory records (joined with product & category)
// @route   GET /api/inventory
// @access  Private (Admin & Manager)
export const getAllInventory = async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', category, lowStock } = req.query;

        // Get all inventory with populated product data
        const inventories = await Inventory.findPopulated();

        // Filter in memory (supports search on populated fields)
        let filtered = inventories.filter((inv) => {
            if (!inv.product) return false;
            const matchSearch =
                !search ||
                inv.product.productName.toLowerCase().includes(search.toLowerCase()) ||
                (inv.product.sku && inv.product.sku.toLowerCase().includes(search.toLowerCase()));
            const matchCategory =
                !category ||
                (inv.product.category && inv.product.category._id.toString() === category);
            const matchLowStock =
                lowStock !== 'true' ||
                inv.currentStock <= inv.product.minimumStockLevel;
            return matchSearch && matchCategory && matchLowStock;
        });

        const total = filtered.length;
        const start = (Number(page) - 1) * Number(limit);
        const paginated = filtered.slice(start, start + Number(limit));

        res.status(200).json({
            inventory: paginated,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            totalItems: total,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get inventory record for one product
// @route   GET /api/inventory/:productId
// @access  Private (Admin & Manager)
export const getInventoryByProduct = async (req, res) => {
    try {
        const inv = await Inventory.findOne({ product: req.params.productId });
        if (!inv) return res.status(404).json({ message: 'Inventory record not found' });

        // Populate product with category
        const product = await Product.findByIdPopulated(req.params.productId);
        if (product) inv.product = product;

        res.status(200).json(inv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Inventory summary stats for dashboard
// @route   GET /api/inventory/stats/summary
// @access  Private (Admin & Manager)
export const getInventoryStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments({ isActive: true });

        // Get all inventory with product data for low stock calculation
        const allInventory = await Inventory.findPopulated();
        const lowStockCount = allInventory.filter(
            (inv) => inv.product && inv.currentStock <= inv.product.minimumStockLevel
        ).length;

        const totalStockValue = await Inventory.aggregate([]);
        const stockValue = totalStockValue.length > 0 ? totalStockValue[0].totalValue : 0;

        res.status(200).json({ totalProducts, lowStockCount, totalStockValue: stockValue });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
