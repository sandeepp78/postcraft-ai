// c:/Users/sande/OneDrive/Desktop/Linkedin - project/postcraft-ai/backend/middleware/authMiddleware.js
function requireAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
}

module.exports = requireAuth;

