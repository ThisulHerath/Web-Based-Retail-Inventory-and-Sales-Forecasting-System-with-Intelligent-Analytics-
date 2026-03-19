/**
 * Security middleware tests.
 * Covers baseline HTTP hardening headers and login-rate limiting behavior.
 */
import express from 'express';
import request from 'supertest';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Section: Security controls expected on middleware-protected endpoints.
describe('Security middleware', () => {
    test('sets common helmet headers', async () => {
        const app = express();
        app.use(helmet());
        app.get('/health', (req, res) => res.status(200).json({ ok: true }));

        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    test('rate limiting blocks repeated requests', async () => {
        const app = express();
        app.use(rateLimit({
            windowMs: 60 * 1000,
            max: 2,
            message: { code: 'RATE_LIMITED', message: 'Too many requests' },
            standardHeaders: true,
            legacyHeaders: false,
        }));
        app.get('/limited', (req, res) => res.status(200).json({ ok: true }));

        await request(app).get('/limited').expect(200);
        await request(app).get('/limited').expect(200);

        const third = await request(app).get('/limited');

        expect(third.status).toBe(429);
        expect(third.body.code).toBe('RATE_LIMITED');
    });
});
