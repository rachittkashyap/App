const rateLimit = require('express-rate-limit');

// General API limiter - generous, mainly to catch runaway loops/abuse rather
// than normal usage (a single page load can fire 5-10 requests).
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    code: 'RATE_LIMITED',
  },
});

// Stricter limiter for auth endpoints (login/register/forgot-password) to
// slow down credential-stuffing / brute-force attempts specifically.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts, please try again later.',
    code: 'RATE_LIMITED',
  },
});

module.exports = { apiLimiter, authLimiter };
