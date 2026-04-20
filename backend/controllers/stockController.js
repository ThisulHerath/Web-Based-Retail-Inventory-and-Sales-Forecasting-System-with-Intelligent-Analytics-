import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import StockTransaction from '../models/StockTransaction.js';

// @desc    Stock In - Move stock from stored to displayed
// @route   POST /api/stock/in
// @access  Private (Admin & Manager)
export const stockIn = async (req, res) => {
    try {
        const { productId, quantity, notes } = req.body;

        if (!productId || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Please provide valid product and quantity' });
        }

        const product = await Product.findByIdPopulated(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Update Inventory
        let inv = await Inventory.findOne({ product: productId });
        if (!inv) {
            inv = await Inventory.create({ product: productId, displayedStock: 0, storedStock: 0 });
        }

        const requestedQty = parseInt(quantity, 10);
        if (inv.storedStock < requestedQty) {
            return res.status(400).json({
                message: `Insufficient stored stock. Available stored: ${inv.storedStock}, Requested: ${requestedQty}`,
            });
        }

        // Stock-in for displayed area is a transfer from stored -> displayed.
        inv.storedStock -= requestedQty;
        inv.displayedStock += requestedQty;
        inv.lastUpdated = new Date();
        const updatedInv = await inv.save();

        const transaction = await StockTransaction.create({
            product: productId,
            type: 'stock-in',
            quantity: requestedQty,
            createdBy: req.user._id,
            stockOutReason: null,
            notes: notes || 'Transfer from stored to displayed',
            referenceType: 'manual',
        });

        // Populate transaction
        await transaction.populate('product', 'productName sku');
        await transaction.populate('createdBy', 'name email');

        res.status(201).json({
            message: 'Stock added successfully',
            transaction,
            displayedStock: updatedInv.displayedStock,
            storedStock: updatedInv.storedStock,
            totalStock: updatedInv.totalStock,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Stock Out - Remove stock from product
// @route   POST /api/stock/out
// @access  Private (Admin & Manager)
export const stockOut = async (req, res) => {
    try {
        const { productId, quantity, notes, stockOutReason } = req.body;

        if (!productId || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Please provide valid product and quantity' });
        }

        if (!['expired', 'damaged', 'other'].includes(stockOutReason)) {
            return res.status(400).json({ message: 'Please select a valid stock out reason' });
        }

        if (stockOutReason === 'other' && !String(notes || '').trim()) {
            return res.status(400).json({ message: 'Please provide notes when reason is Other' });
        }

        const product = await Product.findByIdPopulated(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        let inv = await Inventory.findOne({ product: productId });
        if (!inv) inv = await Inventory.create({ product: productId, displayedStock: 0, storedStock: 0 });

        if (inv.displayedStock < parseInt(quantity)) {
            return res.status(400).json({
                message: `Insufficient displayed stock. Available: ${inv.displayedStock}, Requested: ${quantity}`,
            });
        }

        // Manual stock-out removes from displayed stock.
        const requestedQty = parseInt(quantity, 10);
        inv.displayedStock -= requestedQty;
        inv.lastUpdated = new Date();
        const updatedInv = await inv.save();

        const transaction = await StockTransaction.create({
            product: productId,
            type: 'stock-out',
            quantity: requestedQty,
            createdBy: req.user._id,
            stockOutReason,
            notes: notes || '',
            referenceType: 'manual',
        });

        await transaction.populate('product', 'productName sku');
        await transaction.populate('createdBy', 'name email');

        res.status(201).json({
            message: 'Stock removed successfully',
            transaction,
            displayedStock: updatedInv.displayedStock,
            storedStock: updatedInv.storedStock,
            totalStock: updatedInv.totalStock,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get stock history for a product
// @route   GET /api/stock/history/:productId
// @access  Private (Admin & Manager)
export const getStockHistory = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const product = await Product.findByIdPopulated(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const inv = await Inventory.findOne({ product: productId });

        const transactions = await StockTransaction.findPopulated(
            { product: productId },
            {
                limit: Number(limit),
                skip: (Number(page) - 1) * Number(limit),
            }
        );

        const count = await StockTransaction.countDocuments({ product: productId });

        res.status(200).json({
            product: {
                _id: product._id,
                productName: product.productName,
                sku: product.sku,
                currentStock: inv ? inv.displayedStock : 0,
                displayedStock: inv ? inv.displayedStock : 0,
                storedStock: inv ? inv.storedStock : 0,
                totalStock: inv ? inv.totalStock : 0,
            },
            transactions,
            totalPages: Math.ceil(count / Number(limit)),
            currentPage: Number(page),
            totalTransactions: count,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all stock transactions
// @route   GET /api/stock/transactions
// @access  Private (Admin & Manager)
export const getAllTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 20, type } = req.query;

        let query = {};
        if (type) query.type = type;

        const transactions = await StockTransaction.findPopulated(query, {
            limit: Number(limit),
            skip: (Number(page) - 1) * Number(limit),
        });

        const count = await StockTransaction.countDocuments(query);

        res.status(200).json({
            transactions,
            totalPages: Math.ceil(count / Number(limit)),
            currentPage: Number(page),
            totalTransactions: count,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
