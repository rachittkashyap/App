const express = require('express');
const authenticateUser = require('../middleware/auth');
const controller = require('../controllers/test.controller');

const router = express.Router();

router.use(authenticateUser);

router.get('/', controller.listAvailableTests);
router.get('/my-attempts', controller.myAttempts);
router.get('/:id', controller.getTestForAttempt);
router.post('/:id/attempt', controller.attemptTest);

module.exports = router;
