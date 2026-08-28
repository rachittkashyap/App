const express = require('express');
const authenticateUser = require('../middleware/auth');
const controller = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/logout', authenticateUser, controller.logout);
router.post('/refresh', controller.refresh);
router.post('/verify-email', controller.verifyEmailHandler);
router.post('/forgot-password', controller.forgotPasswordHandler);
router.post('/reset-password', controller.resetPasswordHandler);
router.get('/me', authenticateUser, controller.me);

module.exports = router;
