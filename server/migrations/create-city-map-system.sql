-- City POIs Table
CREATE TABLE IF NOT EXISTS city_pois (
    id INT PRIMARY KEY AUTO_INCREMENT,
    city_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- shop, arena, guild, inn, bank, crafting, quest, dungeon, portal
    map_x INT NOT NULL,
    map_y INT NOT NULL,
    icon VARCHAR(10), -- Emoji icon
    description TEXT,
    action VARCHAR(50), -- Panel action (e.g., 'shop', 'combat')
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_city (city_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- City Spawn Zones Table
CREATE TABLE IF NOT EXISTS city_spawn_zones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    city_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    zone_type VARCHAR(50) DEFAULT 'spawn', -- spawn, safe, pvp, etc.
    min_level INT NOT NULL DEFAULT 1,
    max_level INT NOT NULL DEFAULT 10,
    gate_type VARCHAR(50) NOT NULL, -- normal, elite, boss, raid
    spawn_chance INT NOT NULL DEFAULT 50, -- 1-100%
    polygon_points JSON NOT NULL, -- Array of {x, y} coordinates
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_city (city_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add map_image_url to cities table if not exists
ALTER TABLE cities ADD COLUMN IF NOT EXISTS map_image_url VARCHAR(255) DEFAULT NULL;
