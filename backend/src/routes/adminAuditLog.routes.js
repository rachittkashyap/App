const express = require('express');
const authenticateUser = require('../middleware/auth');
const authorizeAdmin = require('../middleware/admin');
const controller = require('../controllers/adminAuditLog.controller');

const router = express.Router();

router.use(authenticateUser, authorizeAdmin);

router.get('/', controller.listAuditLogs);

module.exports = router;
