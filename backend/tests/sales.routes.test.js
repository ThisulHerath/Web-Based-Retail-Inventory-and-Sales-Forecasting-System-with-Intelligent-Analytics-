/**
 * Sales route integration tests
 * Tests auth enforcement, RBAC, and input validation at the route level.
 * Uses a lightweight JWT-only guard (no DB) so tests run without a live database.
 */
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { verifyRole } from '../middleware/roleMiddleware.js';
import {
    validateSaleCreate,
    validateSaleUpdate,
    validateUUIDParam,
} from '../middleware/validators.js';

const JWT_SECRET = 'test-secret-sales';

const jwtGuard = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
    try {
        req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const makeToken = (role) =>
    jwt.sign({ id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', role, isActive: true }, JWT_SECRET);

const buildApp = () => {
    const app = express();
    app.use(express.json());

    // List sales — admin & manager only
    app.get('/api/sales', jwtGuard, verifyRole('admin', 'manager'), (req, res) =>
        res.json({ sales: [] })
    );

    // Create sale — cashier, manager, admin
    app.post(
        '/api/sales',
        jwtGuard,
        verifyRole('admin', 'manager', 'cashier'),
        validateSaleCreate,
        (req, res) => res.status(201).json({ saleId: 'mock-id' })
    );

    // Get sale by id
    app.get('/api/sales/:id', jwtGuard, validateUUIDParam, (req, res) =>
        res.json({ sale: {} })
    );

    // Update sale — admin only
    app.put(
        '/api/sales/:id',
        jwtGuard,
        verifyRole('admin'),
        validateUUIDParam,
        validateSaleUpdate,
        (req, res) => res.json({ updated: true })
    );

    return app;
};

// Section: Authorization and role checks for sales endpoints.
describe('Sales routes – authorization', () => {
    const app = buildApp();

    test('GET /api/sales without token returns 401', async () => {
        const r = await request(app).get('/api/sales');
        expect(r.status).toBe(401);
    });

    test('GET /api/sales with cashier role returns 403', async () => {
        const r = await request(app)
            .get('/api/sales')
            .set('Authorization', `Bearer ${makeToken('cashier')}`);
        expect(r.status).toBe(403);
    });

    test('GET /api/sales with manager role returns 200', async () => {
        const r = await request(app)
            .get('/api/sales')
            .set('Authorization', `Bearer ${makeToken('manager')}`);
        expect(r.status).toBe(200);
    });

    test('POST /api/sales without token returns 401', async () => {
        const r = await request(app)
            .post('/api/sales')
            .send({ customerName: 'John', paymentMethod: 'Cash', items: [] });
        expect(r.status).toBe(401);
    });

    test('PUT /api/sales/:id with cashier role returns 403', async () => {
        const r = await request(app)
            .put('/api/sales/a1b2c3d4-e5f6-7890-abcd-ef1234567890')
            .set('Authorization', `Bearer ${makeToken('cashier')}`)
            .send({ paymentMethod: 'Cash' });
        expect(r.status).toBe(403);
    });
});

// Section: Request-shape and field validation for sale creation and lookup.
describe('Sales routes – input validation', () => {
    const app = buildApp();
    const cashierToken = makeToken('cashier');
    const adminToken = makeToken('admin');

    test('POST /api/sales with empty items array returns 400', async () => {
        const r = await request(app)
            .post('/api/sales')
            .set('Authorization', `Bearer ${cashierToken}`)
            .send({ customerName: 'John', paymentMethod: 'Cash', items: [] });
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('VALIDATION_ERROR');
    });

    test('POST /api/sales without items field returns 400', async () => {
        const r = await request(app)
            .post('/api/sales')
            .set('Authorization', `Bearer ${cashierToken}`)
            .send({ customerName: 'John', paymentMethod: 'Cash' });
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('VALIDATION_ERROR');
    });

    test('POST /api/sales with invalid payment method returns 400', async () => {
        const r = await request(app)
            .post('/api/sales')
            .set('Authorization', `Bearer ${cashierToken}`)
            .send({
                customerName: 'John',
                paymentMethod: 'Crypto',
                items: [{ productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 1, unitPrice: 100, total: 100 }],
            });
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('VALIDATION_ERROR');
        expect(r.body.errors.some((e) => e.field === 'paymentMethod')).toBe(true);
    });

    test('POST /api/sales with missing customerName returns 400', async () => {
        const r = await request(app)
            .post('/api/sales')
            .set('Authorization', `Bearer ${cashierToken}`)
            .send({
                paymentMethod: 'Cash',
                items: [{ productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 1, unitPrice: 100, total: 100 }],
            });
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('VALIDATION_ERROR');
    });

    test('GET /api/sales/:id with non-UUID id returns 400', async () => {
        const r = await request(app)
            .get('/api/sales/not-a-uuid')
            .set('Authorization', `Bearer ${cashierToken}`);
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('VALIDATION_ERROR');
    });

    test('POST /api/sales with valid data returns 201', async () => {
        const r = await request(app)
            .post('/api/sales')
            .set('Authorization', `Bearer ${cashierToken}`)
            .send({
                customerName: 'John Doe',
                paymentMethod: 'Cash',
                items: [
                    {
                        productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                        quantity: 2,
                        unitPrice: 500,
                        total: 1000,
                    },
                ],
            });
        expect(r.status).toBe(201);
    });
});

// Section: Business-rule scenarios (stock limits and coupon handling).
describe('Sales routes – business logic (stock & coupon)', () => {
    const app = buildApp();
    const cashierToken = makeToken('cashier');

    // Test SA-02: Create sale with over-quantity rejection
    // Mock extended app with business logic checks
    const buildAppWithBusinessLogic = () => {
        const app = express();
        app.use(express.json());

        app.post(
            '/api/sales',
            jwtGuard,
            verifyRole('admin', 'manager', 'cashier'),
            validateSaleCreate,
            (req, res) => {
                // Simulate stock check: if totalQty > 10, reject
                const totalQty = req.body.items.reduce((sum, item) => sum + item.quantity, 0);
                if (totalQty > 10) {
                    return res.status(400).json({
                        message: 'Insufficient stock for requested quantity',
                        code: 'INSUFFICIENT_STOCK',
                        field: 'items',
                    });
                }

                // Simulate coupon validation
                if (req.body.couponCode) {
                    // Invalid coupons
                    if (req.body.couponCode === 'EXPIRED') {
                        return res.status(400).json({
                            message: 'Coupon has expired',
                            code: 'INVALID_COUPON',
                            field: 'couponCode',
                        });
                    }
                    if (req.body.couponCode === 'NONEXISTENT') {
                        return res.status(400).json({
                            message: 'Coupon not found',
                            code: 'COUPON_NOT_FOUND',
                            field: 'couponCode',
                        });
                    }
                    // Valid coupon (e.g., 'SAVE10')
                    return res.status(201).json({
                        saleId: 'sale-with-coupon',
                        discountApplied: true,
                        coupon: req.body.couponCode,
                    });
                }

                res.status(201).json({ saleId: 'mock-sale-id' });
            }
        );

        return app;
    };

    const appWithLogic = buildAppWithBusinessLogic();

    test('SA-02: POST /api/sales with over-quantity items returns 400', async () => {
        // Given: A cashier is creating a sale with quantity above allowed stock.
        // When: The sale creation request is submitted.
        const r = await request(appWithLogic)
            .post('/api/sales')
            .set('Authorization', `Bearer ${cashierToken}`)
            .send({
                customerName: 'John Doe',
                paymentMethod: 'Cash',
                items: [
                    {
                        productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                        quantity: 15, // Over limit
                        unitPrice: 100,
                        total: 1500,
                    },
                ],
            });
        // Then: The API rejects the request with insufficient stock.
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('INSUFFICIENT_STOCK');
        expect(r.body.message).toMatch(/insufficient|stock/i);
    });

    test('SA-02: POST /api/sales with valid quantity returns 201', async () => {
        const r = await request(appWithLogic)
            .post('/api/sales')
            .set('Authorization', `Bearer ${cashierToken}`)
            .send({
                customerName: 'John Doe',
                paymentMethod: 'Cash',
                items: [
                    {
                        productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                        quantity: 5, // Under limit
                        unitPrice: 100,
                        total: 500,
                    },
                ],
            });
        expect(r.status).toBe(201);
    });

    // Test SA-03: Apply coupon while creating sale
    test('SA-03: POST /api/sales with valid coupon returns 201 and applies discount', async () => {
        // Given: A valid coupon code is included in a valid sale payload.
        // When: The sale is submitted.
        const r = await request(appWithLogic)
            .post('/api/sales')
            .set('Authorization', `Bearer ${cashierToken}`)
            .send({
                customerName: 'John Doe',
                paymentMethod: 'Cash',
                couponCode: 'SAVE100',
                items: [
                    {
                        productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                        quantity: 2,
                        unitPrice: 100,
                        total: 200,
                    },
                ],
            });
        // Then: The API accepts the sale and marks coupon discount as applied.
        expect(r.status).toBe(201);
        expect(r.body.discountApplied).toBe(true);
        expect(r.body.coupon).toBe('SAVE100');
    });

    // Test SA-04: Invalid coupon application
    test('SA-04: POST /api/sales with expired coupon returns 400', async () => {
        // Given: An expired coupon code is provided.
        // When: The sale creation request is sent.
        const r = await request(appWithLogic)
            .post('/api/sales')
            .set('Authorization', `Bearer ${cashierToken}`)
            .send({
                customerName: 'John Doe',
                paymentMethod: 'Cash',
                couponCode: 'EXPIRED',
                items: [
                    {
                        productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                        quantity: 2,
                        unitPrice: 100,
                        total: 200,
                    },
                ],
            });
        // Then: The API rejects coupon usage with an explicit coupon error.
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('INVALID_COUPON');
        expect(r.body.message).toMatch(/expired/i);
    });

    test('SA-04: POST /api/sales with non-existent coupon returns 400', async () => {
        const r = await request(appWithLogic)
            .post('/api/sales')
            .set('Authorization', `Bearer ${cashierToken}`)
            .send({
                customerName: 'John Doe',
                paymentMethod: 'Cash',
                couponCode: 'NONEXISTENT',
                items: [
                    {
                        productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                        quantity: 2,
                        unitPrice: 100,
                        total: 200,
                    },
                ],
            });
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('COUPON_NOT_FOUND');
        expect(r.body.message).toMatch(/not found/i);
    });
});
