const express = require('express');
const db = require('../db');
const { GUILDS, getGuildById, getAvailableGuilds, canJoinGuild, aiGuildDecision } = require('../guilds');

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
          'SELECT level, xp, gold, awakening_state, hunter_rank, guild_id FROM progression WHERE user_id = ?',
          [userId],
          (err, progression) => {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Serverfehler beim Laden des Profils' });
            }

            if (!progression) {
              return res.status(404).json({ error: 'Progression nicht gefunden' });
            }

            // Guild-Name holen (NPC oder Player)
            let guildName = null;
            if (progression.guild_id) {
              const npcGuild = getGuildById(progression.guild_id);
              if (npcGuild) {
                guildName = npcGuild.name;
                return sendResponse();
              } else {
                // Player-Guild
                db.get(
                  'SELECT name FROM player_guilds WHERE id = ?',
                  [progression.guild_id],
                  (err, playerGuild) => {
                    if (!err && playerGuild) {
                      guildName = playerGuild.name;
                    }
                    sendResponse();
                  }
                );
                return;
              }
            }

            function sendResponse() {
              res.json({
                email: user.email,
                displayName: user.display_name,
                emailVerified: !!user.email_verified_at,
                emailVerifiedAt: user.email_verified_at,
                progression: {
                  level: progression.level,
                  xp: progression.xp,
                  gold: progression.gold,
                  awakeningState: progression.awakening_state || 'locked',
                  hunterRank: progression.hunter_rank || 'D',
                  guildId: progression.guild_id || null,
                  guildName: guildName
                }
              });
            }

            sendResponse();
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
    // Hole aktuelle Progression für Hunter-Rang-Check
    db.get(
      'SELECT level, awakening_state, hunter_rank FROM progression WHERE user_id = ?',
      [userId],
      (err, currentProg) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Serverfehler beim Speichern' });
        }

        if (!currentProg) {
          return res.status(404).json({ error: 'Progression nicht gefunden' });
        }

        // Hunter-Rang-Progression (nur nach Awakening)
        let newHunterRank = currentProg.hunter_rank || 'D';
        const isAwakened = currentProg.awakening_state === 'awakened';

        if (isAwakened) {
          // Level → Hunter Rang Mapping
          if (level >= 50) newHunterRank = 'SS';
          else if (level >= 40) newHunterRank = 'S';
          else if (level >= 30) newHunterRank = 'A';
          else if (level >= 20) newHunterRank = 'B';
          else if (level >= 10) newHunterRank = 'C';
        }

        // Log wenn Rang aufgestiegen ist
        if (newHunterRank !== currentProg.hunter_rank) {
          console.log(`🎖️  Hunter-Rang aufgestiegen: ${currentProg.hunter_rank} → ${newHunterRank}`);
        }

        db.run(
          'UPDATE progression SET level = ?, xp = ?, gold = ?, hunter_rank = ? WHERE user_id = ?',
          [level, xp, gold, newHunterRank, userId],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Serverfehler beim Speichern' });
            }

            if (this.changes === 0) {
              return res.status(404).json({ error: 'Progression nicht gefunden' });
            }

            const response = {
              success: true,
              progression: { level, xp, gold, hunterRank: newHunterRank }
            };

            // Benachrichtigung wenn Rang aufgestiegen
            if (newHunterRank !== currentProg.hunter_rank) {
              response.hunterRankUp = {
                from: currentProg.hunter_rank,
                to: newHunterRank
              };
            }

            res.json(response);
          }
        );
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
      'SELECT level, awakening_state, hunter_rank FROM progression WHERE user_id = ?',
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

        console.log('🌟 Erwachen abgeschlossen! Hunter-Rang: D → C');

        // Update awakening state AND set hunter rank to C
        db.run(
          'UPDATE progression SET awakening_state = ?, hunter_rank = ? WHERE user_id = ?',
          ['awakened', 'C', userId],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Serverfehler' });
            }

            res.json({
              success: true,
              awakeningState: 'awakened',
              hunterRank: 'C'
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

// GET /api/guilds - Liste aller Vereinigungen (NPC + Player)
router.get('/guilds', requireAuth, (req, res) => {
  const userId = req.session.userId;

  try {
    // Hole Hunter-Rang des Spielers
    db.get(
      'SELECT hunter_rank FROM progression WHERE user_id = ?',
      [userId],
      (err, progression) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Serverfehler' });
        }

        if (!progression) {
          return res.status(404).json({ error: 'Progression nicht gefunden' });
        }

        const hunterRank = progression.hunter_rank || 'D';
        const availableNpcGuilds = getAvailableGuilds(hunterRank);

        // Hole auch Player-Guilds
        db.all(
          `SELECT pg.*, u.display_name as owner_name 
           FROM player_guilds pg 
           JOIN users u ON pg.owner_id = u.id 
           ORDER BY pg.created_at DESC`,
          [],
          (err, playerGuilds) => {
            if (err) {
              console.error('Database error:', err);
              // Nicht kritisch, gebe nur NPC-Guilds zurück
              playerGuilds = [];
            }

            res.json({
              npcGuilds: GUILDS,
              playerGuilds: playerGuilds || [],
              availableNpcGuilds: availableNpcGuilds.map(g => g.id),
              currentHunterRank: hunterRank
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Guilds error:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// POST /api/guild/join - Vereinigung beitreten (NPC oder Player-Guild)
router.post('/guild/join', requireAuth, (req, res) => {
  const { guildId } = req.body;
  const userId = req.session.userId;

  if (!guildId) {
    return res.status(400).json({ error: 'Guild ID erforderlich' });
  }

  try {
    db.get(
      'SELECT hunter_rank, guild_id FROM progression WHERE user_id = ?',
      [userId],
      (err, progression) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Serverfehler' });
        }

        if (!progression) {
          return res.status(404).json({ error: 'Progression nicht gefunden' });
        }

        // Bereits in Vereinigung?
        if (progression.guild_id) {
          return res.status(400).json({ error: 'Du bist bereits in einer Vereinigung' });
        }

        const hunterRank = progression.hunter_rank || 'D';

        // Prüfe ob NPC-Guild oder Player-Guild
        const npcGuild = getGuildById(guildId);
        
        if (npcGuild) {
          // NPC-Guild: Direkter Beitritt (alte Logik)
          if (!canJoinGuild(hunterRank, guildId)) {
            return res.status(403).json({ 
              error: `Hunter-Rang ${npcGuild.minimumHunterRank} erforderlich. Dein Rang: ${hunterRank}` 
            });
          }

          console.log(`🏰 Vereinigung beigetreten: ${npcGuild.name}`);

          db.run(
            'UPDATE progression SET guild_id = ? WHERE user_id = ?',
            [guildId, userId],
            function(err) {
              if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Serverfehler' });
              }

              res.json({
                success: true,
                guildId: guildId,
                guildName: npcGuild.name,
                message: `Vereinigung beigetreten: ${npcGuild.name}`
              });
            }
          );
        } else {
          // Player-Guild: Prüfe ob existiert
          db.get(
            'SELECT * FROM player_guilds WHERE id = ?',
            [guildId],
            (err, playerGuild) => {
              if (err || !playerGuild) {
                return res.status(404).json({ error: 'Vereinigung nicht gefunden' });
              }

              // Rang-Check für Player-Guild
              const RANK_HIERARCHY = { 'D': 0, 'C': 1, 'B': 2, 'A': 3, 'S': 4, 'SS': 5 };
              const playerRankLevel = RANK_HIERARCHY[hunterRank] || 0;
              const guildRankLevel = RANK_HIERARCHY[playerGuild.minimum_hunter_rank] || 0;

              if (playerRankLevel < guildRankLevel) {
                return res.status(403).json({ 
                  error: `Hunter-Rang ${playerGuild.minimum_hunter_rank} erforderlich. Dein Rang: ${hunterRank}` 
                });
              }

              console.log(`🏰 Player-Vereinigung beigetreten: ${playerGuild.name}`);

              db.run(
                'UPDATE progression SET guild_id = ? WHERE user_id = ?',
                [guildId, userId],
                function(err) {
                  if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Serverfehler' });
                  }

                  res.json({
                    success: true,
                    guildId: guildId,
                    guildName: playerGuild.name,
                    isPlayerGuild: true,
                    message: `Vereinigung beigetreten: ${playerGuild.name}`
                  });
                }
              );
            }
          );
        }
      }
    );
  } catch (error) {
    console.error('Join guild error:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// POST /api/guild/leave - Vereinigung verlassen
router.post('/guild/leave', requireAuth, (req, res) => {
  const userId = req.session.userId;

  try {
    db.get(
      'SELECT guild_id FROM progression WHERE user_id = ?',
      [userId],
      (err, progression) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Serverfehler' });
        }

        if (!progression) {
          return res.status(404).json({ error: 'Progression nicht gefunden' });
        }

        if (!progression.guild_id) {
          return res.status(400).json({ error: 'Du bist in keiner Vereinigung' });
        }

        const guild = getGuildById(progression.guild_id);
        console.log(`🏰 Vereinigung verlassen: ${guild ? guild.name : progression.guild_id}`);

        db.run(
          'UPDATE progression SET guild_id = NULL WHERE user_id = ?',
          [userId],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Serverfehler' });
            }

            res.json({
              success: true,
              message: 'Vereinigung verlassen'
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Leave guild error:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// POST /api/guild/apply - Bewerbung bei NPC-Vereinigung (mit KI-Entscheidung)
router.post('/guild/apply', requireAuth, (req, res) => {
  const { guildId } = req.body;
  const userId = req.session.userId;

  if (!guildId) {
    return res.status(400).json({ error: 'Guild ID erforderlich' });
  }

  const guild = getGuildById(guildId);
  if (!guild) {
    return res.status(404).json({ error: 'Vereinigung nicht gefunden' });
  }

  try {
    db.get(
      'SELECT hunter_rank, guild_id, level FROM progression WHERE user_id = ?',
      [userId],
      (err, progression) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Serverfehler' });
        }

        if (!progression) {
          return res.status(404).json({ error: 'Progression nicht gefunden' });
        }

        // Bereits in Vereinigung?
        if (progression.guild_id) {
          return res.status(400).json({ error: 'Du bist bereits in einer Vereinigung' });
        }

        const hunterRank = progression.hunter_rank || 'D';
        const level = progression.level || 1;

        // KI-Entscheidung
        const decision = aiGuildDecision(guildId, hunterRank, level, 0);

        if (decision.accepted) {
          // Sofort beitreten
          db.run(
            'UPDATE progression SET guild_id = ? WHERE user_id = ?',
            [guildId, userId],
            function(err) {
              if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Serverfehler' });
              }

              console.log(`✅ KI-Bewerbung akzeptiert: ${guild.name}`);
              res.json({
                success: true,
                accepted: true,
                guildId: guildId,
                guildName: guild.name,
                message: decision.reason
              });
            }
          );
        } else {
          console.log(`❌ KI-Bewerbung abgelehnt: ${guild.name}`);
          res.json({
            success: true,
            accepted: false,
            message: decision.reason
          });
        }
      }
    );
  } catch (error) {
    console.error('Apply guild error:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// POST /api/guild/create - Eigene Vereinigung erstellen
router.post('/guild/create', requireAuth, (req, res) => {
  const { name, description, minimumHunterRank } = req.body;
  const userId = req.session.userId;

  if (!name || !description) {
    return res.status(400).json({ error: 'Name und Beschreibung erforderlich' });
  }

  const validRanks = ['D', 'C', 'B', 'A', 'S', 'SS'];
  if (minimumHunterRank && !validRanks.includes(minimumHunterRank)) {
    return res.status(400).json({ error: 'Ungültiger Mindestrang' });
  }

  try {
    db.get(
      'SELECT hunter_rank, guild_id, level, gold FROM progression WHERE user_id = ?',
      [userId],
      (err, progression) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Serverfehler' });
        }

        if (!progression) {
          return res.status(404).json({ error: 'Progression nicht gefunden' });
        }

        // Für jetzt: Keine Bedingungen (später: Geld, Level, Ruf)
        // TODO: Später Bedingungen hinzufügen
        // - Kosten: z.B. 10000 Gold
        // - Mindestlevel: z.B. 40
        // - Reputation: z.B. 500

        // Bereits in Vereinigung?
        if (progression.guild_id) {
          return res.status(400).json({ error: 'Du bist bereits in einer Vereinigung' });
        }

        // Generiere unique ID
        const guildId = `player-guild-${Date.now()}-${userId}`;
        const minRank = minimumHunterRank || 'D';

        db.run(
          'INSERT INTO player_guilds (id, name, description, owner_id, minimum_hunter_rank, gold_bonus, reputation) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [guildId, name, description, userId, minRank, 0.10, 0],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Vereinigung konnte nicht erstellt werden' });
            }

            // Automatisch beitreten
            db.run(
              'UPDATE progression SET guild_id = ? WHERE user_id = ?',
              [guildId, userId],
              function(err) {
                if (err) {
                  console.error('Database error:', err);
                  return res.status(500).json({ error: 'Beitritt fehlgeschlagen' });
                }

                console.log(`🏰 Neue Vereinigung erstellt: ${name} (${guildId})`);
                res.json({
                  success: true,
                  guildId: guildId,
                  guildName: name,
                  message: `Vereinigung "${name}" erfolgreich erstellt!`
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Create guild error:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// GET /api/guild/player-guilds - Liste aller Player-Guilds
router.get('/player-guilds', requireAuth, (req, res) => {
  try {
    db.all(
      `SELECT pg.*, u.display_name as owner_name 
       FROM player_guilds pg 
       JOIN users u ON pg.owner_id = u.id 
       ORDER BY pg.created_at DESC`,
      [],
      (err, guilds) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Serverfehler' });
        }

        res.json({
          playerGuilds: guilds || []
        });
      }
    );
  } catch (error) {
    console.error('Get player guilds error:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

module.exports = router;
