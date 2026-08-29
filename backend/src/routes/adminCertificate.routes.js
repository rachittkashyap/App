const express = require('express');
const authenticateUser = require('../middleware/auth');
const authorizeAdmin = require('../middleware/admin');
const controller = require('../controllers/adminCertificate.controller');

const router = express.Router();

router.use(authenticateUser, authorizeAdmin);

router.get('/', controller.listCertificates);
router.patch('/:id/revoke', controller.revokeCertificate);
router.patch('/:id/reinstate', controller.reinstateCertificate);

router.get('/template', controller.getTemplate);
router.put('/template', controller.updateTemplate);

module.exports = router;
