import express from 'express';
import { protect } from '../middleware/auth.js';
import { verifyRole } from '../middleware/roleMiddleware.js';
import {
    getAllSales,
    getSaleById,
    createSale,
    updateSale,
    deleteSale,
    getSalesStats,
} from '../controllers/salesController.js';

const router = express.Router();

// All sales routes require authentication
router.use(protect);

// Sales statistics (all authenticated users)
router.get('/stats/summary', getSalesStats);

// Sales CRUD routes
router
    .route('/')
    .get(getAllSales) // All roles can view
    .post(createSale); // All roles can create

router
    .route('/:id')
    .get(getSaleById) // All roles can view
    .put(verifyRole('admin', 'manager'), updateSale) // Only admin & manager can update
    .delete(verifyRole('admin'), deleteSale); // Only admin can delete

export default router;
