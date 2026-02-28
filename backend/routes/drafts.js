// c:/Users/sande/OneDrive/Desktop/Linkedin - project/postcraft-ai/backend/routes/drafts.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// GET /api/drafts
router.get('/', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM drafts WHERE user_id = ? ORDER BY updated_at DESC');
        const drafts = stmt.all(req.user.id);

        // Parse JSON columns
        drafts.forEach(d => {
            if (d.settings) d.settings = JSON.parse(d.settings);
        });

        res.json({ drafts });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch drafts' });
    }
});

// POST /api/drafts
router.post('/', (req, res) => {
    const { title, raw_input, post_content, model_used, settings } = req.body;
    const id = uuidv4();

    try {
        const stmt = db.prepare(`
      INSERT INTO drafts (id, user_id, title, raw_input, post_content, model_used, settings)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(id, req.user.id, title, raw_input, post_content, model_used, JSON.stringify(settings));
        res.json({ success: true, id });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save draft' });
    }
});

// PUT /api/drafts/:id
router.put('/:id', (req, res) => {
    const { title, raw_input, post_content, model_used, settings } = req.body;

    try {
        const stmt = db.prepare(`
      UPDATE drafts 
      SET title = ?, raw_input = ?, post_content = ?, model_used = ?, settings = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);

        stmt.run(title, raw_input, post_content, model_used, JSON.stringify(settings), req.params.id, req.user.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update draft' });
    }
});

// DELETE /api/drafts/:id
router.delete('/:id', (req, res) => {
    try {
        const stmt = db.prepare('DELETE FROM drafts WHERE id = ? AND user_id = ?');
        stmt.run(req.params.id, req.user.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete draft' });
    }
});

module.exports = router;
