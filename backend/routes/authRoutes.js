import express from 'express';
import { login } from '../controllers/authController.js';
import { validateLogin } from '../middleware/validators.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', validateLogin, login);

export default router;
