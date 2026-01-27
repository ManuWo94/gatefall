/**
 * MySQL Migration: Attack Actions Table
 * Erstellt Tabelle für konfigurierbare Angriffsaklionen
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAttackActionsTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'gatefall_db'
    });

    try {
        console.log('📦 Creating attack_actions table...');
        
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS attack_actions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                action_id VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                icon VARCHAR(500),
                damage_multiplier DECIMAL(4,2) DEFAULT 1.00,
                stamina_cost INT DEFAULT 0,
                cooldown INT DEFAULT 0,
                can_block BOOLEAN DEFAULT FALSE,
                can_dodge BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        console.log('✅ attack_actions table created');

        // Insert default actions
        console.log('📦 Inserting default attack actions...');
        
        const defaultActions = [
            ['attack', 'Normaler Angriff', 'Greife den Feind mit deiner Waffe an', null, 1.00, 0, 0, 0, 0],
            ['strong-attack', 'Starker Angriff', 'Mächtiger Schlag (150% Schaden)', null, 1.50, 20, 3, 0, 0],
            ['block', 'Verteidigen', 'Reduziere eingehenden Schaden um 50%', null, 0, 0, 0, 1, 0],
            ['dodge', 'Ausweichen', 'Chance gegnerischen Angriff zu vermeiden', null, 0, 10, 2, 0, 1]
        ];

        for (const action of defaultActions) {
            await connection.execute(
                `INSERT IGNORE INTO attack_actions 
                (action_id, name, description, icon, damage_multiplier, stamina_cost, cooldown, can_block, can_dodge) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                action
            );
        }

        console.log('✅ Default attack actions inserted');

        console.log('\n✅ Migration complete!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

createAttackActionsTable().catch(console.error);
