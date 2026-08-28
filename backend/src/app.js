const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { notFound, errorHandler } = require('./middleware/error');
// Rate limiting: disabled during active development/testing (was causing
// false 429s while debugging auth flows). Re-enabled with tuned limits
// in Phase 10 (Search, Reports, Audit, Hardening).
// const { apiLimiter } = require('./middleware/rateLimit');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');

const app = express();

// Security headers
app.use(helmet());

// CORS - allow only the configured frontend origin
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// Body & cookies
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// (rate limiting disabled for now - see note above)

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);

// TODO (next phases): courses, trainings, assignments, tests,
// payments, certificates, admin routes will be mounted here under /api/*

// 404 + centralized error handler (must stay last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
