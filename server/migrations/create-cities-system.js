/**
 * CITIES SYSTEM - Database Migration
 * Erstellt Tabellen für Städte, Stadt-Zonen und Reise-System
 */

const db = require('../db-mysql');

async function createCitiesSystem() {
    console.log('🏙️ Creating Cities System tables...');
    
    try {
        // 1. Cities Table
        console.log('Creating cities table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS cities (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(100) NOT NULL UNIQUE,
                display_name VARCHAR(100) NOT NULL,
                map_x INT NOT NULL,
                map_y INT NOT NULL,
                map_radius INT DEFAULT 50,
                travel_time_minutes INT DEFAULT 10,
                description TEXT,
                image_url VARCHAR(500),
                city_map_url VARCHAR(500),
                active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ cities table created');
        
        // 2. City Zones Table (für Gate-Spawning)
        console.log('Creating city_zones table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS city_zones (
                id INT PRIMARY KEY AUTO_INCREMENT,
                city_id INT NOT NULL,
                name VARCHAR(100) NOT NULL,
                zone_type ENUM('safe', 'standard', 'elite', 'danger') DEFAULT 'standard',
                map_x INT NOT NULL,
                map_y INT NOT NULL,
                radius INT DEFAULT 100,
                min_rank ENUM('D', 'C', 'B', 'A', 'S', 'SS') DEFAULT 'D',
                max_rank ENUM('D', 'C', 'B', 'A', 'S', 'SS') DEFAULT 'C',
                spawn_weight DECIMAL(3,2) DEFAULT 1.0,
                color VARCHAR(20) DEFAULT '#4CAF50',
                active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ city_zones table created');
        
        // 3. Gates Table (neu mit city_id)
        console.log('Creating gates table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS gates (
                id INT PRIMARY KEY AUTO_INCREMENT,
                city_id INT NOT NULL,
                zone_id INT,
                player_id INT NOT NULL,
                name VARCHAR(200) NOT NULL,
                gate_rank ENUM('D', 'C', 'B', 'A', 'S', 'SS') NOT NULL,
                gate_type ENUM('standard', 'instabil', 'elite', 'katastrophe', 'geheim') DEFAULT 'standard',
                level INT NOT NULL,
                map_x INT NOT NULL,
                map_y INT NOT NULL,
                status ENUM('active', 'in_progress', 'completed', 'expired') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NULL DEFAULT NULL,
                completed_at TIMESTAMP NULL DEFAULT NULL,
                FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
                FOREIGN KEY (zone_id) REFERENCES city_zones(id) ON DELETE SET NULL,
                INDEX idx_player_city (player_id, city_id),
                INDEX idx_status (status),
                INDEX idx_expires (expires_at)
            )
        `);
        console.log('✅ gates table created');
        
        // 4. Update users table for city system
        console.log('Updating users table...');
        
        // Check if columns exist first
        const columns = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'users'
            AND COLUMN_NAME IN ('home_city_id', 'current_city_id', 'traveling_to_city_id', 'travel_started_at')
        `);
        
        const existingColumns = columns.map(c => c.COLUMN_NAME);
        
        if (!existingColumns.includes('home_city_id')) {
            await db.query(`ALTER TABLE users ADD COLUMN home_city_id INT DEFAULT NULL`);
            console.log('✅ Added home_city_id to users');
        }
        
        if (!existingColumns.includes('current_city_id')) {
            await db.query(`ALTER TABLE users ADD COLUMN current_city_id INT DEFAULT NULL`);
            console.log('✅ Added current_city_id to users');
        }
        
        if (!existingColumns.includes('traveling_to_city_id')) {
            await db.query(`ALTER TABLE users ADD COLUMN traveling_to_city_id INT DEFAULT NULL`);
            console.log('✅ Added traveling_to_city_id to users');
        }
        
        if (!existingColumns.includes('travel_started_at')) {
            await db.query(`ALTER TABLE users ADD COLUMN travel_started_at TIMESTAMP NULL DEFAULT NULL`);
            console.log('✅ Added travel_started_at to users');
        }
        
        // Add foreign keys
        await db.query(`
            ALTER TABLE users 
            ADD CONSTRAINT fk_home_city 
            FOREIGN KEY (home_city_id) REFERENCES cities(id) ON DELETE SET NULL
        `).catch(() => console.log('Foreign key fk_home_city already exists or skipped'));
        
        await db.query(`
            ALTER TABLE users 
            ADD CONSTRAINT fk_current_city 
            FOREIGN KEY (current_city_id) REFERENCES cities(id) ON DELETE SET NULL
        `).catch(() => console.log('Foreign key fk_current_city already exists or skipped'));
        
        console.log('✅ users table updated');
        
        // 5. Insert default cities
        console.log('Inserting default cities...');
        
        const cities = [
            { name: 'berlin', display_name: 'Berlin', x: 520, y: 280, desc: 'Hauptstadt Deutschlands - Tor zu Europa' },
            { name: 'london', display_name: 'London', x: 480, y: 310, desc: 'Vereinigtes Königreich - Historisches Zentrum' },
            { name: 'new_york', display_name: 'New York', x: 280, y: 330, desc: 'USA - Die Stadt die niemals schläft' },
            { name: 'moscow', display_name: 'Moskau', x: 600, y: 250, desc: 'Russland - Tor zum Osten' },
            { name: 'cairo', display_name: 'Kairo', x: 560, y: 400, desc: 'Ägypten - Wächter des Nahen Ostens' },
            { name: 'seoul', display_name: 'Seoul', x: 800, y: 320, desc: 'Südkorea - Technologie-Metropole' },
            { name: 'tokyo', display_name: 'Tokyo', x: 850, y: 340, desc: 'Japan - Zentrum des Fernen Ostens' },
            { name: 'sao_paulo', display_name: 'São Paulo', x: 340, y: 480, desc: 'Brasilien - Herz Südamerikas' },
            { name: 'sydney', display_name: 'Sydney', x: 900, y: 520, desc: 'Australien - Tor zu Ozeanien' }
        ];
        
        for (const city of cities) {
            await db.query(`
                INSERT INTO cities (name, display_name, map_x, map_y, map_radius, travel_time_minutes, description)
                VALUES (?, ?, ?, ?, 40, 10, ?)
                ON DUPLICATE KEY UPDATE 
                    display_name = VALUES(display_name),
                    map_x = VALUES(map_x),
                    map_y = VALUES(map_y),
                    description = VALUES(description)
            `, [city.name, city.display_name, city.x, city.y, city.desc]);
        }
        
        console.log('✅ Default cities inserted');
        
        // 6. Create default zones for each city
        console.log('Creating default zones for cities...');
        
        const citiesData = await db.query('SELECT id, name FROM cities');
        
        for (const city of citiesData) {
            // Safe Zone (Anfängerbereich)
            await db.query(`
                INSERT INTO city_zones (city_id, name, zone_type, map_x, map_y, radius, min_rank, max_rank, spawn_weight, color)
                VALUES (?, ?, 'safe', 150, 150, 80, 'D', 'C', 1.5, '#4CAF50')
                ON DUPLICATE KEY UPDATE zone_type = VALUES(zone_type)
            `, [city.id, `${city.name}_safe_zone`]);
            
            // Standard Zone (Stadtmitte)
            await db.query(`
                INSERT INTO city_zones (city_id, name, zone_type, map_x, map_y, radius, min_rank, max_rank, spawn_weight, color)
                VALUES (?, ?, 'standard', 400, 300, 120, 'C', 'B', 1.0, '#2196F3')
                ON DUPLICATE KEY UPDATE zone_type = VALUES(zone_type)
            `, [city.id, `${city.name}_downtown`]);
            
            // Elite Zone (Gefährliches Viertel)
            await db.query(`
                INSERT INTO city_zones (city_id, name, zone_type, map_x, map_y, radius, min_rank, max_rank, spawn_weight, color)
                VALUES (?, ?, 'elite', 600, 200, 100, 'B', 'A', 0.8, '#9C27B0')
                ON DUPLICATE KEY UPDATE zone_type = VALUES(zone_type)
            `, [city.id, `${city.name}_elite_district`]);
            
            // Danger Zone (Hochrisikogebiet)
            await db.query(`
                INSERT INTO city_zones (city_id, name, zone_type, map_x, map_y, radius, min_rank, max_rank, spawn_weight, color)
                VALUES (?, ?, 'danger', 750, 450, 90, 'A', 'SS', 0.5, '#F44336')
                ON DUPLICATE KEY UPDATE zone_type = VALUES(zone_type)
            `, [city.id, `${city.name}_danger_zone`]);
        }
        
        console.log('✅ Default zones created');
        
        console.log('');
        console.log('✅ Cities System successfully created!');
        console.log('📍 6 cities with zones ready');
        console.log('🗺️ Travel system enabled');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating cities system:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    createCitiesSystem();
}

module.exports = { createCitiesSystem };
