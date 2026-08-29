const express = require('express');
const authenticateUser = require('../middleware/auth');
const controller = require('../controllers/certificate.controller');

const router = express.Router();

// Public - no auth needed, this is what the QR code / share link points to
router.get('/verify/:certificateId', controller.verifyCertificate);

// Authenticated
router.get('/my', authenticateUser, controller.myCertificates);
router.get('/:certificateId/download', authenticateUser, controller.downloadCertificate);

module.exports = router;
