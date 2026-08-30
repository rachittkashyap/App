const express = require('express');
const authenticateUser = require('../middleware/auth');
const authorizeAdmin = require('../middleware/admin');
const controller = require('../controllers/adminReport.controller');

const router = express.Router();

router.use(authenticateUser, authorizeAdmin);

router.get('/overview', controller.getOverview);

module.exports = router;
