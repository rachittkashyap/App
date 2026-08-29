const express = require('express');
const controller = require('../controllers/payment.controller');

const router = express.Router();

// This route needs the RAW request body (Buffer) for HMAC signature verification -
// express.raw() here keeps req.body as a Buffer instead of parsing it as JSON.
// The controller parses it manually after verifying the signature.
router.post('/', express.raw({ type: 'application/json' }), controller.handleWebhook);

module.exports = router;
