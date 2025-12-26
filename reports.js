const express = require('express');
const router = express.Router();
const { getSummary } = require('../controllers/reports');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/summary', authMiddleware, adminMiddleware, getSummary);

module.exports = router;
