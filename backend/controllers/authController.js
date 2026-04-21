import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import {
    getLoginAttemptKey,
    getRetryAfterSeconds,
    isLoginBlocked,
    recordFailedLogin,
    recordSuccessfulLogin,
} from '../utils/loginThrottle.js';

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const attemptKey = getLoginAttemptKey(req, email, 'staff');

        if (isLoginBlocked(attemptKey, 'staff')) {
            const retryAfter = getRetryAfterSeconds(attemptKey);
            if (retryAfter) {
                res.set('Retry-After', String(retryAfter));
            }
            return res.status(429).json({
                message: 'Too many failed login attempts. Please try again later.',
                code: 'AUTH_LOCKED',
                retryAfterSeconds: retryAfter,
            });
        }

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            recordFailedLogin(attemptKey, 'staff');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            recordFailedLogin(attemptKey, 'staff');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Account has been disabled by the admin' });
        }

        recordSuccessfulLogin(attemptKey);

        // Update last login date
        await User.updateLastLoginDate(user._id);

        const token = generateToken(user._id);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            mustChangePassword: user.mustChangePassword,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Change own password (staff)
// @route   POST /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        const isSameAsCurrent = await user.comparePassword(newPassword);
        if (isSameAsCurrent) {
            return res.status(400).json({ message: 'New password must be different from current password' });
        }

        await User.updateById(user._id, {
            password: newPassword,
            passwordChangeRequired: false,
        });

        return res.status(200).json({
            message: 'Password changed successfully',
            mustChangePassword: false,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
