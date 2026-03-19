import User from '../models/User.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role } = req.query;

        let query = {};
        if (role) {
            query.role = role;
        }

        const users = await User.find(query, {
            excludePassword: true,
            limit: Number(limit),
            skip: (Number(page) - 1) * Number(limit),
        });

        const count = await User.countDocuments(query);

        res.status(200).json({
            users,
            totalPages: Math.ceil(count / Number(limit)),
            currentPage: Number(page),
            totalUsers: count,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin only)
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role, isActive } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'cashier',
            isActive: isActive !== undefined ? isActive : true,
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin only)
export const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, email, role, isActive } = req.body;

        const updates = {};
        if (name) updates.name = name;
        if (email) updates.email = email;
        if (role) updates.role = role;
        if (isActive !== undefined) updates.isActive = isActive;

        const updatedUser = await User.updateById(req.params.id, updates);

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            isActive: updatedUser.isActive,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting yourself
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        await User.deleteOne(req.params.id);

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user statistics
// @route   GET /api/users/stats/summary
// @access  Private (Admin only)
export const getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const adminCount = await User.countDocuments({ role: 'admin' });
        const managerCount = await User.countDocuments({ role: 'manager' });
        const cashierCount = await User.countDocuments({ role: 'cashier' });

        res.status(200).json({
            totalUsers,
            activeUsers,
            adminCount,
            managerCount,
            cashierCount,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
