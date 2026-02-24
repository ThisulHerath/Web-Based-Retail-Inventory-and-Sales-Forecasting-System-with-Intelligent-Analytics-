import Customer from '../models/Customer.js';
import Coupon from '../models/Coupon.js';
import jwt from 'jsonwebtoken';

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
            return res.status(400).json({ message: 'Please enter a valid Sri Lankan phone number (e.g., 07X XXXXXXX)' });
        }

        const customerExists = await Customer.findOne({ email });

        if (customerExists) {
            return res.status(400).json({ message: 'Customer already exists' });
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

        const customer = await Customer.findOne({ email });

        if (customer && (await customer.matchPassword(password))) {
            if (!customer.isActive) {
                return res.status(403).json({ message: 'Account is disabled' });
            }

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
    // Delete coupons belonging to the customer
    await supabase.from('coupons').delete().eq('customer_id', customerId);
    // Nullify customer_id on sales so sales history is preserved
    await supabase.from('sales').update({ customer_id: null }).eq('customer_id', customerId);
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
