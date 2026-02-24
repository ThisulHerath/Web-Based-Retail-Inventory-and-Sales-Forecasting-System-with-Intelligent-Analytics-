import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import Sale from '../models/Sale.js';
import Purchase from '../models/Purchase.js';
import Category from '../models/Category.js';
import { processProductImage } from '../utils/imageProcessor.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { supabase } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: join inventory data into a product object
const withInventory = async (product) => {
    const inv = await Inventory.findOne({ product: product._id });
    const prodData = product.toJSON ? product.toJSON() : product;
    return {
        ...prodData,
        currentStock: inv ? inv.currentStock : 0,
        isLowStock: inv ? inv.currentStock <= product.minimumStockLevel : false,
    };
};

// @desc    Get all products (with inventory & category populated)
// @route   GET /api/products
// @access  Private
export const getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', category, isActive, lowStock } = req.query;

        let query = {};
        if (search) {
            query.$or = [
                { productName: { $regex: search } },
                { sku: { $regex: search } },
            ];
        }
        if (category) query.category = category;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const products = await Product.find(query, { populateCategory: true });

        // Join inventory
        const productsWithStock = await Promise.all(products.map(withInventory));

        // Low stock filter (post-join)
        const filtered = lowStock === 'true'
            ? productsWithStock.filter((p) => p.isLowStock)
            : productsWithStock;

        const total = filtered.length;
        const paginated = filtered.slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));

        res.status(200).json({
            products: paginated,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            totalProducts: await Product.countDocuments(query),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Private
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findByIdPopulated(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        const result = await withInventory(product);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new product (auto-creates Inventory record)
// @route   POST /api/products
// @access  Private (Admin & Manager)
export const createProduct = async (req, res) => {
    try {
        const { productName, sku, category, description, costPrice, sellingPrice, minimumStockLevel, isActive } = req.body;

        if (!productName || !category || costPrice === undefined || sellingPrice === undefined) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Verify category exists
        const cat = await Category.findById(category);
        if (!cat) return res.status(400).json({ message: 'Invalid category' });

        // Check duplicate name
        const exists = await Product.findOne({ productName });
        if (exists) return res.status(400).json({ message: 'Product with this name already exists' });

        // Check SKU uniqueness if provided
        if (sku) {
            const skuExists = await Product.findOne({ sku });
            if (skuExists) return res.status(400).json({ message: 'A product with this SKU already exists' });
        }

        // Handle image upload if present
        let productImage = null;
        if (req.file) {
            try {
                const filePath = req.file.path;
                console.log('Uploading file:', filePath);
                productImage = await processProductImage(filePath);
                console.log('Image saved with path:', productImage);
            } catch (imageError) {
                console.error('Image processing failed:', imageError);
            }
        }

        const product = await Product.create({
            productName,
            sku,
            category,
            description,
            costPrice,
            sellingPrice,
            minimumStockLevel: minimumStockLevel ?? 10,
            isActive: isActive !== undefined ? isActive : true,
            productImage: productImage,
        });

        // Auto-create Inventory record with 0 stock
        await Inventory.create({ product: product._id, currentStock: 0 });

        const populated = await Product.findByIdPopulated(product._id);
        res.status(201).json({ ...(populated.toJSON ? populated.toJSON() : populated), currentStock: 0 });
    } catch (error) {
        if (req.file) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin & Manager)
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const { productName, sku, category, description, costPrice, sellingPrice, minimumStockLevel, isActive } = req.body;

        const updates = {};

        // Verify category if updating
        if (category) {
            const cat = await Category.findById(category);
            if (!cat) return res.status(400).json({ message: 'Invalid category' });
            updates.category = category;
        }

        if (productName) updates.productName = productName;
        if (sku !== undefined) updates.sku = sku;
        if (description !== undefined) updates.description = description;
        if (costPrice !== undefined) updates.costPrice = costPrice;
        if (sellingPrice !== undefined) updates.sellingPrice = sellingPrice;
        if (minimumStockLevel !== undefined) updates.minimumStockLevel = minimumStockLevel;
        if (isActive !== undefined) updates.isActive = isActive;

        // Handle image upload if present
        if (req.file) {
            try {
                if (product.productImage) {
                    const oldImagePath = path.join(__dirname, '../public/uploads', product.productImage);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                const filePath = req.file.path;
                updates.productImage = await processProductImage(filePath);
            } catch (imageError) {
                console.error('Image processing failed:', imageError);
            }
        }

        await Product.updateById(req.params.id, updates);
        const populated = await Product.findByIdPopulated(req.params.id);
        const result = await withInventory(populated);
        res.status(200).json(result);
    } catch (error) {
        if (req.file) {
            try { fs.unlinkSync(req.file.path); } catch (e) { }
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete product (protected — checks stock, sales, purchases)
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Check inventory stock
        const inv = await Inventory.findOne({ product: req.params.id });
        if (inv && inv.currentStock > 0) {
            return res.status(400).json({
                message: `Cannot delete product. Current stock is ${inv.currentStock}. Use stock-out to clear first.`,
            });
        }

        // Check sales - use sale_items table
        const saleUsage = await Sale.countSaleItemsForProduct(req.params.id);
        if (saleUsage > 0) {
            return res.status(400).json({
                message: `Cannot delete product. It is referenced in sale(s).`,
            });
        }

        // Check purchases - use purchase_items table
        const { count: purchaseUsage } = await supabase
            .from('purchase_items')
            .select('id', { count: 'exact', head: true })
            .eq('product_id', req.params.id);
        if (purchaseUsage > 0) {
            return res.status(400).json({
                message: `Cannot delete product. It is referenced in purchase(s).`,
            });
        }

        // Delete inventory record too
        await Inventory.deleteOne({ product: req.params.id });
        await Product.deleteOne(req.params.id);

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get low stock products (via Inventory join)
// @route   GET /api/products/low-stock/list
// @access  Private (Admin & Manager)
export const getLowStockProducts = async (req, res) => {
    try {
        const inventories = await Inventory.findPopulated();
        const lowStock = inventories.filter(
            (inv) => inv.product && inv.currentStock <= inv.product.minimumStockLevel
        );
        res.status(200).json({ products: lowStock, count: lowStock.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
