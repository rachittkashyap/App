const express = require('express');
const upload = require('../middleware/upload');
const controller = require('../controllers/internshipApplication.controller');

const router = express.Router();

router.post('/', upload.single('resume'), controller.submitApplication);

module.exports = router;
