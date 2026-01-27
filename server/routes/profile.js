const express = require('express');
const db = require('../db-mysql');

const router = express.Router();

// Middleware: Prüft ob User eingeloggt ist
function requireAuth(req, res, next) {
  console.log('🔒 requireAuth - Session ID:', req.sessionID);
  console.log('🔒 requireAuth - userId in Session:', req.session.userId);
  
  if (!req.session.userId) {
    console.log('❌ Keine userId in Session - 401 Unauthorized');
    return res.status(401).json({ error: 'Nicht authentifiziert' });
  }
  
  console.log('✅ requireAuth erfolgreich für User:', req.session.userId);
  next();
}

// GET /api/profile
router.get('/', requireAuth, async (req, res) => {
  console.log('📊 Profile Request für User:', req.session.userId);
  
  try {
    const userId = req.session.userId;
    const user = await db.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Benutzer nicht gefunden' });
    }

    // Guild-Name holen falls vorhanden
    let guildName = null;
    if (user.guild_id) {
      const guild = await db.queryOne('SELECT name FROM guilds WHERE id = ?', [user.guild_id]);
      if (guild) {
        guildName = guild.name;
      }
    }

    res.json({
      email: user.email,
      displayName: user.display_name,
      isAdmin: !!user.is_admin,
      emailVerified: !!user.email_verified_at,
      emailVerifiedAt: user.email_verified_at,
      progression: {
        level: user.level,
        xp: user.experience,
        gold: user.gold,
        awakeningState: user.awakening_state || 'locked',
        hunterRank: user.hunter_rank || 'E',
        role: user.role || 'waechter',
        guildId: user.guild_id || null,
        guildName: guildName
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Serverfehler beim Laden des Profils' });
  }
});

// POST /api/progression/save
router.post('/save', requireAuth, async (req, res) => {
  const { level, xp, gold } = req.body;
  const userId = req.session.userId;

  if (typeof level !== 'number' || typeof xp !== 'number' || typeof gold !== 'number') {
    return res.status(400).json({ error: 'Ungültige Progression-Daten' });
  }

  try {
    const currentProg = await db.getUserById(userId);

    if (!currentProg) {
      return res.status(404).json({ error: 'Progression nicht gefunden' });
    }

    let newHunterRank = currentProg.hunter_rank || 'E';
    const isAwakened = currentProg.awakening_state === 'completed';

    if (isAwakened) {
      if (level >= 50) newHunterRank = 'SSS';
      else if (level >= 45) newHunterRank = 'SS';
      else if (level >= 40) newHunterRank = 'S';
      else if (level >= 30) newHunterRank = 'A';
      else if (level >= 20) newHunterRank = 'B';
      else if (level >= 10) newHunterRank = 'C';
    }

    if (newHunterRank !== currentProg.hunter_rank) {
      console.log(`🎖️  Hunter-Rang aufgestiegen: ${currentProg.hunter_rank} → ${newHunterRank}`);
    }

    await db.updatePlayerStats(userId, {
      level,
      experience: xp,
      gold,
      hunter_rank: newHunterRank
    });

    const response = {
      success: true,
      progression: { level, xp, gold, hunterRank: newHunterRank }
    };

    if (newHunterRank !== currentProg.hunter_rank) {
      response.hunterRankUp = {
        from: currentProg.hunter_rank,
        to: newHunterRank
      };
    }

    res.json(response);
  } catch (error) {
    console.error('Save progression error:', error);
    res.status(500).json({ error: 'Serverfehler beim Speichern' });
  }
});

// POST /api/awakening/complete
router.post('/awakening/complete', requireAuth, async (req, res) => {
  const userId = req.session.userId;

  try {
    const progression = await db.getUserById(userId);

    if (!progression) {
      return res.status(404).json({ error: 'Progression nicht gefunden' });
    }

    if (progression.level < 10) {
      return res.status(400).json({ error: 'Level 10 erforderlich' });
    }

    if (progression.awakening_state === 'completed') {
      return res.status(400).json({ error: 'Erwachen bereits abgeschlossen' });
    }

    console.log('🌟 Erwachen abgeschlossen! Hunter-Rang: E → C');

    await db.updatePlayerStats(userId, {
      awakening_state: 'completed',
      hunter_rank: 'C'
    });

    res.json({
      success: true,
      awakeningState: 'completed',
      hunterRank: 'C'
    });
  } catch (error) {
    console.error('Awakening error:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// GET /api/guilds
router.get('/guilds', requireAuth, async (req, res) => {
  const userId = req.session.userId;

  try {
    const user = await db.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User nicht gefunden' });
    }

    const guilds = await db.getAllGuilds();

    res.json({
      guilds: guilds || [],
      playerHunterRank: user.hunter_rank
    });
  } catch (error) {
    console.error('Get guilds error:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// POST /api/guild/join
router.post('/guild/join', requireAuth, async (req, res) => {
  const { guildId } = req.body;
  const userId = req.session.userId;

  if (!guildId) {
    return res.status(400).json({ error: 'Guild ID erforderlich' });
  }

  try {
    const user = await db.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User nicht gefunden' });
    }

    if (user.guild_id) {
      return res.status(400).json({ error: 'Du bist bereits in einer Vereinigung' });
    }

    const guild = await db.queryOne('SELECT * FROM guilds WHERE id = ?', [guildId]);

    if (!guild) {
      return res.status(404).json({ error: 'Vereinigung nicht gefunden' });
    }

    // Check requirements
    const RANK_HIERARCHY = { 'E': 0, 'D': 1, 'C': 2, 'B': 3, 'A': 4, 'S': 5, 'SS': 6, 'SSS': 7 };
    const playerRankLevel = RANK_HIERARCHY[user.hunter_rank] || 0;
    const requiredRankLevel = RANK_HIERARCHY[guild.min_hunter_rank] || 0;

    if (playerRankLevel < requiredRankLevel) {
      return res.status(403).json({ 
        error: `Hunter-Rang ${guild.min_hunter_rank} erforderlich` 
      });
    }

    if (user.level < guild.min_level) {
      return res.status(403).json({ 
        error: `Level ${guild.min_level} erforderlich` 
      });
    }

    await db.joinGuild(userId, guildId);

    console.log(`🏰 ${user.display_name} ist ${guild.name} beigetreten`);
    res.json({
      success: true,
      guildId: guildId,
      guildName: guild.name,
      message: `Erfolgreich ${guild.name} beigetreten!`
    });
  } catch (error) {
    console.error('Join guild error:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// POST /api/guild/leave
router.post('/guild/leave', requireAuth, async (req, res) => {
  const userId = req.session.userId;

  try {
    const user = await db.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User nicht gefunden' });
    }

    if (!user.guild_id) {
      return res.status(400).json({ error: 'Du bist in keiner Vereinigung' });
    }

    await db.leaveGuild(userId);

    console.log(`🏰 User ${userId} hat Vereinigung verlassen`);
    res.json({
      success: true,
      message: 'Vereinigung erfolgreich verlassen'
    });
  } catch (error) {
    console.error('Leave guild error:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// POST /api/guild/create
router.post('/guild/create', requireAuth, async (req, res) => {
  const { name, description, minimumHunterRank, minimumLevel } = req.body;
  const userId = req.session.userId;

  if (!name || !description) {
    return res.status(400).json({ error: 'Name und Beschreibung erforderlich' });
  }

  const validRanks = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
  const minRank = minimumHunterRank || 'E';
  
  if (!validRanks.includes(minRank)) {
    return res.status(400).json({ error: 'Ungültiger Mindestrang' });
  }

  try {
    const user = await db.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User nicht gefunden' });
    }

    // Bedingung: Mindestens SS-Rang erforderlich
    const RANK_HIERARCHY = { 'E': 0, 'D': 1, 'C': 2, 'B': 3, 'A': 4, 'S': 5, 'SS': 6, 'SSS': 7 };
    const playerRankLevel = RANK_HIERARCHY[user.hunter_rank] || 0;

    if (playerRankLevel < 6) { // SS = 6
      return res.status(403).json({ 
        error: `Hunter-Rang SS erforderlich, um eine eigene Vereinigung zu gründen. Dein aktueller Rang: ${user.hunter_rank}` 
      });
    }

    if (user.guild_id) {
      return res.status(400).json({ error: 'Du bist bereits in einer Vereinigung' });
    }

    const guild = await db.createGuild(
      name,
      description,
      userId,
      minRank,
      minimumLevel || 1
    );

    console.log(`🏰 Neue Vereinigung erstellt: ${name} (ID: ${guild.id})`);
    res.json({
      success: true,
      guildId: guild.id,
      guildName: guild.name,
      message: `Vereinigung "${name}" erfolgreich erstellt!`
    });
  } catch (error) {
    console.error('Create guild error:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

module.exports = router;
