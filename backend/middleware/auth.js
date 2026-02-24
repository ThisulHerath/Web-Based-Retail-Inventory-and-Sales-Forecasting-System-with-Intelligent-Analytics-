import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from Supabase (password is included in format but we remove it)
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // Exclude password from req.user
            const { password, comparePassword, toJSON, ...userData } = user;
            req.user = userData;

            if (!req.user.isActive) {
                return res.status(403).json({ message: 'Account is disabled. Please contact admin.' });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};
