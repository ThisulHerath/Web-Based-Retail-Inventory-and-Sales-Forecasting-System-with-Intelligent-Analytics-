import Customer from '../models/Customer.js';
import WalkInCustomer from '../models/WalkInCustomer.js';
import Coupon from '../models/Coupon.js';
import jwt from 'jsonwebtoken';
import {
    getLoginAttemptKey,
    getRetryAfterSeconds,
    isLoginBlocked,
    recordFailedLogin,
    recordSuccessfulLogin,
} from '../utils/loginThrottle.js';

// Sri Lankan phone number validation
const isValidSLPhone = (phone) => {
    if (!phone) return true; // phone is optional
    const cleaned = phone.replace(/[\s\-()]/g, '');
    // Matches: 07XXXXXXXX (10 digits) or +947XXXXXXXX (12 chars) or 947XXXXXXXX (11 digits)
    return /^(?:0[1-9][0-9]{8}|\+?94[1-9][0-9]{8})$/.test(cleaned);
};

// Generate JWT for Customer
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.CUSTOMER_JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new customer
// @route   POST /api/customers/register
// @access  Public
export const registerCustomer = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body;

        if (phone && !isValidSLPhone(phone)) {
            return res.status(400).json({ 
                code: 'INVALID_PHONE',
                message: 'Please enter a valid Sri Lankan phone number (e.g., 07X XXXXXXX)' 
            });
        }

        const customerExists = await Customer.findOne({ email });

        if (customerExists) {
            return res.status(400).json({ 
                code: 'EMAIL_EXISTS',
                message: 'An account with this email already exists' 
            });
        }

        if (phone) {
            const phoneExists = await Customer.findByPhone(phone);
            if (phoneExists) {
                return res.status(400).json({ 
                    code: 'PHONE_EXISTS',
                    message: 'This phone number is already registered' 
                });
            }

            const walkInWithPhone = await WalkInCustomer.findOne({ phone });
            if (walkInWithPhone) {
                return res.status(400).json({ 
                    code: 'PHONE_EXISTS',
                    message: 'This phone number is already used by a walk-in customer' 
                });
            }
        }

        const customer = await Customer.create({
            firstName,
            lastName,
            email,
            phone,
            password,
        });

        if (customer) {
            // Auto-generate welcome coupon (5% off)
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1);

            await Coupon.create({
                discountType: 'Percentage',
                discountValue: 5,
                expiryDate,
                customer: customer._id,
            });

            res.status(201).json({
                _id: customer._id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
                loyaltyPoints: customer.loyaltyPoints,
                token: generateToken(customer._id),
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login customer
// @route   POST /api/customers/login
// @access  Public
export const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;
        const attemptKey = getLoginAttemptKey(req, email, 'customer');

        if (isLoginBlocked(attemptKey, 'customer')) {
            const retryAfter = getRetryAfterSeconds(attemptKey);
            if (retryAfter) {
                res.set('Retry-After', String(retryAfter));
            }
            return res.status(429).json({
                message: 'Too many failed login attempts. Please try again later.',
                code: 'AUTH_LOCKED',
                retryAfterSeconds: retryAfter,
            });
        }

        const customer = await Customer.findOne({ email });

        if (customer && (await customer.matchPassword(password))) {
            if (!customer.isActive) {
                return res.status(403).json({ message: 'Account is disabled' });
            }

            recordSuccessfulLogin(attemptKey);

            res.json({
                _id: customer._id,
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phone: customer.phone,
                loyaltyPoints: customer.loyaltyPoints,
                token: generateToken(customer._id),
            });
        } else {
            recordFailedLogin(attemptKey, 'customer');
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all customers (Admin/Manager)
// @route   GET /api/customers
// @access  Private
export const getAllCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        let query = {};
        if (search) {
            query = {
                $or: [
                    { firstName: { $regex: search } },
                    { lastName: { $regex: search } },
                    { email: { $regex: search } },
                ],
            };
        }

        const customers = await Customer.find(query, {
            excludePassword: true,
            limit: Number(limit),
            skip: (Number(page) - 1) * Number(limit),
        });

        const count = await Customer.countDocuments(query);

        res.json({
            customers,
            totalPages: Math.ceil(count / Number(limit)),
            currentPage: page,
            totalCustomers: count,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Private
export const getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        // Remove password from response
        const { password, ...customerData } = customer.toJSON ? customer.toJSON() : customer;
        res.json(customerData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
export const updateCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (customer) {
            if (req.body.phone && !isValidSLPhone(req.body.phone)) {
                return res.status(400).json({ message: 'Please enter a valid Sri Lankan phone number (e.g., 07X XXXXXXX)' });
            }

            const updates = {};
            updates.firstName = req.body.firstName || customer.firstName;
            updates.lastName = req.body.lastName || customer.lastName;
            updates.phone = req.body.phone || customer.phone;
            updates.isActive = req.body.isActive !== undefined ? req.body.isActive : customer.isActive;

            if (req.body.loyaltyPoints !== undefined) {
                updates.loyaltyPoints = req.body.loyaltyPoints;
            }

            const updatedCustomer = await Customer.updateById(req.params.id, updates);
            res.json({
                _id: updatedCustomer._id,
                firstName: updatedCustomer.firstName,
                lastName: updatedCustomer.lastName,
                email: updatedCustomer.email,
                phone: updatedCustomer.phone,
                isActive: updatedCustomer.isActive,
                loyaltyPoints: updatedCustomer.loyaltyPoints,
            });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get own profile (Customer)
// @route   GET /api/customers/profile
// @access  Private (Customer)
export const getCustomerProfile = async (req, res) => {
    try {
        const customerId = req.customer._id || req.customer.id;
        const customer = await Customer.findById(customerId);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        res.json({
            _id: customer._id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            isActive: customer.isActive,
            loyaltyPoints: customer.loyaltyPoints,
            totalPurchases: customer.totalPurchases,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify current password before allowing profile edits
// @route   POST /api/customers/profile/verify-password
// @access  Private (Customer)
export const verifyCustomerProfilePassword = async (req, res) => {
    try {
        const customerId = req.customer._id || req.customer.id;
        const customer = await Customer.findById(customerId);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const isPasswordValid = await customer.matchPassword(req.body.previousPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        return res.json({ verified: true, message: 'Password verified' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Update own profile (Customer self-update)
// @route   PUT /api/customers/profile
// @access  Private (Customer)
export const updateCustomerProfile = async (req, res) => {
    try {
        const customerId = req.customer._id || req.customer.id;
        const customer = await Customer.findById(customerId);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const { previousPassword, newPassword, confirmNewPassword } = req.body;

        const isPasswordValid = await customer.matchPassword(previousPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const updates = {};
        if (req.body.firstName !== undefined) updates.firstName = req.body.firstName;
        if (req.body.lastName !== undefined) updates.lastName = req.body.lastName;
        if (req.body.email !== undefined) {
            // Check if email is already taken by another customer
            const existing = await Customer.findOne({ email: req.body.email });
            if (existing && String(existing._id) !== String(customerId)) {
                return res.status(400).json({ message: 'Email is already in use by another account' });
            }
            updates.email = req.body.email;
        }
        if (req.body.phone !== undefined) {
            if (req.body.phone && !isValidSLPhone(req.body.phone)) {
                return res.status(400).json({ message: 'Please enter a valid Sri Lankan phone number (e.g., 07X XXXXXXX)' });
            }
            updates.phone = req.body.phone;
        }

        if (confirmNewPassword && !newPassword) {
            return res.status(400).json({ message: 'New password is required when confirmation is provided' });
        }

        if (newPassword) {
            if (newPassword !== confirmNewPassword) {
                return res.status(400).json({ message: 'New password and confirmation do not match' });
            }
            updates.password = newPassword;
        }

        const updatedCustomer = await Customer.updateById(customerId, updates);
        res.json({
            _id: updatedCustomer._id,
            firstName: updatedCustomer.firstName,
            lastName: updatedCustomer.lastName,
            email: updatedCustomer.email,
            phone: updatedCustomer.phone,
            isActive: updatedCustomer.isActive,
            loyaltyPoints: updatedCustomer.loyaltyPoints,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper: delete related records before deleting a customer
const deleteCustomerRelatedData = async (customerId) => {
    const { supabase } = await import('../config/db.js');

    // Find customer coupon ids so we can detach sales.coupon_used references first.
    const { data: customerCoupons, error: couponFetchError } = await supabase
        .from('coupons')
        .select('id')
        .eq('customer_id', customerId);
    if (couponFetchError) {
        throw new Error(`Failed to fetch customer coupons: ${couponFetchError.message}`);
    }

    const couponIds = (customerCoupons || []).map((coupon) => coupon.id);
    if (couponIds.length > 0) {
        const { error: salesCouponUnlinkError } = await supabase
            .from('sales')
            .update({ coupon_used: null })
            .in('coupon_used', couponIds);
        if (salesCouponUnlinkError) {
            throw new Error(`Failed to unlink coupons from sales: ${salesCouponUnlinkError.message}`);
        }
    }

    // Delete coupons belonging to the customer
    const { error: couponDeleteError } = await supabase
        .from('coupons')
        .delete()
        .eq('customer_id', customerId);
    if (couponDeleteError) {
        throw new Error(`Failed to delete customer coupons: ${couponDeleteError.message}`);
    }

    // Nullify customer_id on sales so sales history is preserved
    const { error: salesUpdateError } = await supabase
        .from('sales')
        .update({ customer_id: null })
        .eq('customer_id', customerId);
    if (salesUpdateError) {
        throw new Error(`Failed to unlink customer from sales: ${salesUpdateError.message}`);
    }
};

// @desc    Delete own account (Customer self-delete)
// @route   DELETE /api/customers/profile
// @access  Private (Customer)
export const deleteCustomerAccount = async (req, res) => {
    try {
        const customerId = req.customer._id || req.customer.id;
        const customer = await Customer.findById(customerId);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        await deleteCustomerRelatedData(customerId);
        await Customer.deleteOne(customerId);
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin only)
export const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        await deleteCustomerRelatedData(req.params.id);
        await Customer.deleteOne(req.params.id);
        res.json({ message: 'Customer removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get customer statistics
// @route   GET /api/customers/stats/summary
// @access  Private
export const getCustomerStats = async (req, res) => {
    try {
        const totalCustomers = await Customer.countDocuments();
        const activeCustomers = await Customer.countDocuments({ isActive: true });

        const pointsResult = await Customer.aggregate([
            { $group: { _id: null, totalPoints: { $sum: '$loyaltyPoints' } } }
        ]);
        const totalPoints = pointsResult.length > 0 ? pointsResult[0].totalPoints : 0;

        res.json({ totalCustomers, activeCustomers, totalPoints });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
