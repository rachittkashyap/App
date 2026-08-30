const express = require('express');
const authenticateUser = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const controller = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', authLimiter, controller.register);
router.post('/login', authLimiter, controller.login);
router.post('/logout', authenticateUser, controller.logout);
router.post('/refresh', controller.refresh);
router.post('/verify-email', controller.verifyEmailHandler);
router.post('/forgot-password', authLimiter, controller.forgotPasswordHandler);
router.post('/reset-password', authLimiter, controller.resetPasswordHandler);
router.get('/me', authenticateUser, controller.me);

module.exports = router;
