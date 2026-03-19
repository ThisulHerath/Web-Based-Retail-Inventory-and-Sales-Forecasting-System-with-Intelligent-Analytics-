import express from 'express';
import { protect } from '../middleware/auth.js';
import { verifyRole } from '../middleware/roleMiddleware.js';
import { getAuditLogs, getAuditEntityTypes } from '../controllers/auditController.js';

const router = express.Router();

// All audit routes are admin-only
router.get('/', protect, verifyRole('admin'), getAuditLogs);
router.get('/entity-types', protect, verifyRole('admin'), getAuditEntityTypes);

export default router;
