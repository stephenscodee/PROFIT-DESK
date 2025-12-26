const express = require('express');
const router = express.Router();
const { getTimeEntries, createTimeEntry } = require('../controllers/timeEntries');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, getTimeEntries);
router.post('/', authMiddleware, createTimeEntry);

module.exports = router;
