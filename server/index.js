const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const passport = require('./passport');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));

// Session-Konfiguration
app.use(session({
  secret: process.env.SESSION_SECRET || 'gatefall-dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 Tage
  }
}));

// Passport initialisieren
app.use(passport.initialize());
app.use(passport.session());

// API-Routen (vor statischen Dateien!)
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/progression', profileRoutes); // /api/progression/save

// Statische Dateien (Frontend)
app.use(express.static(path.join(__dirname, '..')));

// SPA Fallback - nur für HTML-Anfragen
app.get('*', (req, res) => {
  // Nicht für API-Routen oder Dateien mit Extension
  if (req.path.startsWith('/api/') || req.path.includes('.')) {
    return res.status(404).send('Not Found');
  }
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✓ Gatefall-Server läuft auf Port ${PORT}`);
  console.log(`  → http://localhost:${PORT}`);
});
