import express from 'express';
import { protect } from '../middleware/auth.js';
import { verifyRole } from '../middleware/roleMiddleware.js';
import {
    stockIn,
    stockOut,
    getStockHistory,
    getAllTransactions,
} from '../controllers/stockController.js';
import {
    validateProductIdParam,
    validateStockMovement,
    validateStockOutMovement,
} from '../middleware/validators.js';

const router = express.Router();

// All stock routes require authentication and admin/manager role
router.use(protect);
router.use(verifyRole('admin', 'manager'));

// Stock management routes
router.post('/in', validateStockMovement, stockIn);
router.post('/out', validateStockOutMovement, stockOut);
router.get('/transactions', getAllTransactions);
router.get('/history/:productId', validateProductIdParam, getStockHistory);

export default router;
