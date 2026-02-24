import Category from '../models/Category.js';
import Product from '../models/Product.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private (Admin & Manager)
export const getAllCategories = async (req, res) => {
    try {
        const { page = 1, limit = 50, search = '', isActive } = req.query;

        let query = {};
        if (search) query.categoryName = search;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const categories = await Category.find(query, {
            sort: { categoryName: 1 },
            limit: Number(limit),
            skip: (Number(page) - 1) * Number(limit),
        });

        const count = await Category.countDocuments(query);

        // Attach product count for each category
        const categoriesWithCount = await Promise.all(
            categories.map(async (cat) => {
                const productCount = await Product.countDocuments({ category: cat._id });
                return { ...cat.toJSON(), productCount };
            })
        );

        res.status(200).json({
            categories: categoriesWithCount,
            totalPages: Math.ceil(count / Number(limit)),
            currentPage: Number(page),
            totalCategories: count,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private (Admin & Manager)
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin)
export const createCategory = async (req, res) => {
    try {
        const { categoryName, description, isActive } = req.body;
        if (!categoryName) return res.status(400).json({ message: 'Category name is required' });

        const exists = await Category.findOne({ categoryName });
        if (exists) return res.status(400).json({ message: 'Category already exists' });

        const category = await Category.create({ categoryName, description, isActive });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        const { categoryName, description, isActive } = req.body;
        const updates = {};
        if (categoryName) updates.categoryName = categoryName;
        if (description !== undefined) updates.description = description;
        if (isActive !== undefined) updates.isActive = isActive;

        const updated = await Category.updateById(req.params.id, updates);
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete category (blocked if used by products)
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        const productCount = await Product.countDocuments({ category: req.params.id });
        if (productCount > 0) {
            return res.status(400).json({
                message: `Cannot delete category. It is used by ${productCount} product(s).`,
            });
        }

        await Category.deleteOne(req.params.id);
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
