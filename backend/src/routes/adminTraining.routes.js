const express = require('express');
const authenticateUser = require('../middleware/auth');
const authorizeAdmin = require('../middleware/admin');
const controller = require('../controllers/adminTraining.controller');

const router = express.Router();

router.use(authenticateUser, authorizeAdmin);

// Training CRUD
router.post('/', controller.createTraining);
router.get('/', controller.listTrainings);
router.get('/:id', controller.getTraining);
router.put('/:id', controller.updateTraining);
router.delete('/:id', controller.deleteTraining);
router.patch('/:id/publish', controller.publishTraining);
router.patch('/:id/unpublish', controller.unpublishTraining);

// Days
router.post('/:id/days', controller.addDay);
router.put('/:id/days/:dayId', controller.updateDay);
router.delete('/:id/days/:dayId', controller.deleteDay);

// Tasks
router.post('/:id/days/:dayId/tasks', controller.addTask);
router.put('/:id/days/:dayId/tasks/:taskId', controller.updateTask);
router.delete('/:id/days/:dayId/tasks/:taskId', controller.deleteTask);

module.exports = router;
