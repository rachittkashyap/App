const express = require('express');
const authenticateUser = require('../middleware/auth');
const authorizeAdmin = require('../middleware/admin');
const controller = require('../controllers/adminTest.controller');

const router = express.Router();

router.use(authenticateUser, authorizeAdmin);

router.post('/', controller.createTest);
router.get('/', controller.listTests);
router.get('/:id', controller.getTest);
router.put('/:id', controller.updateTest);
router.delete('/:id', controller.deleteTest);
router.patch('/:id/publish', controller.publishTest);
router.patch('/:id/unpublish', controller.unpublishTest);

router.post('/:id/questions', controller.addQuestion);
router.delete('/:id/questions/:questionId', controller.deleteQuestion);

module.exports = router;
