const express = require('express');
const authenticateUser = require('../middleware/auth');
const authorizeAdmin = require('../middleware/admin');
const controller = require('../controllers/adminPayment.controller');

const router = express.Router();

router.use(authenticateUser, authorizeAdmin);

router.get('/', controller.listPayments);
router.get('/revenue', controller.getRevenue);
router.post('/:id/refund', controller.refundPayment);

module.exports = router;
