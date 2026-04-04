import express from 'express';
import { askAssistant } from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.js';
import { verifyRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Protect the route using the auth middleware and restrict it to admin and manager roles
router.post('/', protect, verifyRole('admin', 'manager'), askAssistant);

export default router;
