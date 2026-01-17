const express = require('express');
const db = require('../db');

const router = express.Router();

// Middleware: Prüft ob User eingeloggt ist
function requireAuth(req, res, next) {
  console.log('🔒 requireAuth - Session ID:', req.sessionID);
  console.log('🔒 requireAuth - userId in Session:', req.session.userId);
  console.log('🔒 requireAuth - Cookies:', req.headers.cookie);
  
  if (!req.session.userId) {
    console.log('❌ Keine userId in Session - 401 Unauthorized');
    return res.status(401).json({ error: 'Nicht authentifiziert' });
  }
  
  console.log('✅ requireAuth erfolgreich für User:', req.session.userId);
  next();
}

// GET /api/profile
router.get('/', requireAuth, (req, res) => {
  console.log('📊 Profile Request für User:', req.session.userId);
  
  try {
    const userId = req.session.userId;

    // User-Daten holen
    db.get(
      'SELECT email, display_name, email_verified_at FROM users WHERE id = ?',
      [userId],
      (err, user) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Serverfehler beim Laden des Profils' });
        }

        if (!user) {
          return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }

        // Progression holen
        db.get(
          'SELECT level, xp, gold, awakening_state FROM progression WHERE user_id = ?',
          [userId],
          (err, progression) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Serverfehler beim Laden des Profils' });
            }

            if (!progression) {
              return res.status(404).json({ error: 'Progression nicht gefunden' });
            }

            res.json({
              email: user.email,
              displayName: user.display_name,
              emailVerified: !!user.email_verified_at,
              emailVerifiedAt: user.email_verified_at,
              progression: {
                level: progression.level,
                xp: progression.xp,
                gold: progression.gold,
                awakeningState: progression.awakening_state || 'locked'
              }
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Serverfehler beim Laden des Profils' });
  }
});

// POST /api/progression/save
router.post('/save', requireAuth, (req, res) => {
  const { level, xp, gold } = req.body;
  const userId = req.session.userId;

  // Validierung
  if (typeof level !== 'number' || typeof xp !== 'number' || typeof gold !== 'number') {
    return res.status(400).json({ error: 'Level, XP und Gold müssen Zahlen sein' });
  }

  if (level < 1 || xp < 0 || gold < 0) {
    return res.status(400).json({ error: 'Ungültige Werte (Level >= 1, XP/Gold >= 0)' });
  }

  try {
    db.run(
      'UPDATE progression SET level = ?, xp = ?, gold = ? WHERE user_id = ?',
      [level, xp, gold, userId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Serverfehler beim Speichern' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Progression nicht gefunden' });
        }

        res.json({
          success: true,
          progression: { level, xp, gold }
        });
      }
    );
  } catch (error) {
    console.error('Save progression error:', error);
    res.status(500).json({ error: 'Serverfehler beim Speichern' });
  }
});

// POST /api/awakening/complete
router.post('/awakening/complete', requireAuth, (req, res) => {
  const userId = req.session.userId;

  try {
    // Check current state
    db.get(
      'SELECT level, awakening_state FROM progression WHERE user_id = ?',
      [userId],
      (err, progression) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Serverfehler' });
        }

        if (!progression) {
          return res.status(404).json({ error: 'Progression nicht gefunden' });
        }

        // Validate level requirement
        if (progression.level < 10) {
          return res.status(400).json({ error: 'Level 10 erforderlich' });
        }

        // Validate state transition
        if (progression.awakening_state === 'awakened') {
          return res.status(400).json({ error: 'Erwachen bereits abgeschlossen' });
        }

        // Update awakening state
        db.run(
          'UPDATE progression SET awakening_state = ? WHERE user_id = ?',
          ['awakened', userId],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Serverfehler' });
            }

            res.json({
              success: true,
              awakeningState: 'awakened'
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Awakening error:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

module.exports = router;
