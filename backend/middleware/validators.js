import { body, param, validationResult } from 'express-validator';

const srilankaPhoneRegex = /^(?:0[1-9][0-9]{8}|\+?94[1-9][0-9]{8})$/;

export const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }

    return res.status(400).json({
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: errors.array().map((error) => ({
            field: error.path,
            message: error.msg,
        })),
    });
};

export const validateUUIDParam = [
    param('id').isUUID().withMessage('Invalid resource id format'),
    handleValidation,
];

export const validateCustomerUUIDParam = [
    param('customerId').isUUID().withMessage('Invalid customer id format'),
    handleValidation,
];

export const validateProductIdParam = [
    param('productId').isUUID().withMessage('Invalid product id format'),
    handleValidation,
];

export const validateLogin = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isString().notEmpty().withMessage('Password is required'),
    handleValidation,
];

export const validateCreateUser = [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'manager', 'cashier']).withMessage('Invalid role'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    handleValidation,
];

export const validateUpdateUser = [
    body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('role').optional().isIn(['admin', 'manager', 'cashier']).withMessage('Invalid role'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    handleValidation,
];

export const validateCreateProduct = [
    body('productName').trim().notEmpty().withMessage('Product name is required'),
    body('category').isUUID().withMessage('Valid category id is required'),
    body('costPrice').isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
    body('sellingPrice').isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
    body('minimumStockLevel').optional().isInt({ min: 0 }).withMessage('Minimum stock level must be 0 or more'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    body('sku').optional({ values: 'falsy' }).trim().isLength({ max: 50 }).withMessage('SKU must be less than 50 characters'),
    body('sellingPrice').custom((value, { req }) => {
        if (req.body.costPrice !== undefined && Number(value) < Number(req.body.costPrice)) {
            throw new Error('Selling price must be greater than or equal to cost price');
        }
        return true;
    }),
    handleValidation,
];

export const validateUpdateProduct = [
    body('productName').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
    body('category').optional().isUUID().withMessage('Valid category id is required'),
    body('costPrice').optional().isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
    body('sellingPrice').optional().isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
    body('minimumStockLevel').optional().isInt({ min: 0 }).withMessage('Minimum stock level must be 0 or more'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    body('sku').optional({ values: 'falsy' }).trim().isLength({ max: 50 }).withMessage('SKU must be less than 50 characters'),
    body('sellingPrice').optional().custom((value, { req }) => {
        if (req.body.costPrice !== undefined && Number(value) < Number(req.body.costPrice)) {
            throw new Error('Selling price must be greater than or equal to cost price');
        }
        return true;
    }),
    handleValidation,
];

export const validateCreateSupplier = [
    body('supplierName').trim().notEmpty().withMessage('Supplier name is required'),
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('email').trim().notEmpty().withMessage('Email is required').bail().isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required').bail().matches(srilankaPhoneRegex).withMessage('Valid Sri Lankan phone number is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    handleValidation,
];

export const validateUpdateSupplier = [
    body('supplierName').optional().trim().notEmpty().withMessage('Supplier name cannot be empty'),
    body('email').optional({ values: 'falsy' }).isEmail().withMessage('Valid email is required'),
    body('phone').optional({ values: 'falsy' }).matches(srilankaPhoneRegex).withMessage('Valid Sri Lankan phone number is required'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    handleValidation,
];

export const validateCustomerRegister = [
    body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
    body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional({ values: 'falsy' }).matches(srilankaPhoneRegex).withMessage('Valid Sri Lankan phone number is required'),
    handleValidation,
];

export const validateCustomerProfileUpdate = [
    body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phone').optional({ values: 'falsy' }).matches(srilankaPhoneRegex).withMessage('Valid Sri Lankan phone number is required'),
    handleValidation,
];

export const validateCustomerPasswordVerification = [
    body('previousPassword').trim().notEmpty().withMessage('Current password is required'),
    handleValidation,
];

export const validateCustomerSelfProfileUpdate = [
    body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phone').optional({ values: 'falsy' }).matches(srilankaPhoneRegex).withMessage('Valid Sri Lankan phone number is required'),
    body('previousPassword').trim().notEmpty().withMessage('Current password is required'),
    body('newPassword').optional({ values: 'falsy' }).isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    body('confirmNewPassword').optional({ values: 'falsy' }).custom((value, { req }) => {
        if (req.body.newPassword && value !== req.body.newPassword) {
            throw new Error('Confirm password must match new password');
        }
        return true;
    }),
    handleValidation,
];

export const validateCustomerAdminUpdate = [
    ...validateCustomerProfileUpdate.slice(0, -1),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    body('loyaltyPoints').optional().isInt({ min: 0 }).withMessage('Loyalty points must be a non-negative integer'),
    handleValidation,
];

export const validateSaleCreate = [
    body('customerName').trim().notEmpty().withMessage('Customer name is required'),
    body('customerId').optional({ values: 'falsy' }).isUUID().withMessage('Customer id must be a valid UUID'),
    body('paymentMethod').isIn(['Cash', 'Card', 'Other']).withMessage('Payment method must be Cash, Card, or Other'),
    body('items').isArray({ min: 1 }).withMessage('At least one sale item is required'),
    body('items.*.productId').optional({ values: 'falsy' }).isUUID().withMessage('Item product id must be a valid UUID'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Item quantity must be at least 1'),
    body('items.*.total').isFloat({ min: 0 }).withMessage('Item total must be a non-negative number'),
    handleValidation,
];

export const validateSaleUpdate = [
    body('customerName').optional().trim().notEmpty().withMessage('Customer name cannot be empty'),
    body('paymentMethod').optional().isIn(['Cash', 'Card', 'Other']).withMessage('Payment method must be Cash, Card, or Other'),
    body('items').optional().isArray({ min: 1 }).withMessage('At least one sale item is required'),
    body('items.*.productId').optional({ values: 'falsy' }).isUUID().withMessage('Item product id must be a valid UUID'),
    body('items.*.quantity').optional().isInt({ min: 1 }).withMessage('Item quantity must be at least 1'),
    body('items.*.total').optional().isFloat({ min: 0 }).withMessage('Item total must be a non-negative number'),
    handleValidation,
];

export const validateStockMovement = [
    body('productId').isUUID().withMessage('Valid product id is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters'),
    handleValidation,
];

export const validateCreateFeedback = [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment')
        .trim()
        .isLength({ min: 5, max: 500 })
        .withMessage('Feedback comment must be between 5 and 500 characters'),
    handleValidation,
];

export const validateFeedbackStatusUpdate = [
    body('status')
        .isIn(['pending', 'approved', 'rejected'])
        .withMessage('Status must be pending, approved, or rejected'),
    handleValidation,
];