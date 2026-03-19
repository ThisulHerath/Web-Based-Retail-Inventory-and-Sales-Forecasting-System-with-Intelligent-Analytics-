/**
 * Users route integration tests
 * Tests auth enforcement, RBAC, and input validation at the route level.
 * Uses a lightweight JWT-only guard (no DB) so tests run without a live database.
 */
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { verifyRole } from '../middleware/roleMiddleware.js';
import {
    validateCreateUser,
    validateUpdateUser,
    validateUUIDParam,
} from '../middleware/validators.js';

const JWT_SECRET = 'test-secret-users';

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

// Build a mini Express app that mirrors real user-route structure
const buildApp = () => {
    const app = express();
    app.use(express.json());

    app.get('/api/users', jwtGuard, verifyRole('admin', 'manager'), (req, res) =>
        res.json([])
    );

    app.post(
        '/api/users',
        jwtGuard,
        verifyRole('admin'),
        validateCreateUser,
        (req, res) => res.status(201).json({ created: true })
    );

    app.put(
        '/api/users/:id',
        jwtGuard,
        verifyRole('admin'),
        validateUUIDParam,
        validateUpdateUser,
        (req, res) => res.json({ updated: true })
    );

    app.delete('/api/users/:id', jwtGuard, verifyRole('admin'), validateUUIDParam, (req, res) =>
        res.json({ deleted: true })
    );

    return app;
};

// Section: Access-control checks for user-management endpoints.
describe('Users routes – authorization', () => {
    const app = buildApp();

    test('GET /api/users without token returns 401', async () => {
        const r = await request(app).get('/api/users');
        expect(r.status).toBe(401);
    });

    test('GET /api/users with an invalid token returns 401', async () => {
        const r = await request(app)
            .get('/api/users')
            .set('Authorization', 'Bearer this.is.not.valid');
        expect(r.status).toBe(401);
    });

    test('GET /api/users with cashier role returns 403', async () => {
        const r = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${makeToken('cashier')}`);
        expect(r.status).toBe(403);
    });

    test('GET /api/users with manager role returns 200', async () => {
        const r = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${makeToken('manager')}`);
        expect(r.status).toBe(200);
    });

    test('POST /api/users by cashier returns 403', async () => {
        const r = await request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${makeToken('cashier')}`)
            .send({ name: 'Test User', email: 'test@test.com', password: 'pass123' });
        expect(r.status).toBe(403);
    });
});

// Section: Input validation checks for create/update user payloads.
describe('Users routes – input validation', () => {
    const app = buildApp();
    const adminToken = makeToken('admin');

    test('POST /api/users with invalid email returns 400 VALIDATION_ERROR', async () => {
        const r = await request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Valid Name', email: 'not-an-email', password: 'pass123' });
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('VALIDATION_ERROR');
        expect(r.body.errors.some((e) => e.field === 'email')).toBe(true);
    });

    test('POST /api/users with password under 6 chars returns 400', async () => {
        const r = await request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Valid Name', email: 'user@example.com', password: '123' });
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('VALIDATION_ERROR');
        expect(r.body.errors.some((e) => e.field === 'password')).toBe(true);
    });

    test('POST /api/users with name too short returns 400', async () => {
        const r = await request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'A', email: 'user@example.com', password: 'pass123' });
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('VALIDATION_ERROR');
    });

    test('POST /api/users with invalid role returns 400', async () => {
        const r = await request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Valid Name', email: 'user@example.com', password: 'pass123', role: 'superuser' });
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('VALIDATION_ERROR');
    });

    test('PUT /api/users/:id with non-UUID id returns 400', async () => {
        const r = await request(app)
            .put('/api/users/not-a-uuid')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Updated Name' });
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('VALIDATION_ERROR');
    });

    test('POST /api/users with valid payload returns 201', async () => {
        const r = await request(app)
            .post('/api/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Valid User', email: 'valid@example.com', password: 'securepass', role: 'cashier' });
        expect(r.status).toBe(201);
    });
});
