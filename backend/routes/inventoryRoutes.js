import express from 'express';
import {
    getAllInventory,
    getInventoryByProduct,
    getInventoryStats,
} from '../controllers/inventoryController.js';
import {
    createInventoryReport,
    deleteInventoryReport,
    getInventoryReportById,
    getInventoryReports,
    updateInventoryReport,
} from '../controllers/inventoryReportController.js';
import { protect } from '../middleware/auth.js';
import { verifyRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', verifyRole('admin', 'manager'), getAllInventory);
router.get('/stats/summary', verifyRole('admin', 'manager'), getInventoryStats);
router.get('/reports', verifyRole('admin', 'manager'), getInventoryReports);
router.post('/reports', verifyRole('admin', 'manager'), createInventoryReport);
router.get('/reports/:id', verifyRole('admin', 'manager'), getInventoryReportById);
router.put('/reports/:id', verifyRole('admin', 'manager'), updateInventoryReport);
router.delete('/reports/:id', verifyRole('admin', 'manager'), deleteInventoryReport);
router.get('/:productId', verifyRole('admin', 'manager'), getInventoryByProduct);

export default router;
