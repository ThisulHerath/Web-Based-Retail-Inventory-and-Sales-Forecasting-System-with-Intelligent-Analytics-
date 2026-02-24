import Coupon from '../models/Coupon.js';
import Customer from '../models/Customer.js';

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private (Cashier, Manager, Admin)
export const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Coupon code is required' });
        }

        const coupon = await Coupon.findOnePopulated({ code, isUsed: false });

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid or already used coupon code' });
        }

        // Check expiry
        if (new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({ message: 'Coupon has expired' });
        }

        res.json({
            _id: coupon._id,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            customer: coupon.customer,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get coupons for a specific customer
// @route   GET /api/coupons/customer/:id
// @access  Private
export const getCustomerCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({ customer: req.params.id });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Manual generate coupon (Admin)
// @route   POST /api/coupons/generate
// @access  Private (Admin, Manager)
export const generateCoupon = async (req, res) => {
    try {
        const { customerId, discountType, discountValue, expiryDays } = req.body;

        const customer = await Customer.findById(customerId);
        if (!customer) return res.status(404).json({ message: 'Customer not found' });

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (expiryDays || 30));

        const coupon = await Coupon.create({
            customer: customerId,
            discountType: discountType || 'Percentage',
            discountValue: discountValue || 5,
            expiryDate,
        });

        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to auto-generate coupon based on loyalty points
export const autoGenerateLoyaltyCoupon = async (customerId) => {
    try {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30); // 30 days validity

        const coupon = await Coupon.create({
            customer: customerId,
            discountType: 'Percentage',
            discountValue: 5, // 5% discount
            expiryDate,
        });

        return coupon;
    } catch (error) {
        console.error('Error auto-generating coupon:', error);
    }
};
