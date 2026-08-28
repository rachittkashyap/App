const express = require('express');
const authenticateUser = require('../middleware/auth');
const authorizeAdmin = require('../middleware/admin');
const controller = require('../controllers/admin.controller');

const router = express.Router();

router.use(authenticateUser, authorizeAdmin);

router.get('/stats', controller.getStats);
router.get('/students', controller.listStudents);
router.patch('/students/:id/suspend', controller.suspendStudent);
router.patch('/students/:id/activate', controller.activateStudent);

module.exports = router;
