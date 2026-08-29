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
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const courseRoutes = require('./routes/course.routes');
const adminCourseRoutes = require('./routes/adminCourse.routes');
const trainingRoutes = require('./routes/training.routes');
const adminTrainingRoutes = require('./routes/adminTraining.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const submissionRoutes = require('./routes/submission.routes');
const adminSubmissionRoutes = require('./routes/adminSubmission.routes');
const testRoutes = require('./routes/test.routes');
const adminTestRoutes = require('./routes/adminTest.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminPaymentRoutes = require('./routes/adminPayment.routes');
const webhookRoutes = require('./routes/webhook.routes');
const certificateRoutes = require('./routes/certificate.routes');
const adminCertificateRoutes = require('./routes/adminCertificate.routes');

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

// Razorpay webhook MUST be mounted before express.json() - it needs the raw
// request body (as bytes) to verify the HMAC signature. If express.json() ran
// first it would consume/parse the stream and the raw bytes would be lost.
app.use('/api/payments/webhook', webhookRoutes);

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
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin/courses', adminCourseRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/admin/trainings', adminTrainingRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin/submissions', adminSubmissionRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/admin/tests', adminTestRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin/payments', adminPaymentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/admin/certificates', adminCertificateRoutes);

// All planned core phases are now mounted. Future additions (search/reports/
// audit hardening in Phase 10, seed/testing in Phase 11) build on these.

// 404 + centralized error handler (must stay last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
