import express from 'express';
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/auth.js';
import { verifyRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public route (no authentication required)
router.get('/', getAllCategories);

// All routes below require authentication
router.use(protect);

router.get('/:id', verifyRole('admin', 'manager'), getCategoryById);
router.post('/', verifyRole('admin', 'manager'), createCategory);
router.put('/:id', verifyRole('admin', 'manager'), updateCategory);
router.delete('/:id', verifyRole('admin'), deleteCategory);

export default router;
