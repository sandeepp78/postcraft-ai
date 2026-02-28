// c:/Users/sande/OneDrive/Desktop/Linkedin - project/postcraft-ai/backend/auth.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const db = require('./db');
const { v4: uuidv4 } = require('uuid');

// We use a LocalStrategy but ignore passwords since the user requested simple email login
passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password' // We won't actually check this, but passport-local expects it
    },
    function (email, password, done) {
        try {
            email = email.toLowerCase().trim();
            const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
            let user = stmt.get(email);

            if (!user) {
                // Auto-create user on first login
                const newUserId = uuidv4();
                // Since we removed google_id, we will just use the email as a unique identifier where needed or just ignore google_id
                const insertStmt = db.prepare(`
          INSERT INTO users (id, email, name, avatar_url)
          VALUES (?, ?, ?, ?)
        `);
                // Extract a name from email (e.g., test@example.com -> test)
                const nameFallback = email.split('@')[0];
                insertStmt.run(newUserId, email, nameFallback, null);
                user = { id: newUserId, email: email, name: nameFallback, avatar_url: null };
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    try {
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        const user = stmt.get(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Remove Google-specific routes, just export passport setup
const registerAuthRoutes = (app) => {
    app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
        return res.json({ success: true, user: req.user });
    });
};

module.exports = { passport, registerAuthRoutes };
