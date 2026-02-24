import express from 'express';
import { protect } from '../middleware/auth.js';
import { verifyRole } from '../middleware/roleMiddleware.js';
import {
    stockIn,
    stockOut,
    getStockHistory,
    getAllTransactions,
} from '../controllers/stockController.js';

const router = express.Router();

// All stock routes require authentication and admin/manager role
router.use(protect);
router.use(verifyRole('admin', 'manager'));

// Stock management routes
router.post('/in', stockIn);
router.post('/out', stockOut);
router.get('/transactions', getAllTransactions);
router.get('/history/:productId', getStockHistory);

export default router;
