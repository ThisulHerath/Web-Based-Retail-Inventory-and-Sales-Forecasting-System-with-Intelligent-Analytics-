import express from 'express';
import { protect } from '../middleware/auth.js';
import { verifyRole } from '../middleware/roleMiddleware.js';
import {
    getAllWalkInCustomers,
    getWalkInCustomerById,
    getWalkInCustomerByPhone,
    createWalkInCustomer,
    updateWalkInCustomer,
    updateWalkInLoyaltyPoints,
    deleteWalkInCustomer,
} from '../controllers/walkInCustomerController.js';

const router = express.Router();

router.use(protect);

router
    .route('/')
    .get(verifyRole('admin', 'manager', 'cashier'), getAllWalkInCustomers)
    .post(verifyRole('admin', 'manager', 'cashier'), createWalkInCustomer);

router.get('/phone/:phone', verifyRole('admin', 'manager', 'cashier'), getWalkInCustomerByPhone);

router
    .route('/:id')
    .get(verifyRole('admin', 'manager', 'cashier'), getWalkInCustomerById)
    .put(verifyRole('admin', 'manager', 'cashier'), updateWalkInCustomer)
    .delete(verifyRole('admin'), deleteWalkInCustomer);

router.patch('/:id/loyalty-points', verifyRole('admin', 'manager'), updateWalkInLoyaltyPoints);

export default router;
