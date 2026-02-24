import Purchase from '../models/Purchase.js';
import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import StockTransaction from '../models/StockTransaction.js';

// @desc    Get all purchases
// @route   GET /api/purchases
// @access  Private (Admin & Manager)
export const getAllPurchases = async (req, res) => {
    try {
        const { page = 1, limit = 10, supplier, startDate, endDate } = req.query;

        let query = {};
        if (supplier) query.supplier = supplier;
        if (startDate || endDate) {
            query.purchaseDate = {};
            if (startDate) query.purchaseDate.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.purchaseDate.$lte = end;
            }
        }

        const purchases = await Purchase.find(query, {
            populate: true,
            limit: Number(limit),
            skip: (Number(page) - 1) * Number(limit),
        });

        const count = await Purchase.countDocuments(query);

        res.status(200).json({
            purchases,
            totalPages: Math.ceil(count / Number(limit)),
            currentPage: Number(page),
            totalPurchases: count,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single purchase
// @route   GET /api/purchases/:id
// @access  Private (Admin & Manager)
export const getPurchaseById = async (req, res) => {
    try {
        const purchase = await Purchase.findByIdPopulated(req.params.id);
        if (!purchase) return res.status(404).json({ message: 'Purchase not found' });
        res.status(200).json(purchase);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create purchase (with Inventory stock-in)
// @route   POST /api/purchases
// @access  Private (Admin & Manager)
export const createPurchase = async (req, res) => {
    try {
        const { supplierId, products, notes, purchaseDate } = req.body;

        const supplier = await Supplier.findById(supplierId);
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

        if (!products || products.length === 0) {
            return res.status(400).json({ message: 'At least one product is required' });
        }

        const lineItems = [];
        let totalAmount = 0;

        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (!product) return res.status(404).json({ message: `Product not found: ${item.productId}` });

            const itemTotal = item.quantity * item.costPrice;
            lineItems.push({
                product: product._id,
                productName: product.productName,
                quantity: item.quantity,
                costPrice: item.costPrice,
                total: itemTotal,
            });
            totalAmount += itemTotal;
        }

        const purchase = await Purchase.create({
            supplier: supplierId,
            products: lineItems,
            totalAmount,
            purchaseDate: purchaseDate || new Date().toISOString(),
            createdBy: req.user._id,
            status: 'completed',
            notes: notes || '',
        });

        // Update Inventory + StockTransaction + supplier refs
        for (const item of lineItems) {
            // Update Inventory
            let inv = await Inventory.findOne({ product: item.product });
            if (!inv) inv = await Inventory.create({ product: item.product, currentStock: 0 });
            inv.currentStock += item.quantity;
            inv.lastUpdated = new Date();
            await inv.save();

            // Update cost price in Product
            await Product.updateById(item.product, { costPrice: item.costPrice });

            // Add supplier reference to product
            await Product.findByIdAndUpdate(item.product, {
                $addToSet: { suppliers: supplierId },
            });

            // Create StockTransaction
            await StockTransaction.create({
                product: item.product,
                type: 'stock-in',
                quantity: item.quantity,
                createdBy: req.user._id,
                referenceType: 'purchase',
                referenceId: purchase._id,
                notes: `Purchase: ${purchase.purchaseNumber} from ${supplier.supplierName}`,
            });

            // Update supplier's suppliedProducts
            await Supplier.addSuppliedProduct(supplierId, item.product);
        }

        const populatedPurchase = await Purchase.findByIdPopulated(purchase._id);
        res.status(201).json(populatedPurchase);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete purchase (admin only) — reverses Inventory stock
// @route   DELETE /api/purchases/:id
// @access  Private (Admin only)
export const deletePurchase = async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id);
        if (!purchase) return res.status(404).json({ message: 'Purchase not found' });

        for (const item of purchase.products) {
            const inv = await Inventory.findOne({ product: item.product });
            if (inv) {
                inv.currentStock = Math.max(0, inv.currentStock - item.quantity);
                inv.lastUpdated = new Date();
                await inv.save();
            }
        }

        await StockTransaction.deleteMany({ referenceType: 'purchase', referenceId: purchase._id });
        await Purchase.deleteOne(req.params.id);

        res.status(200).json({ message: 'Purchase deleted and stock reversed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get purchase stats (for dashboard)
// @route   GET /api/purchases/stats/summary
// @access  Private (Admin & Manager)
export const getPurchaseStats = async (req, res) => {
    try {
        const totalPurchases = await Purchase.countDocuments({ status: 'completed' });
        const result = await Purchase.aggregate();
        const totalPurchaseCost = result.length > 0 ? result[0].totalCost : 0;
        res.status(200).json({ totalPurchases, totalPurchaseCost });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
