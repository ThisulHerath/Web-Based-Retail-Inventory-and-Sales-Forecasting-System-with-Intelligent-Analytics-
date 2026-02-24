import express from 'express';
import { protect } from '../middleware/auth.js';
import { verifyRole } from '../middleware/roleMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getLowStockProducts,
} from '../controllers/productController.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getAllProducts);

// All routes below require authentication
router.use(protect);

// Low stock route (admin & manager) - must be before /:id
router.get('/low-stock/list', verifyRole('admin', 'manager'), getLowStockProducts);

// Public-accessible by id (but placed after protect so admin pages also work)
router.get('/:id', getProductById);

// Product CRUD routes (protected)
router
    .route('/')
    .post(verifyRole('admin', 'manager'), upload.single('productImage'), createProduct);

router
    .route('/:id')
    .put(verifyRole('admin', 'manager'), upload.single('productImage'), updateProduct)
    .delete(verifyRole('admin'), deleteProduct); // Only admin can delete

export default router;
