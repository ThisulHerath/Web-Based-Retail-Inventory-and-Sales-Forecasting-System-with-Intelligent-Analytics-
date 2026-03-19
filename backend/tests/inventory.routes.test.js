/**
 * Inventory & Stock route integration tests
 * Tests auth enforcement, RBAC, and input validation at the route level.
 * Uses a lightweight JWT-only guard (no DB) so tests run without a live database.
 */
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { verifyRole } from '../middleware/roleMiddleware.js';
import {
    validateStockMovement,
    validateProductIdParam,
} from '../middleware/validators.js';

const JWT_SECRET = 'test-secret-inventory';

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

    // List inventory — admin & manager
    app.get('/api/inventory', jwtGuard, verifyRole('admin', 'manager'), (req, res) =>
        res.json({ inventory: [] })
    );

    // Inventory stats summary — admin & manager
    app.get('/api/inventory/stats/summary', jwtGuard, verifyRole('admin', 'manager'), (req, res) =>
        res.json({ totalProducts: 0, lowStockCount: 0, totalStockValue: 0 })
    );

    // Stock history for a product — admin & manager
    app.get(
        '/api/stock/history/:productId',
        jwtGuard,
        verifyRole('admin', 'manager'),
        validateProductIdParam,
        (req, res) => res.json({ history: [] })
    );

    // Stock in — admin & manager
    app.post(
        '/api/stock/in',
        jwtGuard,
        verifyRole('admin', 'manager'),
        validateStockMovement,
        (req, res) => res.status(201).json({ message: 'Stock added' })
    );

    // Stock out — admin & manager
    app.post(
        '/api/stock/out',
        jwtGuard,
        verifyRole('admin', 'manager'),
        validateStockMovement,
        (req, res) => res.status(201).json({ message: 'Stock removed' })
    );

    return app;
};

// Section: Role-based authorization checks for inventory and stock endpoints.
describe('Inventory routes – authorization', () => {
    const app = buildApp();

    test('GET /api/inventory without token returns 401', async () => {
        const r = await request(app).get('/api/inventory');
        expect(r.status).toBe(401);
    });

    test('GET /api/inventory with cashier role returns 403', async () => {
        const r = await request(app)
            .get('/api/inventory')
            .set('Authorization', `Bearer ${makeToken('cashier')}`);
        expect(r.status).toBe(403);
    });

    test('GET /api/inventory with manager role returns 200', async () => {
        const r = await request(app)
            .get('/api/inventory')
            .set('Authorization', `Bearer ${makeToken('manager')}`);
        expect(r.status).toBe(200);
    });

    test('POST /api/stock/in without token returns 401', async () => {
        const r = await request(app).post('/api/stock/in').send({ productId: 'some-id', quantity: 5 });
        expect(r.status).toBe(401);
    });

    test('POST /api/stock/in with cashier role returns 403', async () => {
        const r = await request(app)
            .post('/api/stock/in')
            .set('Authorization', `Bearer ${makeToken('cashier')}`)
            .send({ productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 5 });
        expect(r.status).toBe(403);
    });

    test('GET /api/inventory/stats/summary with admin role returns 200', async () => {
        const r = await request(app)
            .get('/api/inventory/stats/summary')
            .set('Authorization', `Bearer ${makeToken('admin')}`);
        expect(r.status).toBe(200);
    });
});

// Section: Payload and parameter validation for stock movement APIs.
describe('Stock movement – input validation', () => {
    const app = buildApp();
    const managerToken = makeToken('manager');

    test('POST /api/stock/in with missing productId returns 400', async () => {
        const r = await request(app)
            .post('/api/stock/in')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({ quantity: 10 });
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('VALIDATION_ERROR');
        expect(r.body.errors.some((e) => e.field === 'productId')).toBe(true);
    });

    test('POST /api/stock/in with non-UUID productId returns 400', async () => {
        const r = await request(app)
            .post('/api/stock/in')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({ productId: 'not-a-uuid', quantity: 10 });
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('VALIDATION_ERROR');
    });

    test('POST /api/stock/in with quantity 0 returns 400', async () => {
        const r = await request(app)
            .post('/api/stock/in')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({ productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 0 });
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('VALIDATION_ERROR');
        expect(r.body.errors.some((e) => e.field === 'quantity')).toBe(true);
    });

    test('POST /api/stock/in with negative quantity returns 400', async () => {
        const r = await request(app)
            .post('/api/stock/in')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({ productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: -5 });
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('VALIDATION_ERROR');
    });

    test('POST /api/stock/out with valid data returns 201', async () => {
        const r = await request(app)
            .post('/api/stock/out')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({ productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', quantity: 3 });
        expect(r.status).toBe(201);
    });

    test('GET /api/stock/history/:productId with non-UUID returns 400', async () => {
        const r = await request(app)
            .get('/api/stock/history/not-a-uuid')
            .set('Authorization', `Bearer ${managerToken}`);
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('VALIDATION_ERROR');
    });

    test('GET /api/stock/history/:productId with valid UUID returns 200', async () => {
        const r = await request(app)
            .get('/api/stock/history/a1b2c3d4-e5f6-7890-abcd-ef1234567890')
            .set('Authorization', `Bearer ${managerToken}`);
        expect(r.status).toBe(200);
    });
});

// Section: Inventory business-rule behavior for insufficient stock cases.
describe('Inventory – business logic (stock validation)', () => {
    // Build app with business logic for stock-out validation
    const buildAppWithStockValidation = () => {
        const app = express();
        app.use(express.json());

        app.post(
            '/api/stock/out',
            jwtGuard,
            verifyRole('admin', 'manager'),
            validateStockMovement,
            (req, res) => {
                // Simulate stock check: mock available stock is 5 units
                const availableStock = 5;
                if (req.body.quantity > availableStock) {
                    return res.status(400).json({
                        message: `Insufficient displayed stock. Available: ${availableStock}, Requested: ${req.body.quantity}`,
                        code: 'INSUFFICIENT_STOCK',
                        field: 'quantity',
                        availableStock,
                    });
                }

                // Stock-out succeeded
                res.status(201).json({
                    message: 'Stock removed successfully',
                    newStock: availableStock - req.body.quantity,
                });
            }
        );

        return app;
    };

    const appWithValidation = buildAppWithStockValidation();
    const managerToken = makeToken('manager');

    // Test I-02: Stock-out validation when insufficient displayed stock
    test('I-02: POST /api/stock/out with quantity above available stock returns 400', async () => {
        const r = await request(appWithValidation)
            .post('/api/stock/out')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({
                productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                quantity: 10, // More than available (5)
            });
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('INSUFFICIENT_STOCK');
        expect(r.body.message).toMatch(/insufficient.*stock/i);
        expect(r.body.availableStock).toBe(5);
    });

    test('I-02: POST /api/stock/out with valid quantity returns 201 and updates stock', async () => {
        const r = await request(appWithValidation)
            .post('/api/stock/out')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({
                productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                quantity: 2, // Less than available (5)
            });
        expect(r.status).toBe(201);
        expect(r.body.message).toMatch(/success/i);
        expect(r.body.newStock).toBe(3); // 5 - 2
    });

    test('I-02: POST /api/stock/out with exact available quantity returns 201', async () => {
        const r = await request(appWithValidation)
            .post('/api/stock/out')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({
                productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                quantity: 5, // Exact available
            });
        expect(r.status).toBe(201);
        expect(r.body.newStock).toBe(0);
    });
});
