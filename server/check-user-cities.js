const db = require('./db-mysql');

async function checkUserCities() {
    try {
        console.log('📊 Admin User Status:');
        const users = await db.query(`
            SELECT u.id, u.email, u.home_city_id, u.current_city_id, 
                   h.display_name as home_city, c.display_name as current_city
            FROM users u
            LEFT JOIN cities h ON u.home_city_id = h.id
            LEFT JOIN cities c ON u.current_city_id = c.id
            WHERE u.is_admin = TRUE
        `);
        console.log(users);
        
        console.log('\n📋 Alle Städte:');
        const cities = await db.query('SELECT id, name, display_name FROM cities ORDER BY id');
        console.log(cities);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Fehler:', error);
        process.exit(1);
    }
}

checkUserCities();
