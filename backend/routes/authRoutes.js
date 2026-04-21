import express from 'express';
import { login, changePassword } from '../controllers/authController.js';
import { validateLogin, validateChangePassword } from '../middleware/validators.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', validateLogin, login);
router.post('/change-password', protect, validateChangePassword, changePassword);

export default router;
