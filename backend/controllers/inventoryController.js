import Inventory from '../models/Inventory.js';
import Product from '../models/Product.js';
import StockTransaction from '../models/StockTransaction.js';

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
                inv.displayedStock <= inv.product.minimumStockLevel;
            return matchSearch && matchCategory && matchLowStock;
        });

        // Default ordering: most recently updated via supplier purchases first.
        const purchaseStockIns = await StockTransaction.find({
            type: 'stock-in',
            referenceType: 'purchase',
        });

        const latestPurchaseByProduct = new Map();
        for (const tx of purchaseStockIns) {
            const txTime = new Date(tx.createdAt || tx.date || 0).getTime();
            if (!Number.isFinite(txTime)) continue;

            const existing = latestPurchaseByProduct.get(tx.productId) || 0;
            if (txTime > existing) {
                latestPurchaseByProduct.set(tx.productId, txTime);
            }
        }

        filtered.sort((a, b) => {
            const aPurchaseTime = latestPurchaseByProduct.get(a.product?._id) || 0;
            const bPurchaseTime = latestPurchaseByProduct.get(b.product?._id) || 0;

            if (aPurchaseTime !== bPurchaseTime) {
                return bPurchaseTime - aPurchaseTime;
            }

            // Fallback keeps ordering stable when purchase timestamps are equal/missing.
            const aLastUpdated = new Date(a.lastUpdated || 0).getTime() || 0;
            const bLastUpdated = new Date(b.lastUpdated || 0).getTime() || 0;
            return bLastUpdated - aLastUpdated;
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
            (inv) => inv.product && inv.displayedStock <= inv.product.minimumStockLevel
        ).length;

        const totalDisplayedStock = allInventory.reduce((sum, inv) => sum + (inv.displayedStock || 0), 0);
        const totalStoredStock = allInventory.reduce((sum, inv) => sum + (inv.storedStock || 0), 0);
        const totalCombinedStock = totalDisplayedStock + totalStoredStock;

        const totalStockValue = await Inventory.aggregate([]);
        const stockValue = totalStockValue.length > 0 ? totalStockValue[0].totalValue : 0;

        res.status(200).json({
            totalProducts,
            lowStockCount,
            totalStockValue: stockValue,
            totalDisplayedStock,
            totalStoredStock,
            totalCombinedStock,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
