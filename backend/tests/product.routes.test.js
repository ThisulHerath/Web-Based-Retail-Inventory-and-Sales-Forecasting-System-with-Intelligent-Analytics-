/**
 * Product route integration tests
 * Tests auth enforcement, RBAC, validation, and business logic at the route level.
 * Uses a lightweight JWT-only guard (no DB) so tests run without a live database.
 */
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { verifyRole } from '../middleware/roleMiddleware.js';
import {
    validateCreateProduct,
    validateUpdateProduct,
    validateUUIDParam,
} from '../middleware/validators.js';

const JWT_SECRET = 'test-secret-products';

// Lightweight auth middleware — verifies JWT only (no DB lookup)
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

// Mock product controller
const mockProductController = {
    getAllProducts: (req, res) => res.json({ products: [] }),
    getProductById: (req, res) => res.json({ product: {} }),
    createProduct: (req, res) => res.status(201).json({ productId: 'mock-id', message: 'Product created' }),
    updateProduct: (req, res) => res.json({ updated: true }),
    deleteProduct: (req, res) => res.json({ deleted: true }),
    getLowStockProducts: (req, res) => res.json({ lowStockProducts: [] }),
};

// Build a mini Express app that mirrors real product-route structure
const buildApp = () => {
    const app = express();
    app.use(express.json());

    // Public routes (no authentication required)
    app.get('/api/products', mockProductController.getAllProducts);

    // All routes below require authentication
    app.use(jwtGuard);

    // Low stock route (admin & manager) - must be before /:id
    app.get('/api/products/low-stock/list', verifyRole('admin', 'manager'), mockProductController.getLowStockProducts);

    // Public-accessible by id (but placed after protect so admin pages also work)
    app.get('/api/products/:id', validateUUIDParam, mockProductController.getProductById);

    // Product CRUD routes (protected)
    app.post('/api/products', verifyRole('admin', 'manager'), validateCreateProduct, mockProductController.createProduct);
    app.put('/api/products/:id', verifyRole('admin', 'manager'), validateUUIDParam, validateUpdateProduct, mockProductController.updateProduct);
    app.delete('/api/products/:id', verifyRole('admin'), validateUUIDParam, mockProductController.deleteProduct);

    return app;
};

// Section: Authorization and validation checks for product routes.
describe('Product routes – authorization & validation', () => {
    const app = buildApp();

    test('GET /api/products without token returns 200 (public)', async () => {
        const r = await request(app).get('/api/products');
        expect(r.status).toBe(200);
    });

    test('GET /api/products/:id without token returns 401', async () => {
        const r = await request(app).get('/api/products/a1b2c3d4-e5f6-7890-abcd-ef1234567890');
        expect(r.status).toBe(401);
    });

    test('POST /api/products without token returns 401', async () => {
        const r = await request(app)
            .post('/api/products')
            .send({ productName: 'Test', sku: 'SKU-001', costPrice: 100, sellingPrice: 150, category: 'cat-id' });
        expect(r.status).toBe(401);
    });

    test('POST /api/products with cashier role returns 403', async () => {
        const r = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${makeToken('cashier')}`)
            .send({ productName: 'Test', sku: 'SKU-001', costPrice: 100, sellingPrice: 150, category: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' });
        expect(r.status).toBe(403);
    });

    test('POST /api/products with admin role returns 201', async () => {
        const r = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${makeToken('admin')}`)
            .send({ productName: 'Test', sku: 'SKU-001', costPrice: 100, sellingPrice: 150, category: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' });
        expect(r.status).toBe(201);
    });

    test('POST /api/products missing required fields returns 400', async () => {
        const r = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${makeToken('admin')}`)
            .send({ productName: 'Test' }); // Missing sku, costPrice, sellingPrice
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('VALIDATION_ERROR');
    });

    test('POST /api/products with selling price lower than cost price returns 400', async () => {
        const r = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${makeToken('admin')}`)
            .send({
                productName: 'Test',
                sku: 'SKU-001',
                costPrice: 200,
                sellingPrice: 100, // Lower than cost
                category: 'cat-id',
            });
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('VALIDATION_ERROR');
    });

    test('PUT /api/products/:id with manager role returns 200', async () => {
        const r = await request(app)
            .put('/api/products/a1b2c3d4-e5f6-7890-abcd-ef1234567890')
            .set('Authorization', `Bearer ${makeToken('manager')}`)
            .send({ productName: 'Updated', costPrice: 100, sellingPrice: 150 });
        expect(r.status).toBe(200);
    });

    test('DELETE /api/products/:id with manager role returns 403 (admin only)', async () => {
        const r = await request(app)
            .delete('/api/products/a1b2c3d4-e5f6-7890-abcd-ef1234567890')
            .set('Authorization', `Bearer ${makeToken('manager')}`);
        expect(r.status).toBe(403);
    });

    test('DELETE /api/products/:id with admin role returns 200', async () => {
        const r = await request(app)
            .delete('/api/products/a1b2c3d4-e5f6-7890-abcd-ef1234567890')
            .set('Authorization', `Bearer ${makeToken('admin')}`);
        expect(r.status).toBe(200);
    });

    test('GET /api/products/low-stock/list with cashier role returns 403', async () => {
        const r = await request(app)
            .get('/api/products/low-stock/list')
            .set('Authorization', `Bearer ${makeToken('cashier')}`);
        expect(r.status).toBe(403);
    });

    test('GET /api/products/low-stock/list with admin role returns 200', async () => {
        const r = await request(app)
            .get('/api/products/low-stock/list')
            .set('Authorization', `Bearer ${makeToken('admin')}`);
        expect(r.status).toBe(200);
    });
});
