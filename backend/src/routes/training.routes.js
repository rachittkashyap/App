const express = require('express');
const controller = require('../controllers/training.controller');

const router = express.Router();

router.get('/', controller.listPublishedTrainings);
router.get('/:slug', controller.getTrainingBySlug);

module.exports = router;
