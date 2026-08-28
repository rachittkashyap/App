const rateLimit = require('express-rate-limit');

// General API limiter - tune per route as needed in later phases
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    code: 'RATE_LIMITED',
  },
});

module.exports = { apiLimiter };
