// Hunter-Vereinigungen (Guilds)
// Statische Liste - keine Datenbank nötig

const GUILDS = [
  {
    id: 'allgemeine-jägergilde',
    name: 'Allgemeine Jägergilde',
    minimumHunterRank: 'D',
    description: 'Die größte Vereinigung für alle Hunter. Offen für jeden Rang.',
    goldBonus: 0.10 // +10%
  },
  {
    id: 'eiserne-faust',
    name: 'Eiserne Faust',
    minimumHunterRank: 'C',
    description: 'Spezialisiert auf Nahkampf und physische Stärke.',
    goldBonus: 0.15 // +15%
  },
  {
    id: 'goldene-krone',
    name: 'Goldene Krone',
    minimumHunterRank: 'B',
    description: 'Elite-Hunter mit Fokus auf strategische Dungeons.',
    goldBonus: 0.20 // +20%
  },
  {
    id: 'schwarzer-zirkel',
    name: 'Schwarzer Zirkel',
    minimumHunterRank: 'A',
    description: 'Mysteriöse Vereinigung der mächtigsten Hunter.',
    goldBonus: 0.30 // +30%
  },
  {
    id: 'schattenklinge',
    name: 'Schattenklinge',
    minimumHunterRank: 'S',
    description: 'Legendäre Assassinen und Einzelgänger der S-Klasse.',
    goldBonus: 0.40 // +40%
  },
  {
    id: 'himmlischer-orden',
    name: 'Himmlischer Orden',
    minimumHunterRank: 'SS',
    description: 'Die absolute Elite. Nur die stärksten Hunter werden akzeptiert.',
    goldBonus: 0.50 // +50%
  }
];

// Rang-Hierarchie für Vergleiche
const RANK_HIERARCHY = {
  'D': 0,
  'C': 1,
  'B': 2,
  'A': 3,
  'S': 4,
  'SS': 5
};

function getGuildById(guildId) {
  return GUILDS.find(g => g.id === guildId);
}

function getAvailableGuilds(hunterRank) {
  const playerRankLevel = RANK_HIERARCHY[hunterRank] || 0;
  
  return GUILDS.filter(guild => {
    const guildRankLevel = RANK_HIERARCHY[guild.minimumHunterRank] || 0;
    return playerRankLevel >= guildRankLevel;
  });
}

function canJoinGuild(hunterRank, guildId) {
  const guild = getGuildById(guildId);
  if (!guild) return false;
  
  const playerRankLevel = RANK_HIERARCHY[hunterRank] || 0;
  const guildRankLevel = RANK_HIERARCHY[guild.minimumHunterRank] || 0;
  
  return playerRankLevel >= guildRankLevel;
}

/**
 * AI-basierte Beitritts-Entscheidung für NPC-Gilden
 * @param {string} guildId - Die ID der Gilde
 * @param {string} hunterRank - Hunter-Rang des Spielers
 * @param {number} level - Level des Spielers
 * @param {number} reputation - Reputation des Spielers (optional, default 0)
 * @returns {{accepted: boolean, reason: string}}
 */
function aiGuildDecision(guildId, hunterRank, level, reputation = 0) {
  const guild = getGuildById(guildId);
  if (!guild) {
    return { accepted: false, reason: 'Vereinigung nicht gefunden' };
  }

  // Mindestrang prüfen
  if (!canJoinGuild(hunterRank, guildId)) {
    return { 
      accepted: false, 
      reason: `Hunter-Rang ${guild.minimumHunterRank} erforderlich` 
    };
  }

  // KI-Entscheidung basierend auf Gilde
  const playerRankLevel = RANK_HIERARCHY[hunterRank] || 0;
  const guildRankLevel = RANK_HIERARCHY[guild.minimumHunterRank] || 0;
  
  // Wahrscheinlichkeit basierend auf Rangunterschied
  // Je höher der Rang über Minimum, desto höher die Chance
  const rankDifference = playerRankLevel - guildRankLevel;
  
  let baseChance = 0.60; // 60% Basiswahrscheinlichkeit
  
  // Rang-Bonus: +10% pro Rang über Minimum
  const rankBonus = rankDifference * 0.10;
  
  // Level-Bonus: +1% pro 5 Level
  const levelBonus = Math.floor(level / 5) * 0.01;
  
  // Reputation-Bonus: +5% pro 100 Reputation
  const repBonus = Math.floor(reputation / 100) * 0.05;
  
  const totalChance = Math.min(0.95, baseChance + rankBonus + levelBonus + repBonus);
  
  const random = Math.random();
  const accepted = random < totalChance;
  
  console.log(`🎲 KI-Entscheidung für ${guild.name}: ${(totalChance * 100).toFixed(1)}% Chance, Würfel: ${(random * 100).toFixed(1)}% → ${accepted ? 'AKZEPTIERT' : 'ABGELEHNT'}`);
  
  if (accepted) {
    return {
      accepted: true,
      reason: `Willkommen bei ${guild.name}! Deine Bewerbung wurde akzeptiert.`
    };
  } else {
    const reasons = [
      'Deine Fähigkeiten entsprechen noch nicht unseren Anforderungen.',
      'Wir suchen derzeit nach erfahreneren Huntern.',
      'Deine Bewerbung wurde geprüft, aber abgelehnt.',
      'Sammle mehr Erfahrung und bewirb dich erneut.'
    ];
    return {
      accepted: false,
      reason: reasons[Math.floor(Math.random() * reasons.length)]
    };
  }
}

module.exports = {
  GUILDS,
  RANK_HIERARCHY,
  getGuildById,
  getAvailableGuilds,
  canJoinGuild,
  aiGuildDecision
};
