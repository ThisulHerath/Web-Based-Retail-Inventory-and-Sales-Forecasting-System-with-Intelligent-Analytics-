import express from 'express';
import {
    validateCoupon,
    getCustomerCoupons,
    generateCoupon,
} from '../controllers/couponController.js';
import { protect } from '../middleware/auth.js';
import { protectCustomer } from '../middleware/customerAuth.js';
import { verifyRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Admin/Cashier routes
router.post('/validate', protect, verifyRole('admin', 'manager', 'cashier'), validateCoupon);
router.post('/generate', protect, verifyRole('admin', 'manager'), generateCoupon);

// Customer portal routes
router.get('/my-coupons', protectCustomer, (req, res, next) => {
    req.params.id = req.customer._id;
    next();
}, getCustomerCoupons);

// Admin view coupons for specific customer
router.get('/customer/:id', protect, verifyRole('admin', 'manager', 'cashier'), getCustomerCoupons);

export default router;
