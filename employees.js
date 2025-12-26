const express = require('express');
const router = express.Router();
const { getAllEmployees, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employees');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, getAllEmployees);
router.post('/', authMiddleware, adminMiddleware, createEmployee);
router.put('/:id', authMiddleware, adminMiddleware, updateEmployee);
router.delete('/:id', authMiddleware, adminMiddleware, deleteEmployee);

module.exports = router;
