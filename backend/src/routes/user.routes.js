const express = require('express');
const authenticateUser = require('../middleware/auth');
const controller = require('../controllers/user.controller');

const router = express.Router();

router.use(authenticateUser);

router.put('/profile', controller.updateProfile);
router.put('/change-password', controller.changePassword);

module.exports = router;
