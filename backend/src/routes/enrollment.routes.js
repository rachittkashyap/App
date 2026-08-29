const express = require('express');
const authenticateUser = require('../middleware/auth');
const controller = require('../controllers/enrollment.controller');

const router = express.Router();

router.use(authenticateUser);

router.post('/', controller.enroll);
router.get('/my', controller.myEnrollments);
router.get('/status', controller.getStatus);
router.patch('/:id/complete-item', controller.markItemComplete);

module.exports = router;
