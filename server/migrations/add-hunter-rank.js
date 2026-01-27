/**
 * ADD HUNTER_RANK TO USERS TABLE
 * Migration to add hunter_rank column to users table
 */

const mysql = require('mysql2/promise');

async function addHunterRankColumn() {
    console.log('📦 Adding hunter_rank column to users table...\n');
    
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'gatefall_db'
    });

    try {
        console.log('✅ MySQL Verbindung erfolgreich!');
        
        // Check if column exists
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'gatefall_db' 
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME = 'hunter_rank'
        `);
        
        if (columns.length > 0) {
            console.log('⚠️  hunter_rank column already exists!');
        } else {
            // Add hunter_rank column
            await connection.query(`
                ALTER TABLE users 
                ADD COLUMN hunter_rank VARCHAR(2) DEFAULT 'D'
            `);
            console.log('✅ hunter_rank column added to users table');
        }
        
        // Check if last_login exists
        const [loginColumns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'gatefall_db' 
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME = 'last_login'
        `);
        
        if (loginColumns.length === 0) {
            // Add last_login column
            await connection.query(`
                ALTER TABLE users 
                ADD COLUMN last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            `);
            console.log('✅ last_login column added to users table');
        }
        
        console.log('\n✅ Migration complete!');
        
    } catch (error) {
        console.error('❌ Migration Error:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

addHunterRankColumn();
