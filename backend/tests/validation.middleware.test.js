/**
 * Validation middleware unit-style tests.
 * Verifies that invalid payloads return structured 400 VALIDATION_ERROR responses.
 */
import express from 'express';
import request from 'supertest';
import {
    validateLogin,
    validateCreateProduct,
    validateSaleCreate,
} from '../middleware/validators.js';

// Section: Generic middleware behavior for login, product, and sales validators.
describe('Validation middleware', () => {
    const buildApp = (middleware) => {
        const app = express();
        app.use(express.json());
        app.post('/test', middleware, (req, res) => {
            res.status(200).json({ ok: true });
        });
        return app;
    };

    test('rejects invalid login payload with 400', async () => {
        const app = buildApp(validateLogin);

        const response = await request(app)
            .post('/test')
            .send({ email: 'bad-email', password: '' });

        expect(response.status).toBe(400);
        expect(response.body.code).toBe('VALIDATION_ERROR');
        expect(response.body.errors.length).toBeGreaterThan(0);
    });

    test('rejects product with selling price lower than cost', async () => {
        const app = buildApp(validateCreateProduct);

        const response = await request(app)
            .post('/test')
            .send({
                productName: 'Milk Pack',
                category: 'c56a4180-65aa-42ec-a945-5fd21dec0538',
                costPrice: 500,
                sellingPrice: 450,
                minimumStockLevel: 5,
            });

        expect(response.status).toBe(400);
        expect(response.body.code).toBe('VALIDATION_ERROR');
        expect(response.body.errors.some((error) => error.message.includes('Selling price'))).toBe(true);
    });

    test('rejects sale when items array is empty', async () => {
        const app = buildApp(validateSaleCreate);

        const response = await request(app)
            .post('/test')
            .send({
                customerName: 'John Doe',
                paymentMethod: 'Cash',
                items: [],
            });

        expect(response.status).toBe(400);
        expect(response.body.code).toBe('VALIDATION_ERROR');
    });
});
