import express from 'express';
import { protect } from '../middleware/auth.js';
import { verifyRole } from '../middleware/roleMiddleware.js';
import {
    getAllPurchases,
    getPurchaseById,
    createPurchase,
    deletePurchase,
    getPurchaseStats,
} from '../controllers/purchaseController.js';

const router = express.Router();

router.use(protect);

// Stats endpoint
router.get('/stats/summary', verifyRole('admin', 'manager'), getPurchaseStats);

// Purchase routes
router.get('/', verifyRole('admin', 'manager'), getAllPurchases);
router.post('/', verifyRole('admin', 'manager'), createPurchase);
router.get('/:id', verifyRole('admin', 'manager'), getPurchaseById);
router.delete('/:id', verifyRole('admin'), deletePurchase);

export default router;
