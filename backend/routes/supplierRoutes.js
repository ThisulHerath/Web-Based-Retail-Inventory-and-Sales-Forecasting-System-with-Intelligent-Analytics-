import express from 'express';
import { protect } from '../middleware/auth.js';
import { verifyRole } from '../middleware/roleMiddleware.js';
import {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierStats,
} from '../controllers/supplierController.js';

const router = express.Router();

router.use(protect);

// Stats endpoint (admin & manager)
router.get('/stats/summary', verifyRole('admin', 'manager'), getSupplierStats);

// CRUD (admin & manager can read/create/update; admin only can delete)
router.get('/', verifyRole('admin', 'manager'), getAllSuppliers);
router.post('/', verifyRole('admin', 'manager'), createSupplier);
router.get('/:id', verifyRole('admin', 'manager'), getSupplierById);
router.put('/:id', verifyRole('admin', 'manager'), updateSupplier);
router.delete('/:id', verifyRole('admin'), deleteSupplier);

export default router;
