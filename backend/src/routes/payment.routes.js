const express = require('express');
const authenticateUser = require('../middleware/auth');
const controller = require('../controllers/payment.controller');

const router = express.Router();

router.use(authenticateUser);

router.post('/create-order', controller.createOrder);
router.post('/verify', controller.verifyPayment);
router.get('/my', controller.myOrders);

module.exports = router;
