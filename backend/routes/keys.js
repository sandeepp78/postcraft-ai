// c:/Users/sande/OneDrive/Desktop/Linkedin - project/postcraft-ai/backend/routes/keys.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/keys — all keys for user, masked as ****xxxx
router.get('/', (req, res) => {
    try {
        const stmt = db.prepare('SELECT id, model_name, api_key FROM api_keys WHERE user_id = ?');
        const keys = stmt.all(req.user.id);

        // Mask keys for frontend security
        const maskedKeys = keys.map(k => ({
            ...k,
            api_key: k.api_key.substring(0, 4) + '****' + k.api_key.slice(-4)
        }));

        res.json({ keys: maskedKeys });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch keys' });
    }
});

// POST /api/keys — upsert { model_name, api_key }
router.post('/', (req, res) => {
    const { model_name, api_key } = req.body;
    if (!model_name || !api_key) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const stmt = db.prepare(`
      INSERT INTO api_keys (user_id, model_name, api_key) 
      VALUES (?, ?, ?) 
      ON CONFLICT(user_id, model_name) DO UPDATE SET api_key = excluded.api_key
    `);
        stmt.run(req.user.id, model_name, api_key);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save key' });
    }
});

// DELETE /api/keys/:model_name
router.delete('/:model_name', (req, res) => {
    try {
        const stmt = db.prepare('DELETE FROM api_keys WHERE user_id = ? AND model_name = ?');
        stmt.run(req.user.id, req.params.model_name);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete key' });
    }
});

module.exports = router;
