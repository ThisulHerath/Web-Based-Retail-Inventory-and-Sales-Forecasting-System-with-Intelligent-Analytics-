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
    getSalesAnalytics,
    exportSaleAsPDF,
    exportSalesAsExcel,
    getSaleAuditTrail,
    getAllSalesAuditLogs,
} from '../controllers/salesController.js';
import {
    validateUUIDParam,
    validateSaleCreate,
    validateSaleUpdate,
} from '../middleware/validators.js';

const router = express.Router();

// All sales routes require authentication
router.use(protect);

// Sales statistics (all authenticated users)
router.get('/stats/summary', getSalesStats);

// Sales analytics (charts + top products)
router.get('/analytics', getSalesAnalytics);

// Export routes
router.get('/export/excel', exportSalesAsExcel); // Export all sales as Excel
router.get('/:id/export/pdf', validateUUIDParam, exportSaleAsPDF); // Export single invoice as PDF

// Audit trail routes
router.get('/audit/all', verifyRole('admin'), getAllSalesAuditLogs); // View all audit logs
router.get('/:id/audit', validateUUIDParam, verifyRole('admin', 'manager'), getSaleAuditTrail); // View audit for specific sale

// Sales CRUD routes
router
    .route('/')
    .get(getAllSales) // All roles can view
    .post(validateSaleCreate, createSale); // All roles can create

router
    .route('/:id')
    .get(validateUUIDParam, getSaleById) // All roles can view
    .put(validateUUIDParam, verifyRole('admin', 'manager'), validateSaleUpdate, updateSale) // Only admin & manager can update
    .delete(validateUUIDParam, verifyRole('admin'), deleteSale); // Only admin can delete

export default router;
