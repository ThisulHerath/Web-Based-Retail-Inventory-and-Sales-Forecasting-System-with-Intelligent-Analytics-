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
import {
    validateUUIDParam,
    validateCreateSupplier,
    validateUpdateSupplier,
} from '../middleware/validators.js';

const router = express.Router();

router.use(protect);

// Stats endpoint (admin & manager)
router.get('/stats/summary', verifyRole('admin', 'manager'), getSupplierStats);

// CRUD (admin & manager can read/create/update; admin only can delete)
router.get('/', verifyRole('admin', 'manager'), getAllSuppliers);
router.post('/', verifyRole('admin', 'manager'), validateCreateSupplier, createSupplier);
router.get('/:id', verifyRole('admin', 'manager'), validateUUIDParam, getSupplierById);
router.put('/:id', verifyRole('admin', 'manager'), validateUUIDParam, validateUpdateSupplier, updateSupplier);
router.delete('/:id', verifyRole('admin'), validateUUIDParam, deleteSupplier);

export default router;
