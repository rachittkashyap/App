const express = require('express');
const { success } = require('../utils/response');

const router = express.Router();

router.get('/', (req, res) => {
  success(res, {
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
