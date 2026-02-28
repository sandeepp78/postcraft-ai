// c:/Users/sande/OneDrive/Desktop/Linkedin - project/postcraft-ai/backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const { passport, registerAuthRoutes } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Session setup
app.use(session({
    store: new SQLiteStore({
        db: 'sessions.sqlite',
        dir: __dirname
    }),
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        secure: process.env.NODE_ENV === 'production'
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// === Routes ===

// Auth routes (defined in auth.js)
registerAuthRoutes(app);

app.get('/api/auth/me', (req, res) => {
    if (req.isAuthenticated()) {
        return res.json({ user: req.user });
    }
    return res.status(401).json({ error: 'Not authenticated' });
});

app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return res.status(500).json({ error: 'Logout failed' }); }
        // Destroy session explicitly
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.json({ success: true });
        });
    });
});

// Protected API Routes
const authMiddleware = require('./middleware/authMiddleware');

const keysRouter = require('./routes/keys');
const postsRouter = require('./routes/posts');
const draftsRouter = require('./routes/drafts');
const generateRouter = require('./routes/generate');

app.use('/api/keys', authMiddleware, keysRouter);
app.use('/api/posts', authMiddleware, postsRouter);
app.use('/api/drafts', authMiddleware, draftsRouter);
app.use('/api/generate', authMiddleware, generateRouter);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
