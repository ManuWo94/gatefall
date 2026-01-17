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

module.exports = {
  GUILDS,
  RANK_HIERARCHY,
  getGuildById,
  getAvailableGuilds,
  canJoinGuild
};
