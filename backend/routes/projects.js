const express = require('express');
const Project = require('../models/Project');
const requireAdminKey = require('../middleware/requireAdminKey');

const router = express.Router();

// GET /api/projects — public, powers project cards dynamically if you wire
// the frontend up to fetch from here instead of using the hardcoded HTML.
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Could not load projects.' });
  }
});

// POST /api/projects — protected, requires x-api-key header (see .env ADMIN_API_KEY)
router.post('/', requireAdminKey, async (req, res) => {
  try {
    const created = await Project.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/projects/:id — protected, update an existing project
router.put('/:id', requireAdminKey, async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Project not found.' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
