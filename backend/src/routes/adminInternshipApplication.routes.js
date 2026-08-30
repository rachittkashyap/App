const express = require('express');
const authenticateUser = require('../middleware/auth');
const authorizeAdmin = require('../middleware/admin');
const controller = require('../controllers/internshipApplication.controller');

const router = express.Router();

router.use(authenticateUser, authorizeAdmin);

router.get('/', controller.listApplications);
router.get('/:id/resume', controller.downloadResume);
router.patch('/:id/status', controller.updateStatus);

module.exports = router;
