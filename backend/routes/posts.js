// c:/Users/sande/OneDrive/Desktop/Linkedin - project/postcraft-ai/backend/routes/posts.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// GET /api/posts — all posts ordered by created_at DESC
router.get('/', (req, res) => {
    try {
        const stmt = db.prepare('SELECT id, title, generated_post, model_used, viral_score, created_at FROM posts WHERE user_id = ? ORDER BY created_at DESC');
        const posts = stmt.all(req.user.id);
        res.json({ posts });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// GET /api/posts/:id
router.get('/:id', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM posts WHERE id = ? AND user_id = ?');
        const post = stmt.get(req.params.id, req.user.id);

        if (!post) return res.status(404).json({ error: 'Post not found' });

        // Parse JSON columns
        if (post.viral_breakdown) post.viral_breakdown = JSON.parse(post.viral_breakdown);
        if (post.hashtags) post.hashtags = JSON.parse(post.hashtags);
        if (post.cta_styles) post.cta_styles = JSON.parse(post.cta_styles);

        res.json({ post });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch post details' });
    }
});

// POST /api/posts — save generated post
router.post('/', (req, res) => {
    const { title, raw_input, generated_post, model_used, viral_score, viral_breakdown, hashtags, length_type, tone_value, cta_styles, best_time, best_time_reason } = req.body;
    const id = uuidv4();

    try {
        const stmt = db.prepare(`
      INSERT INTO posts (id, user_id, title, raw_input, generated_post, model_used, viral_score, viral_breakdown, hashtags, length_type, tone_value, cta_styles, best_time, best_time_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        stmt.run(
            id, req.user.id, title, raw_input, generated_post, model_used,
            viral_score, JSON.stringify(viral_breakdown), JSON.stringify(hashtags),
            length_type, tone_value, JSON.stringify(cta_styles), best_time, best_time_reason
        );

        res.json({ success: true, id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to save post' });
    }
});

// DELETE /api/posts/:id
router.delete('/:id', (req, res) => {
    try {
        const stmt = db.prepare('DELETE FROM posts WHERE id = ? AND user_id = ?');
        stmt.run(req.params.id, req.user.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// DELETE /api/posts - Clear all history
router.delete('/', (req, res) => {
    try {
        const stmt = db.prepare('DELETE FROM posts WHERE user_id = ?');
        stmt.run(req.user.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear post history' });
    }
});

module.exports = router;
