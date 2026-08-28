const express = require('express');
const authenticateUser = require('../middleware/auth');
const authorizeAdmin = require('../middleware/admin');
const controller = require('../controllers/adminCourse.controller');

const router = express.Router();

router.use(authenticateUser, authorizeAdmin);

// Course CRUD
router.post('/', controller.createCourse);
router.get('/', controller.listCourses);
router.get('/:id', controller.getCourse);
router.put('/:id', controller.updateCourse);
router.delete('/:id', controller.deleteCourse);
router.patch('/:id/publish', controller.publishCourse);
router.patch('/:id/unpublish', controller.unpublishCourse);

// Modules
router.post('/:id/modules', controller.addModule);
router.put('/:id/modules/reorder', controller.reorderModules);
router.put('/:id/modules/:moduleId', controller.updateModule);
router.delete('/:id/modules/:moduleId', controller.deleteModule);

// Lessons
router.post('/:id/modules/:moduleId/lessons', controller.addLesson);
router.put('/:id/modules/:moduleId/lessons/reorder', controller.reorderLessons);
router.put('/:id/modules/:moduleId/lessons/:lessonId', controller.updateLesson);
router.delete('/:id/modules/:moduleId/lessons/:lessonId', controller.deleteLesson);

module.exports = router;
