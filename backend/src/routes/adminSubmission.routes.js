const express = require('express');
const authenticateUser = require('../middleware/auth');
const authorizeAdmin = require('../middleware/admin');
const controller = require('../controllers/submission.controller');

const router = express.Router();

router.use(authenticateUser, authorizeAdmin);

router.get('/', controller.listSubmissions);
router.patch('/:id/review', controller.reviewSubmission);

module.exports = router;
