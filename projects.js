const express = require('express');
const router = express.Router();
const { getAllProjects, createProject, updateProject, deleteProject } = require('../controllers/projects');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, getAllProjects);
router.post('/', authMiddleware, adminMiddleware, createProject);
router.put('/:id', authMiddleware, adminMiddleware, updateProject);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProject);

module.exports = router;
