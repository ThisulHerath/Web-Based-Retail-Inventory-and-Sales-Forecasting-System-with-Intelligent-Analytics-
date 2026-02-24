import jwt from 'jsonwebtoken';
import Customer from '../models/Customer.js';

export const protectCustomer = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.CUSTOMER_JWT_SECRET);

            const customer = await Customer.findById(decoded.id);

            if (!customer) {
                return res.status(401).json({ message: 'Customer not found' });
            }

            // Exclude password from req.customer
            const { password, matchPassword, toJSON, ...customerData } = customer;
            req.customer = customerData;

            if (!req.customer.isActive) {
                return res.status(403).json({ message: 'Account disabled' });
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
