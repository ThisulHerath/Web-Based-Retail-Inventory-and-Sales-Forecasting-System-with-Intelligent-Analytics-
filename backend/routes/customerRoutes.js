import express from 'express';
import {
    registerCustomer,
    loginCustomer,
    getCustomerProfile,
    getAllCustomers,
    getCustomerById,
    updateCustomer,
    updateCustomerProfile,
    verifyCustomerProfilePassword,
    deleteCustomerAccount,
    deleteCustomer,
    getCustomerStats,
} from '../controllers/customerController.js';
import { protect } from '../middleware/auth.js';
import { protectCustomer } from '../middleware/customerAuth.js';
import { verifyRole } from '../middleware/roleMiddleware.js';
import {
    validateLogin,
    validateUUIDParam,
    validateCustomerRegister,
    validateCustomerSelfProfileUpdate,
    validateCustomerPasswordVerification,
    validateCustomerAdminUpdate,
} from '../middleware/validators.js';

const router = express.Router();

// Public routes
router.post('/register', validateCustomerRegister, registerCustomer);
router.post('/login', validateLogin, loginCustomer);

// Customer self-service routes (uses customer auth)
router.get('/profile', protectCustomer, getCustomerProfile);
router.post('/profile/verify-password', protectCustomer, validateCustomerPasswordVerification, verifyCustomerProfilePassword);
router.put('/profile', protectCustomer, validateCustomerSelfProfileUpdate, updateCustomerProfile);
router.delete('/profile', protectCustomer, deleteCustomerAccount);

// Protected routes (Admin/Manager)
router.use(protect);
router.get('/', verifyRole('admin', 'manager', 'cashier'), getAllCustomers);
router.get('/stats/summary', verifyRole('admin', 'manager'), getCustomerStats);
router.get('/:id', verifyRole('admin', 'manager', 'cashier'), validateUUIDParam, getCustomerById);
router.put('/:id', verifyRole('admin', 'manager'), validateUUIDParam, validateCustomerAdminUpdate, updateCustomer);
router.delete('/:id', verifyRole('admin'), validateUUIDParam, deleteCustomer);

export default router;
