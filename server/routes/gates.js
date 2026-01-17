const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * GET /api/gates
 * Holt die täglichen Gates für den aktuellen Spieler
 */
router.get('/', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Nicht authentifiziert' });
  }

  const userId = req.user.id;
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  db.get(
    'SELECT completed_gate_ids FROM player_gates WHERE user_id = ? AND gate_date = ?',
    [userId, today],
    (err, row) => {
      if (err) {
        console.error('Fehler beim Laden der Gates:', err);
        return res.status(500).json({ error: 'Serverfehler' });
      }

      const completedGateIds = row ? JSON.parse(row.completed_gate_ids || '[]') : [];
      
      res.json({
        date: today,
        completedGateIds
      });
    }
  );
});

/**
 * POST /api/gates/complete
 * Markiert ein Gate als abgeschlossen
 */
router.post('/complete', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Nicht authentifiziert' });
  }

  const userId = req.user.id;
  const { gateId } = req.body;
  const today = new Date().toISOString().split('T')[0];

  if (!gateId) {
    return res.status(400).json({ error: 'Gate ID fehlt' });
  }

  // Hole aktuelle completed Gates
  db.get(
    'SELECT completed_gate_ids FROM player_gates WHERE user_id = ? AND gate_date = ?',
    [userId, today],
    (err, row) => {
      if (err) {
        console.error('Fehler beim Laden der Gates:', err);
        return res.status(500).json({ error: 'Serverfehler' });
      }

      const completedGateIds = row ? JSON.parse(row.completed_gate_ids || '[]') : [];
      
      // Füge neue Gate-ID hinzu
      if (!completedGateIds.includes(gateId)) {
        completedGateIds.push(gateId);
      }

      // Speichere zurück
      if (row) {
        // Update existierender Eintrag
        db.run(
          'UPDATE player_gates SET completed_gate_ids = ? WHERE user_id = ? AND gate_date = ?',
          [JSON.stringify(completedGateIds), userId, today],
          (err) => {
            if (err) {
              console.error('Fehler beim Aktualisieren der Gates:', err);
              return res.status(500).json({ error: 'Serverfehler' });
            }

            res.json({
              success: true,
              completedGateIds
            });
          }
        );
      } else {
        // Neuer Eintrag für heute
        db.run(
          'INSERT INTO player_gates (user_id, gate_date, completed_gate_ids) VALUES (?, ?, ?)',
          [userId, today, JSON.stringify(completedGateIds)],
          (err) => {
            if (err) {
              console.error('Fehler beim Erstellen der Gates:', err);
              return res.status(500).json({ error: 'Serverfehler' });
            }

            res.json({
              success: true,
              completedGateIds
            });
          }
        );
      }
    }
  );
});

module.exports = router;
