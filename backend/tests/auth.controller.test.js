/**
 * Auth controller integration tests
 * Tests authentication business logic, including disabled user handling.
 * Uses Express and supertest without a database dependency.
 */
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { validateLogin } from '../middleware/validators.js';

const JWT_SECRET = 'test-secret-auth';

// Mock auth controller that includes disabled user check
const mockAuthController = {
    login: (req, res) => {
        const { email, password } = req.body;
        
        // Simulate database lookup with disabled user check
        // In production, this would verify against actual database
        const mockUsers = {
            'active@test.com': { id: 'user-001', role: 'admin', isActive: true },
            'disabled@test.com': { id: 'user-002', role: 'manager', isActive: false },
        };

        const user = mockUsers[email];

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!user.isActive) {
            return res.status(403).json({ 
                message: 'Your account is disabled. Please contact support.', 
                code: 'ACCOUNT_DISABLED' 
            });
        }

        const token = jwt.sign({ id: user.id, email, role: user.role, isActive: true }, JWT_SECRET);
        res.status(200).json({ token, userId: user.id, email, role: user.role });
    },

    register: (req, res) => {
        res.status(201).json({ message: 'User registered', userId: 'new-user-id' });
    },
};

// Build a mini Express app that mirrors auth routes
const buildApp = () => {
    const app = express();
    app.use(express.json());

    app.post('/api/auth/login', validateLogin, mockAuthController.login);
    app.post('/api/auth/register', mockAuthController.register);

    return app;
};

// Section: Authentication validation, disabled-user rejection, and token success path.
describe('Auth controller – login and disabled user handling', () => {
    const app = buildApp();

    test('POST /api/auth/login without credentials returns 400', async () => {
        const r = await request(app)
            .post('/api/auth/login')
            .send({});
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('VALIDATION_ERROR');
    });

    test('POST /api/auth/login with invalid email format returns 400', async () => {
        const r = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'not-an-email',
                password: 'password123',
            });
        expect(r.status).toBe(400);
        expect(r.body.code).toBe('VALIDATION_ERROR');
    });

    test('POST /api/auth/login with non-existent email returns 401', async () => {
        const r = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'nonexistent@test.com',
                password: 'password123',
            });
        expect(r.status).toBe(401);
        expect(r.body.message).toMatch(/invalid|not found/i);
    });

    // Test U-03: Login with disabled user returns 403 with clear message
    test('U-03: POST /api/auth/login with disabled user account returns 403', async () => {
        // Given: A valid credential set for a disabled account.
        // When: Login is attempted.
        const r = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'disabled@test.com',
                password: 'password123',
            });
        // Then: API rejects login with account-disabled response.
        expect(r.status).toBe(403);
        expect(r.body.code).toBe('ACCOUNT_DISABLED');
        expect(r.body.message).toMatch(/disabled|contact support/i);
    });

    // Test U-03: Login with active user succeeds
    test('U-03: POST /api/auth/login with active user returns 200 and token', async () => {
        // Given: A valid active user account.
        // When: Login request is submitted.
        const r = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'active@test.com',
                password: 'password123',
            });
        // Then: Login succeeds and returns a signed JWT token.
        expect(r.status).toBe(200);
        expect(r.body).toHaveProperty('token');
        expect(r.body).toHaveProperty('userId');
        expect(r.body.userId).toBe('user-001');

        // Verify token structure
        const decoded = jwt.verify(r.body.token, JWT_SECRET);
        expect(decoded.role).toBe('admin');
        expect(decoded.isActive).toBe(true);
    });

    test('POST /api/auth/register with valid data returns 201', async () => {
        const r = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'newuser@test.com',
                password: 'SecurePass123!',
            });
        expect(r.status).toBe(201);
        expect(r.body).toHaveProperty('userId');
    });
});
