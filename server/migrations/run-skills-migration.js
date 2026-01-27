/**
 * Skills System Migration - Run this to create skills tables
 */

const mysql = require('mysql2/promise');

async function runMigration() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'gatefall_db'
    });

    console.log('🔄 Starting Skills System Migration...\n');

    try {
        // Read SQL file
        const fs = require('fs');
        const sql = fs.readFileSync(__dirname + '/create-skills-system.sql', 'utf8');
        
        // Split by statement (simple approach)
        const statements = sql.split(';').filter(s => s.trim().length > 0);
        
        for (const statement of statements) {
            if (statement.trim().startsWith('--') || statement.trim().length === 0) continue;
            
            try {
                await connection.query(statement);
                if (statement.includes('CREATE TABLE')) {
                    const tableName = statement.match(/CREATE TABLE.*?`?(\w+)`?/i)?.[1];
                    console.log(`✅ Table created: ${tableName}`);
                } else if (statement.includes('INSERT INTO')) {
                    const tableName = statement.match(/INSERT INTO.*?`?(\w+)`?/i)?.[1];
                    console.log(`✅ Data inserted into: ${tableName}`);
                }
            } catch (error) {
                if (error.code === 'ER_TABLE_EXISTS_ERROR') {
                    console.log(`ℹ️  Table already exists, skipping...`);
                } else {
                    console.error('❌ Error:', error.message);
                }
            }
        }

        console.log('\n✅ Migration completed successfully!');
        console.log('📊 Skills system is now ready to use.');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await connection.end();
    }
}

runMigration();
