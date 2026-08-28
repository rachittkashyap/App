const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { notFound, errorHandler } = require('./middleware/error');
const { apiLimiter } = require('./middleware/rateLimit');
const healthRoutes = require('./routes/health.routes');

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

// Rate limiting on all /api routes
app.use('/api', apiLimiter);

// Routes
app.use('/api/health', healthRoutes);

// TODO (next phases): auth, courses, trainings, assignments, tests,
// payments, certificates, admin routes will be mounted here under /api/*

// 404 + centralized error handler (must stay last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
