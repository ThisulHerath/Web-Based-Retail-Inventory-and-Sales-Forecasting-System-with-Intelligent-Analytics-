import express from 'express';
import { protect } from '../middleware/auth.js';
import { verifyRole } from '../middleware/roleMiddleware.js';
import {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserStats,
} from '../controllers/userController.js';
import {
    validateUUIDParam,
    validateCreateUser,
    validateUpdateUser,
} from '../middleware/validators.js';

const router = express.Router();

// All user routes are protected and admin-only
router.use(protect);
router.use(verifyRole('admin'));

// User routes
router.route('/').get(getAllUsers).post(validateCreateUser, createUser);

router.route('/stats/summary').get(getUserStats);

router.route('/:id').put(validateUUIDParam, validateUpdateUser, updateUser).delete(validateUUIDParam, deleteUser);

export default router;
