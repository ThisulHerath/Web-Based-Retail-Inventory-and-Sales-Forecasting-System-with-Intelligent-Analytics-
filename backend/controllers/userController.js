import User from '../models/User.js';
import sendEmail, { getWelcomeEmailTemplate } from '../utils/sendEmail.js';
import crypto from 'crypto';

const generateTemporaryPassword = (length = 16) => {
    const buffer = crypto.randomBytes(Math.ceil((length * 3) / 4));
    return buffer.toString('base64url').slice(0, length);
};

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
        const { name, email, role, isActive } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const password = generateTemporaryPassword(12);

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // NEW: Strict Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address format' });
        }


        const user = await User.create({
            name,
            email,
            password,
            role: role || 'cashier',
            isActive: isActive !== undefined ? isActive : true,
        });

        // NEW: Try sending the welcome email in the background
        let emailSent = false;
        let emailErrorMessage = null;
        try {
            const emailHtml = getWelcomeEmailTemplate(name, user.role, email, password); // Mail raw password provided directly by Admin
            await sendEmail({
                email: user.email,
                subject: 'Welcome to 7 Super City POS - Your Official Account Details',
                html: emailHtml
            });
            emailSent = true;
        } catch (emailError) {
            console.error('Warning: Failed to send welcome email to ' + user.email, emailError);
            emailErrorMessage = emailError?.message || 'Unknown email error';
            // We intentionally do not throw an error here. 
            // The user account is already created, so we shouldn't fail the entire request just for a mailing issue.
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            emailSent: emailSent,
            emailErrorMessage,
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

        // Check for dependent records
        const dependencies = await checkUserDependencies(req.params.id);
        if (dependencies.hasDependencies) {
            return res.status(409).json({
                code: 'USER_HAS_DEPENDENCIES',
                message: `Cannot delete user. This user has related records in the system.`,
                details: dependencies,
            });
        }

        await User.deleteOne(req.params.id);

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to check user dependencies
async function checkUserDependencies(userId) {
    try {
        const { supabase } = await import('../config/db.js');

        // Check for stock transactions created by this user
        const { count: stockTxnCount } = await supabase
            .from('stock_transactions')
            .select('id', { count: 'exact', head: true })
            .eq('created_by', userId);

        // Check for purchases created by this user
        const { count: purchasesCount } = await supabase
            .from('purchases')
            .select('id', { count: 'exact', head: true })
            .eq('created_by', userId);

        // Check for inventory reports created or updated by this user
        const { count: reportCreatedCount } = await supabase
            .from('inventory_reports')
            .select('id', { count: 'exact', head: true })
            .eq('created_by', userId);

        const { count: reportUpdatedCount } = await supabase
            .from('inventory_reports')
            .select('id', { count: 'exact', head: true })
            .eq('updated_by', userId);

        const hasDependencies =
            (stockTxnCount && stockTxnCount > 0) ||
            (purchasesCount && purchasesCount > 0) ||
            (reportCreatedCount && reportCreatedCount > 0) ||
            (reportUpdatedCount && reportUpdatedCount > 0);

        return {
            hasDependencies,
            stockTransactions: stockTxnCount || 0,
            purchases: purchasesCount || 0,
            inventoryReportsCreated: reportCreatedCount || 0,
            inventoryReportsUpdated: reportUpdatedCount || 0,
        };
    } catch (error) {
        console.error('Error checking user dependencies:', error);
        throw error;
    }
}

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

// @desc    Resend welcome email and reset password
// @route   POST /api/users/:id/resend-welcome
// @access  Private (Admin only)
export const resendWelcomeEmail = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const temporaryPassword = generateTemporaryPassword(16);

        await User.updateById(req.params.id, {
            password: temporaryPassword,
        });

        const emailHtml = getWelcomeEmailTemplate(user.name, user.role, user.email, temporaryPassword);
        await sendEmail({
            email: user.email,
            subject: 'Welcome Back to 7 Super City POS - Your Updated Login Details',
            html: emailHtml,
        });

        return res.status(200).json({
            message: `Welcome email resent successfully to ${user.email}`,
            emailSent: true,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
