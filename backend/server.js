import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import securityRoutes from './routes/securityRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import auditRoutes from './routes/auditRoutes.js';
import { auditLog } from './middleware/auditLog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const apiLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || 200),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many requests. Please try again later.',
        code: 'RATE_LIMITED',
    },
});

const authLimiter = rateLimit({
    windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.AUTH_RATE_LIMIT_MAX || 10),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many login attempts. Please try again later.',
        code: 'AUTH_RATE_LIMITED',
    },
});

// Middleware
app.use(helmet({
    // Frontend runs on a different origin in development (5173), so images served
    // from /uploads must be embeddable cross-origin.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
    origin(origin, callback) {
        if (!origin || corsOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('CORS origin not allowed'));
    },
    credentials: true,
}));
app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/customers/login', authLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.get('/', (req, res) => {
    res.json({ message: '🏪 7 Super City API is running...' });
});

// Audit logging — wraps res.json so it fires after route handlers respond
app.use('/api', auditLog);

app.use('/api/auth', authRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/audit', auditRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
});
