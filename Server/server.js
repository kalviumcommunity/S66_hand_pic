require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Routers
const userRouter = require('./routes/user');
const postRouter = require('./routes/post');

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow images from other origins
    contentSecurityPolicy: false // CSP handled at CDN/reverse-proxy level
}));

// ─── Logging ──────────────────────────────────────────────────────────────────
const isDev = process.env.NODE_ENV !== 'production';
app.use(morgan(isDev ? 'dev' : 'combined'));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://handscape-o.netlify.app',
    'https://s66-hand-pic.onrender.com'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl)
        if (!origin) {
            callback(null, true);
            return;
        }

        // Allow any localhost origin (e.g., http://localhost:5173, http://localhost:5176)
        const isLocalhost = /^http:\/\/localhost(:\d+)?$/.test(origin);
        
        if (isLocalhost || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// ─── Global Rate Limiter (broad safety net) ────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

// ─── Auth-specific tight rate limits ──────────────────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { error: 'Too many authentication attempts, please wait 15 minutes.' }
});
app.use('/login', authLimiter);
app.use('/signup', authLimiter);
app.use('/reset-password', authLimiter);
app.use('/auth/google', authLimiter);
app.use('/request-password-reset', authLimiter);
app.use('/verify-reset-otp', authLimiter);

// ─── Static uploads (serve with nosniff) ─────────────────────────────────────
// Note: For production use cloud storage (S3/Cloudinary). Local uploads are ephemeral.
app.use('/uploads', (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', 'inline');
    next();
}, express.static('uploads'));

// ─── DB ───────────────────────────────────────────────────────────────────────
const connectDB = require('./db/dbConnection');
connectDB();

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/', userRouter);
app.use('/', postRouter);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/ping', (_req, res) => res.send('pong'));

// ─── Root (minimal, no internal info) ─────────────────────────────────────────
app.get('/', (_req, res) => {
    res.json({ message: 'Handscape API' });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: 'Resource not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
    // Log full error server-side only
    console.error('[Error]', err.message, err.stack);

    // Never expose internal error details to clients
    const status = err.status || 500;
    const message = isDev ? err.message : 'An internal server error occurred.';
    res.status(status).json({ error: message });
});

// ─── Server ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
