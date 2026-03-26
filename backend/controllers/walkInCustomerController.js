import WalkInCustomer from '../models/WalkInCustomer.js';
import Customer from '../models/Customer.js';

// Sri Lankan phone number validation
const isValidSLPhone = (phone) => {
    if (!phone) return false;
    const cleaned = phone.replace(/[\s\-()]/g, '');
    // Matches: 07XXXXXXXX (10 digits) or +947XXXXXXXX (12 chars) or 947XXXXXXXX (11 digits)
    return /^(?:0[1-9][0-9]{8}|\+?94[1-9][0-9]{8})$/.test(cleaned);
};

export const getAllWalkInCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const query = { search };

        const customers = await WalkInCustomer.find(query, {
            limit: Number(limit),
            skip: (Number(page) - 1) * Number(limit),
        });
        const count = await WalkInCustomer.countDocuments(query);

        res.status(200).json({
            customers,
            totalPages: Math.ceil(count / Number(limit)),
            currentPage: Number(page),
            totalCustomers: count,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getWalkInCustomerById = async (req, res) => {
    try {
        const customer = await WalkInCustomer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Walk-in customer not found' });
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getWalkInCustomerByPhone = async (req, res) => {
    try {
        const phone = req.params.phone;
        if (!isValidSLPhone(phone)) {
            return res.status(400).json({ message: 'Invalid phone number format. Use Sri Lankan format (e.g., 07X XXXXXXX)' });
        }

        const customer = await WalkInCustomer.findOne({ phone });
        if (!customer) return res.status(404).json({ message: 'Walk-in customer not found' });
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createWalkInCustomer = async (req, res) => {
    try {
        const { fullName, phone, email, address } = req.body;

        if (!fullName || !phone) {
            return res.status(400).json({ message: 'fullName and phone are required' });
        }
        if (!isValidSLPhone(phone)) {
            return res.status(400).json({ message: 'Invalid phone number format. Use Sri Lankan format (e.g., 07X XXXXXXX)' });
        }

        const existing = await WalkInCustomer.findOne({ phone });
        if (existing) {
            return res.status(400).json({ message: 'Walk-in customer with this phone already exists' });
        }

        const registeredCustomer = await Customer.findByPhone(phone);
        if (registeredCustomer) {
            return res.status(400).json({ message: 'This phone number is already registered as a customer' });
        }

        const customer = await WalkInCustomer.create({
            fullName: fullName.trim(),
            phone: phone.trim(),
            email: email?.trim(),
            address: address?.trim(),
        });

        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateWalkInCustomer = async (req, res) => {
    try {
        const existing = await WalkInCustomer.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Walk-in customer not found' });
        }

        const updates = {};
        if (req.body.fullName !== undefined) updates.fullName = req.body.fullName.trim();
        if (req.body.phone !== undefined) {
            if (!isValidSLPhone(req.body.phone)) {
                return res.status(400).json({ message: 'Invalid phone number format. Use Sri Lankan format (e.g., 07X XXXXXXX)' });
            }
            updates.phone = req.body.phone.trim();

            const withPhone = await WalkInCustomer.findOne({ phone: updates.phone });
            if (withPhone && String(withPhone.id) !== String(req.params.id)) {
                return res.status(400).json({ message: 'Another walk-in customer already uses this phone' });
            }

            const registeredCustomer = await Customer.findByPhone(updates.phone);
            if (registeredCustomer) {
                return res.status(400).json({ message: 'This phone number is already registered as a customer' });
            }
        }
        if (req.body.email !== undefined) updates.email = req.body.email?.trim() || null;
        if (req.body.address !== undefined) updates.address = req.body.address?.trim() || null;
        if (req.body.isActive !== undefined) updates.isActive = Boolean(req.body.isActive);

        const updated = await WalkInCustomer.updateById(req.params.id, updates);
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateWalkInLoyaltyPoints = async (req, res) => {
    try {
        const { loyaltyPoints } = req.body;
        const nextPoints = Number(loyaltyPoints);
        if (!Number.isInteger(nextPoints) || nextPoints < 0) {
            return res.status(400).json({ message: 'loyaltyPoints must be a non-negative integer' });
        }

        const existing = await WalkInCustomer.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Walk-in customer not found' });
        }

        const updated = await WalkInCustomer.updateById(req.params.id, { loyaltyPoints: nextPoints });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteWalkInCustomer = async (req, res) => {
    try {
        const existing = await WalkInCustomer.findById(req.params.id);
        if (!existing) {
            return res.status(404).json({ message: 'Walk-in customer not found' });
        }

        await WalkInCustomer.deleteOne(req.params.id);
        res.status(200).json({ message: 'Walk-in customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
