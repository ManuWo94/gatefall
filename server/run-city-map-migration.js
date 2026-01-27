const pool = require('./db-mysql');
const fs = require('fs').promises;
const path = require('path');

async function runMigration() {
    try {
        console.log('🔄 Running City Map System Migration...');

        const sqlFile = path.join(__dirname, 'migrations', 'create-city-map-system.sql');
        const sql = await fs.readFile(sqlFile, 'utf8');

        // Split by semicolon and execute each statement
        const statements = sql.split(';').filter(s => s.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                await pool.query(statement);
                console.log('✅ Executed:', statement.substring(0, 50) + '...');
            }
        }

        console.log('✅ City Map System Migration completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
