const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

console.log('\n🔍 SESSION DEBUG REPORT\n');
console.log('Environment:', process.env.NODE_ENV);
console.log('Session Secret:', process.env.SESSION_SECRET ? '✅ Set' : '❌ Not set');
console.log('Base URL:', process.env.BASE_URL);

// Session-Konfiguration (gleich wie in index.js)
const sessionConfig = {
  store: new FileStore({
    path: path.join(__dirname, 'server/sessions'),
    ttl: 86400 * 7,
    retries: 0
  }),
  secret: process.env.SESSION_SECRET || 'gatefall-dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'gatefall.sid',
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: '/'
  }
};

console.log('\nCookie Config:');
console.log('  httpOnly:', sessionConfig.cookie.httpOnly);
console.log('  secure:', sessionConfig.cookie.secure);
console.log('  sameSite:', sessionConfig.cookie.sameSite);
console.log('  maxAge:', sessionConfig.cookie.maxAge / 1000 / 60 / 60, 'hours');

app.use(session(sessionConfig));

// Test-Route: Session setzen
app.post('/test-set-session', (req, res) => {
  console.log('\n🧪 TEST: Session setzen');
  console.log('Session ID vorher:', req.sessionID);
  
  req.session.testData = {
    timestamp: Date.now(),
    message: 'Test Session Data'
  };
  
  req.session.save((err) => {
    if (err) {
      console.error('❌ Session save error:', err);
      return res.status(500).json({ error: err.message });
    }
    
    console.log('✅ Session gespeichert:', req.sessionID);
    console.log('Session-Daten:', req.session);
    
    res.json({
      success: true,
      sessionID: req.sessionID,
      cookie: req.session.cookie,
      data: req.session.testData
    });
  });
});

// Test-Route: Session lesen
app.get('/test-get-session', (req, res) => {
  console.log('\n🧪 TEST: Session lesen');
  console.log('Session ID:', req.sessionID);
  console.log('Cookie Header:', req.headers.cookie);
  console.log('Session-Daten:', req.session);
  
  if (!req.session.testData) {
    console.log('❌ Keine Session-Daten gefunden!');
    return res.status(401).json({ 
      error: 'No session data',
      sessionID: req.sessionID,
      hasSessionCookie: !!req.headers.cookie
    });
  }
  
  console.log('✅ Session erfolgreich gelesen');
  res.json({
    success: true,
    sessionID: req.sessionID,
    data: req.session.testData
  });
});

// Session-Dateien auflisten
app.get('/test-list-sessions', (req, res) => {
  const fs = require('fs');
  const sessionsPath = path.join(__dirname, 'server/sessions');
  
  console.log('\n📁 Session-Dateien in:', sessionsPath);
  
  try {
    const files = fs.readdirSync(sessionsPath);
    console.log('Gefundene Dateien:', files.length);
    files.forEach(f => console.log('  -', f));
    
    res.json({
      success: true,
      path: sessionsPath,
      files: files,
      count: files.filter(f => f.endsWith('.json')).length
    });
  } catch (err) {
    console.error('❌ Fehler beim Lesen:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = 3001; // Anderer Port als Haupt-App
app.listen(PORT, () => {
  console.log(`\n🚀 Debug-Server läuft auf Port ${PORT}`);
  console.log('\nTest-Ablauf:');
  console.log(`1. POST http://localhost:${PORT}/test-set-session - Session erstellen`);
  console.log(`2. GET  http://localhost:${PORT}/test-get-session - Session lesen (sollte gleiche ID haben)`);
  console.log(`3. GET  http://localhost:${PORT}/test-list-sessions - Session-Dateien anzeigen\n`);
});
