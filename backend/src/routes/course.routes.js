const express = require('express');
const controller = require('../controllers/course.controller');

const router = express.Router();

router.get('/', controller.listPublishedCourses);
router.get('/:slug', controller.getCourseBySlug);

module.exports = router;
