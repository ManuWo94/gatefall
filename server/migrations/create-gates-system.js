const db = require('../db-mysql');

console.log('📦 Creating Gates System Tables...');

// Gate Images Table
const gateImagesTable = `
CREATE TABLE IF NOT EXISTS gate_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  gate_type ENUM('standard', 'instabil', 'elite', 'katastrophe', 'geheim') DEFAULT 'standard',
  rarity ENUM('common', 'uncommon', 'rare', 'epic', 'legendary') DEFAULT 'common',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// Active Gates Table (spawned gates in the world)
const activeGatesTable = `
CREATE TABLE IF NOT EXISTS active_gates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  player_id INT NOT NULL,
  gate_image_id INT,
  gate_type ENUM('standard', 'instabil', 'elite', 'katastrophe', 'geheim') NOT NULL,
  rank ENUM('D', 'C', 'B', 'A', 'S', 'SS') NOT NULL,
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  
  -- Gate Status
  status ENUM('spawning', 'open', 'active', 'closing', 'cleared', 'failed') DEFAULT 'open',
  opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closes_at TIMESTAMP NULL,
  
  -- Gate Properties
  boss_name VARCHAR(255),
  boss_level INT DEFAULT 1,
  boss_multiplier FLOAT DEFAULT 1.0,
  required_players INT DEFAULT 1,
  current_players INT DEFAULT 0,
  
  -- Rewards
  base_xp INT DEFAULT 100,
  base_gold INT DEFAULT 50,
  loot_multiplier FLOAT DEFAULT 1.0,
  
  -- Modifiers
  modifiers JSON,
  
  -- Stats
  first_clear_by INT NULL,
  total_attempts INT DEFAULT 0,
  successful_clears INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (player_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (gate_image_id) REFERENCES gate_images(id) ON DELETE SET NULL,
  FOREIGN KEY (first_clear_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_player_status (player_id, status),
  INDEX idx_gate_type (gate_type),
  INDEX idx_closes_at (closes_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// Gate Clears History
const gateClearsTable = `
CREATE TABLE IF NOT EXISTS gate_clears (
  id INT PRIMARY KEY AUTO_INCREMENT,
  gate_id INT NOT NULL,
  player_id INT NOT NULL,
  clear_time_seconds INT,
  is_first_clear BOOLEAN DEFAULT FALSE,
  xp_gained INT DEFAULT 0,
  gold_gained INT DEFAULT 0,
  cleared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (gate_id) REFERENCES active_gates(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_player (player_id),
  INDEX idx_gate (gate_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

// World Status Table (für Gate-Spawning Logik)
const worldStatusTable = `
CREATE TABLE IF NOT EXISTS world_status (
  id INT PRIMARY KEY AUTO_INCREMENT,
  active_players INT DEFAULT 0,
  average_hunter_rank VARCHAR(10) DEFAULT 'D',
  total_gates_cleared INT DEFAULT 0,
  current_wave INT DEFAULT 1,
  next_wave_at TIMESTAMP NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

async function migrate() {
  try {
    await db.query(gateImagesTable);
    console.log('✅ gate_images table created');
    
    await db.query(activeGatesTable);
    console.log('✅ active_gates table created');
    
    await db.query(gateClearsTable);
    console.log('✅ gate_clears table created');
    
    await db.query(worldStatusTable);
    console.log('✅ world_status table created');
    
    // Insert default world status
    await db.query(`
      INSERT INTO world_status (id, active_players, average_hunter_rank, next_wave_at)
      VALUES (1, 0, 'D', DATE_ADD(NOW(), INTERVAL 6 HOUR))
      ON DUPLICATE KEY UPDATE id = id
    `);
    console.log('✅ Default world status inserted');
    
    // Insert some default gate images
    const defaultImages = [
      {
        name: 'Wald-Portal',
        description: 'Ein mystisches grünes Portal im Wald',
        type: 'standard',
        rarity: 'common',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImdhdGUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMwMGZmODgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwMDY2MzMiLz48L3JhZGlhbEdyYWRpZW50PjwvZGVmcz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTI1IiByeD0iODAiIHJ5PSIxMTAiIGZpbGw9InVybCgjZ2F0ZSkiIG9wYWNpdHk9IjAuOCIvPjwvc3ZnPg=='
      },
      {
        name: 'Feuer-Rift',
        description: 'Ein loderndes rotes Portal',
        type: 'instabil',
        rarity: 'uncommon',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImZpcmUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZjU1MDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM4ODAwMDAiLz48L3JhZGlhbEdyYWRpZW50PjwvZGVmcz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTI1IiByeD0iODAiIHJ5PSIxMTAiIGZpbGw9InVybCgjZmlyZSkiIG9wYWNpdHk9IjAuOSIvPjwvc3ZnPg=='
      },
      {
        name: 'Dunkel-Spalte',
        description: 'Ein bedrohliches schwarzes Portal',
        type: 'elite',
        rarity: 'rare',
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cmFkaWFsR3JhZGllbnQgaWQ9ImRhcmsiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM4ODAwZmYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwMDAwMDAiLz48L3JhZGlhbEdyYWRpZW50PjwvZGVmcz48ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTI1IiByeD0iODAiIHJ5PSIxMTAiIGZpbGw9InVybCgjZGFyaykiIG9wYWNpdHk9IjAuOCIvPjwvc3ZnPg=='
      }
    ];
    
    for (const img of defaultImages) {
      await db.query(`
        INSERT INTO gate_images (name, description, image_url, gate_type, rarity)
        VALUES (?, ?, ?, ?, ?)
      `, [img.name, img.description, img.image, img.type, img.rarity]);
    }
    console.log('✅ Default gate images inserted');
    
    console.log('✅ Gates System Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
