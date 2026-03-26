import express from 'express';
import { body } from 'express-validator';
import { handleValidation } from '../middleware/validators.js';
import {
    PASSWORD_MIN_LENGTH,
    PASSWORD_MAX_LENGTH,
    checkPasswordBreached,
} from '../utils/passwordPolicy.js';

const router = express.Router();

router.post(
    '/password-check',
    body('password')
        .isString()
        .isLength({ min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH })
        .withMessage(`Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters`),
    handleValidation,
    async (req, res) => {
        try {
            const result = await checkPasswordBreached(req.body.password);
            return res.json({
                breached: result.breached,
                count: result.count,
                skipped: result.skipped || false,
            });
        } catch (error) {
            return res.status(503).json({
                message: 'Unable to check password breach status at this time.',
                code: 'PASSWORD_BREACH_CHECK_FAILED',
            });
        }
    }
);

export default router;
