const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // .env-Datei laden
const passport = require('./passport');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// CORS nur für Development (Codespace)
if (process.env.NODE_ENV !== 'production') {
  const cors = require('cors');
  app.use(cors({
    origin: true,
    credentials: true
  }));
}

// Session-Konfiguration
app.use(session({
  secret: process.env.SESSION_SECRET || 'gatefall-dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS in Produktion
    sameSite: 'lax', // lax auch in Produktion, da gleiche Domain
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

// SPA Fallback - nur für HTML-Anfragen, nicht für API oder statische Dateien
app.use((req, res, next) => {
  // Wenn es eine API-Route ist, die nicht gefunden wurde
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Wenn es eine Datei mit Extension ist (außer .html)
  if (req.path.includes('.') && !req.path.endsWith('.html')) {
    return res.status(404).send('File not found');
  }
  
  // Ansonsten: SPA Fallback
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✓ Gatefall-Server läuft auf Port ${PORT}`);
  console.log(`  → http://localhost:${PORT}`);
});
