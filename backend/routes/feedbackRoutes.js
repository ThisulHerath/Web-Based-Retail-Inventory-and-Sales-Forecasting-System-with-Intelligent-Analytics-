import express from 'express';
import {
    getPublicFeedbacks,
    getMyFeedbacks,
    submitFeedback,
    getFeedbacksByCustomer,
    updateFeedbackStatus,
    deleteFeedback,
} from '../controllers/feedbackController.js';
import { protect } from '../middleware/auth.js';
import { protectCustomer } from '../middleware/customerAuth.js';
import { verifyRole } from '../middleware/roleMiddleware.js';
import {
    validateUUIDParam,
    validateCustomerUUIDParam,
    validateCreateFeedback,
    validateFeedbackStatusUpdate,
} from '../middleware/validators.js';

const router = express.Router();

router.get('/public', getPublicFeedbacks);

router.get('/my', protectCustomer, getMyFeedbacks);
router.post('/', protectCustomer, validateCreateFeedback, submitFeedback);

router.get('/customer/:customerId', protect, verifyRole('admin', 'manager', 'cashier'), validateCustomerUUIDParam, getFeedbacksByCustomer);
router.patch('/:id/status', protect, verifyRole('admin', 'manager'), validateUUIDParam, validateFeedbackStatusUpdate, updateFeedbackStatus);
router.delete('/:id', protect, verifyRole('admin', 'manager'), validateUUIDParam, deleteFeedback);

export default router;
