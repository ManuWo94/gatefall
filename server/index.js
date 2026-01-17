const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const path = require('path');
require('dotenv').config(); // .env-Datei laden
const passport = require('./passport');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 3000;

// Logging für Debugging
console.log('🔧 Environment:', process.env.NODE_ENV);
console.log('🔧 SESSION_SECRET gesetzt:', !!process.env.SESSION_SECRET);

// Middleware
app.use(express.json());

// CORS nur für Development (Codespace)
if (process.env.NODE_ENV !== 'production') {
  const cors = require('cors');
  console.log('🔧 CORS aktiviert (Development)');
  app.use(cors({
    origin: true,
    credentials: true
  }));
} else {
  console.log('🔧 CORS deaktiviert (Production)');
}

// Session-Konfiguration mit FileStore für Persistenz
const sessionConfig = {
  store: new FileStore({
    path: path.join(__dirname, 'sessions'),
    ttl: 86400 * 7, // 7 Tage in Sekunden
    retries: 0
  }),
  secret: process.env.SESSION_SECRET || 'gatefall-dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'gatefall.sid', // Custom cookie name
  cookie: {
    httpOnly: true,
    secure: false, // TEMPORÄR AUF FALSE FÜR DEBUGGING
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 Tage
    path: '/'
  }
};

console.log('🔧 Session Cookie Config:', {
  name: sessionConfig.name,
  httpOnly: sessionConfig.cookie.httpOnly,
  secure: sessionConfig.cookie.secure,
  sameSite: sessionConfig.cookie.sameSite,
  path: sessionConfig.cookie.path
});

app.use(session(sessionConfig));

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
