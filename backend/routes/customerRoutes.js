import express from 'express';
import {
    registerCustomer,
    loginCustomer,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    updateCustomerProfile,
    deleteCustomerAccount,
    deleteCustomer,
    getCustomerStats,
} from '../controllers/customerController.js';
import { protect } from '../middleware/auth.js';
import { protectCustomer } from '../middleware/customerAuth.js';
import { verifyRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

// Customer self-service routes (uses customer auth)
router.put('/profile', protectCustomer, updateCustomerProfile);
router.delete('/profile', protectCustomer, deleteCustomerAccount);

// Protected routes (Admin/Manager)
router.use(protect);
router.get('/', verifyRole('admin', 'manager', 'cashier'), getAllCustomers);
router.get('/stats/summary', verifyRole('admin', 'manager'), getCustomerStats);
router.get('/:id', verifyRole('admin', 'manager', 'cashier'), getCustomerById);
router.put('/:id', verifyRole('admin', 'manager'), updateCustomer);
router.delete('/:id', verifyRole('admin'), deleteCustomer);

export default router;
