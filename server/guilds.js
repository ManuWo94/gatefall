// Hunter-Vereinigungen (Guilds)
// Statische Liste - keine Datenbank nötig

const GUILDS = [
  {
    id: 'freie-jaeger-allianz',
    name: 'Freie Jäger-Allianz',
    minimumHunterRank: 'D',
    description: 'Die größte und offenste Vereinigung für aufstrebende Hunter. Jeder ist willkommen, unabhängig vom Rang.',
    goldBonus: 0.10, // +10%
    npcs: [
      { id: 'npc-1', name: 'Rookie Jin', rank: 'D', level: 5, role: 'waechter' },
      { id: 'npc-2', name: 'Anfänger Mira', rank: 'D', level: 7, role: 'heiler' },
      { id: 'npc-3', name: 'Hunter Kael', rank: 'C', level: 12, role: 'jaeger' },
      { id: 'npc-4', name: 'Scout Lyra', rank: 'C', level: 14, role: 'magier' }
    ]
  },
  {
    id: 'eiserne-faust',
    name: 'Eiserne Faust',
    minimumHunterRank: 'D',
    description: 'Krieger und Nahkämpfer, die auf rohe Kraft und Ausdauer setzen. Hier zählt der Wille zu kämpfen.',
    goldBonus: 0.12, // +12%
    npcs: [
      { id: 'npc-5', name: 'Brawler Grom', rank: 'D', level: 8, role: 'waechter' },
      { id: 'npc-6', name: 'Kämpfer Thora', rank: 'C', level: 15, role: 'waechter' },
      { id: 'npc-7', name: 'Krieger Baltus', rank: 'B', level: 22, role: 'waechter' }
    ]
  },
  {
    id: 'schattenlaeufer',
    name: 'Schattenläufer',
    minimumHunterRank: 'C',
    description: 'Agile und listige Hunter, die sich auf Stealth und Geschwindigkeit spezialisieren. Schatten sind ihre Verbündeten.',
    goldBonus: 0.15, // +15%
    npcs: [
      { id: 'npc-8', name: 'Schleicher Nyx', rank: 'C', level: 16, role: 'jaeger' },
      { id: 'npc-9', name: 'Assassine Kira', rank: 'B', level: 25, role: 'jaeger' },
      { id: 'npc-10', name: 'Phantom Zev', rank: 'A', level: 35, role: 'jaeger' }
    ]
  },
  {
    id: 'goldene-krone',
    name: 'Goldene Krone',
    minimumHunterRank: 'B',
    description: 'Elite-Hunter mit hervorragendem taktischen Verständnis. Nur erfahrene Mitglieder werden aufgenommen.',
    goldBonus: 0.20, // +20%
    npcs: [
      { id: 'npc-11', name: 'Taktiker Valen', rank: 'B', level: 28, role: 'magier' },
      { id: 'npc-12', name: 'Stratege Elena', rank: 'A', level: 38, role: 'magier' },
      { id: 'npc-13', name: 'Kommandant Rex', rank: 'A', level: 42, role: 'waechter' }
    ]
  },
  {
    id: 'astraler-bund',
    name: 'Astraler Bund',
    minimumHunterRank: 'B',
    description: 'Magisch begabte Hunter, die die Mysterien der Gates erforschen. Weisheit und Macht vereint.',
    goldBonus: 0.22, // +22%
    npcs: [
      { id: 'npc-14', name: 'Magier Elyndor', rank: 'B', level: 27, role: 'magier' },
      { id: 'npc-15', name: 'Zauberin Seraphina', rank: 'A', level: 36, role: 'magier' },
      { id: 'npc-16', name: 'Erzmagier Aldric', rank: 'S', level: 48, role: 'magier' }
    ]
  },
  {
    id: 'schwarzer-zirkel',
    name: 'Schwarzer Zirkel',
    minimumHunterRank: 'A',
    description: 'Mysteriöse Organisation der mächtigsten Hunter. Ihre Ziele sind unbekannt, ihre Macht jedoch unbestritten.',
    goldBonus: 0.30, // +30%
    npcs: [
      { id: 'npc-17', name: 'Schatten-Hunter Raven', rank: 'A', level: 45, role: 'jaeger' },
      { id: 'npc-18', name: 'Dunkle Klinge Moros', rank: 'S', level: 52, role: 'jaeger' },
      { id: 'npc-19', name: 'Void-Meister Nihil', rank: 'S', level: 58, role: 'magier' }
    ]
  },
  {
    id: 'titanenwaechter',
    name: 'Titanenwächter',
    minimumHunterRank: 'A',
    description: 'Verteidiger der Menschheit gegen die größten Bedrohungen. Nur die Stärksten können sich ihnen anschließen.',
    goldBonus: 0.32, // +32%
    npcs: [
      { id: 'npc-20', name: 'Wächter Gorath', rank: 'A', level: 44, role: 'waechter' },
      { id: 'npc-21', name: 'Titan-Brecher Valka', rank: 'S', level: 55, role: 'waechter' },
      { id: 'npc-22', name: 'Koloss-Jäger Thor', rank: 'SS', level: 65, role: 'waechter' }
    ]
  },
  {
    id: 'schattenklinge',
    name: 'Schattenklinge',
    minimumHunterRank: 'S',
    description: 'Legendäre Einzelgänger und Meisterassassinen. Jedes Mitglied ist eine lebende Legende der S-Klasse.',
    goldBonus: 0.40, // +40%
    npcs: [
      { id: 'npc-23', name: 'Assassine Prime', rank: 'S', level: 60, role: 'jaeger' },
      { id: 'npc-24', name: 'Shadow King Erebus', rank: 'SS', level: 72, role: 'jaeger' },
      { id: 'npc-25', name: 'Blade Master Kenshin', rank: 'SS', level: 75, role: 'jaeger' }
    ]
  },
  {
    id: 'himmlischer-orden',
    name: 'Himmlischer Orden',
    minimumHunterRank: 'SS',
    description: 'Die absolute Elite. Nur die legendärsten Hunter der SS-Klasse haben die Ehre, diesen Orden zu betreten.',
    goldBonus: 0.50, // +50%
    npcs: [
      { id: 'npc-26', name: 'Erzhunter Celestia', rank: 'SS', level: 78, role: 'magier' },
      { id: 'npc-27', name: 'Gott-Jäger Azrael', rank: 'SS', level: 85, role: 'jaeger' },
      { id: 'npc-28', name: 'Apokalypse-Bezwinger Omega', rank: 'SS', level: 92, role: 'waechter' }
    ]
  },
  {
    id: 'sturmbrecher',
    name: 'Sturmbrecher',
    minimumHunterRank: 'C',
    description: 'Wilde und ungestüme Hunter, die mit elementarer Gewalt kämpfen. Hier herrscht das Gesetz des Stärkeren.',
    goldBonus: 0.18, // +18%
    npcs: [
      { id: 'npc-29', name: 'Stürmer Gale', rank: 'C', level: 18, role: 'jaeger' },
      { id: 'npc-30', name: 'Donnerkrieger Raiden', rank: 'B', level: 26, role: 'waechter' },
      { id: 'npc-31', name: 'Blitz-Meister Volt', rank: 'A', level: 40, role: 'magier' }
    ]
  },
  {
    id: 'ewige-waechter',
    name: 'Ewige Wächter',
    minimumHunterRank: 'S',
    description: 'Beschützer der Balance zwischen den Welten. Ihre Aufgabe ist heilig, ihre Pflicht ewig.',
    goldBonus: 0.45, // +45%
    npcs: [
      { name: 'Wächter der Zeit Chronos', rank: 'S', level: 62 },
      { name: 'Hüterin des Raums Astra', rank: 'SS', level: 70 },
      { name: 'Ewigkeits-Sentinel Eon', rank: 'SS', level: 80 }
    ]
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
 * Zufallskomponente mit verschiedenen Ablehnungsgründen, ändert sich wöchentlich
 * @param {string} guildId - Die ID der Gilde
 * @param {string} hunterRank - Hunter-Rang des Spielers
 * @param {number} level - Level des Spielers
 * @param {number} reputation - Reputation des Spielers (optional, default 0)
 * @param {string} userId - User ID für wöchentliche Seed-Berechnung
 * @returns {{accepted: boolean, reason: string}}
 */
function aiGuildDecision(guildId, hunterRank, level, reputation = 0, userId = 'default') {
  const guild = getGuildById(guildId);
  if (!guild) {
    return { accepted: false, reason: 'Vereinigung nicht gefunden' };
  }

  const playerRankLevel = RANK_HIERARCHY[hunterRank] || 0;
  const guildRankLevel = RANK_HIERARCHY[guild.minimumHunterRank] || 0;

  // Wöchentlicher Seed basierend auf Woche des Jahres
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekOfYear = Math.ceil((((now - startOfYear) / 86400000) + startOfYear.getDay() + 1) / 7);
  
  // Kombinierter Seed aus userId, guildId und Woche
  const seedString = `${userId}-${guildId}-${weekOfYear}`;
  let seedHash = 0;
  for (let i = 0; i < seedString.length; i++) {
    seedHash = ((seedHash << 5) - seedHash) + seedString.charCodeAt(i);
    seedHash = seedHash & seedHash;
  }
  
  // Seeded Random zwischen 0 und 1
  const seededRandom = Math.abs(Math.sin(seedHash) * 10000) % 1;
  
  // Verschiedene Ablehnungsgründe
  const rejectionReasons = [
    {
      code: 'NOT_RECRUITING',
      message: 'Die Vereinigung sucht derzeit keine neuen Mitglieder. Versuche es nächste Woche erneut.',
      weight: 0.25
    },
    {
      code: 'NOT_FIT',
      message: 'Nach Prüfung deiner Fähigkeiten passt du derzeit nicht zu unserem Profil. Entwickle dich weiter.',
      weight: 0.25
    },
    {
      code: 'RANK_TOO_LOW',
      message: 'Dein Hunter-Rang ist zwar ausreichend, aber wir suchen momentan erfahrenere Mitglieder.',
      weight: 0.20
    },
    {
      code: 'NO_DEMAND',
      message: `Die Vereinigung hat derzeit keinen Bedarf an Huntern des Ranges ${hunterRank}. Versuche es später erneut.`,
      weight: 0.15
    },
    {
      code: 'QUOTA_FULL',
      message: 'Unser Kontingent für diesen Rang ist bereits voll. Bewirb dich nächste Woche erneut.',
      weight: 0.15
    }
  ];

  // Prüfung: Spieler erfüllt nicht den Mindestrang
  if (playerRankLevel < guildRankLevel) {
    return { 
      accepted: false, 
      reason: `Abgelehnt: Du entsprichst nicht den Erwartungen. Mindestens Hunter-Rang ${guild.minimumHunterRank} erforderlich.` 
    };
  }

  // Wahrscheinlichkeit basierend auf verschiedenen Faktoren
  const rankDifference = playerRankLevel - guildRankLevel;
  
  let baseChance = 0.40; // 40% Basiswahrscheinlichkeit (reduziert für mehr Herausforderung)
  
  // Rang-Bonus: +15% pro Rang über Minimum
  const rankBonus = rankDifference * 0.15;
  
  // Level-Bonus: +1% pro 5 Level
  const levelBonus = Math.floor(level / 5) * 0.01;
  
  // Reputation-Bonus: +5% pro 100 Reputation
  const repBonus = Math.floor(reputation / 100) * 0.05;
  
  // Wöchentliche Zufallskomponente (-10% bis +10%)
  const weeklyModifier = (seededRandom - 0.5) * 0.20;
  
  const totalChance = Math.min(0.85, Math.max(0.10, baseChance + rankBonus + levelBonus + repBonus + weeklyModifier));
  
  // Zweiter Random-Check für die eigentliche Entscheidung (nicht geseeded)
  const decisionRandom = Math.random();
  const accepted = decisionRandom < totalChance;
  
  console.log(`🎲 KI-Entscheidung für ${guild.name}:`);
  console.log(`   Chance: ${(totalChance * 100).toFixed(1)}% (Base: ${(baseChance*100).toFixed(0)}%, Rang: +${(rankBonus*100).toFixed(0)}%, Level: +${(levelBonus*100).toFixed(0)}%, Woche: ${weeklyModifier >= 0 ? '+' : ''}${(weeklyModifier*100).toFixed(0)}%)`);
  console.log(`   Würfel: ${(decisionRandom * 100).toFixed(1)}% → ${accepted ? 'AKZEPTIERT ✅' : 'ABGELEHNT ❌'}`);
  
  if (accepted) {
    return {
      accepted: true,
      reason: `Willkommen bei ${guild.name}! Deine Bewerbung wurde akzeptiert.`
    };
  } else {
    // Wähle einen Ablehnungsgrund basierend auf Gewichtung
    let randomValue = Math.random();
    let cumulativeWeight = 0;
    
    for (const rejection of rejectionReasons) {
      cumulativeWeight += rejection.weight;
      if (randomValue <= cumulativeWeight) {
        return {
          accepted: false,
          reason: `Abgelehnt: ${rejection.message}`
        };
      }
    }
    
    // Fallback
    return {
      accepted: false,
      reason: 'Abgelehnt: Deine Bewerbung wurde geprüft, aber nicht angenommen. Versuche es nächste Woche erneut.'
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
