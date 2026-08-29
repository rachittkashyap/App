const express = require('express');
const authenticateUser = require('../middleware/auth');
const controller = require('../controllers/submission.controller');

const router = express.Router();

router.use(authenticateUser);

router.post('/', controller.submitAssignment);
router.get('/my', controller.mySubmissions);

module.exports = router;
