import express from 'express';
import {
    getAllInventory,
    getInventoryByProduct,
    getInventoryStats,
} from '../controllers/inventoryController.js';
import { protect } from '../middleware/auth.js';
import { verifyRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', verifyRole('admin', 'manager'), getAllInventory);
router.get('/stats/summary', verifyRole('admin', 'manager'), getInventoryStats);
router.get('/:productId', verifyRole('admin', 'manager'), getInventoryByProduct);

export default router;
