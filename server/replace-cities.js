// Replace existing cities with new ones
const db = require('./db-mysql');

const newCities = [
    {
        name: 'new_port',
        display_name: 'New Port',
        description: 'Eine geschäftige Hafenstadt am Meer',
        map_x: 200,
        map_y: 250,
        map_radius: 50,
        travel_time_minutes: 5
    },
    {
        name: 'kyato',
        display_name: 'Kyato',
        description: 'Eine mystische Stadt im Osten',
        map_x: 750,
        map_y: 200,
        map_radius: 50,
        travel_time_minutes: 15
    },
    {
        name: 'bruchthal',
        display_name: 'Bruchthal',
        description: 'Ein befestigtes Tal im Norden',
        map_x: 500,
        map_y: 150,
        map_radius: 50,
        travel_time_minutes: 10
    },
    {
        name: 'arden',
        display_name: 'Arden',
        description: 'Eine Stadt mitten im Waldgebiet',
        map_x: 350,
        map_y: 400,
        map_radius: 50,
        travel_time_minutes: 8
    },
    {
        name: 'eastvale',
        display_name: 'Eastvale',
        description: 'Eine friedliche Stadt im östlichen Tal',
        map_x: 650,
        map_y: 450,
        map_radius: 50,
        travel_time_minutes: 12
    },
    {
        name: 'longford',
        display_name: 'Longford',
        description: 'Eine alte Stadt an der langen Furt',
        map_x: 300,
        map_y: 300,
        map_radius: 50,
        travel_time_minutes: 7
    }
];

async function replaceCities() {
    try {
        console.log('🗑️ Lösche alte Städte...');
        
        // Delete old cities
        await db.query('DELETE FROM cities');
        console.log('✅ Alte Städte gelöscht');
        
        console.log('\n🏙️ Erstelle neue Städte...');
        
        // Insert new cities
        for (const city of newCities) {
            const result = await db.query(
                `INSERT INTO cities (name, display_name, description, map_x, map_y, map_radius, travel_time_minutes) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [city.name, city.display_name, city.description, city.map_x, city.map_y, city.map_radius, city.travel_time_minutes]
            );
            console.log(`✅ ${city.display_name} erstellt (ID: ${result.insertId})`);
        }
        
        console.log('\n📊 Aktuelle Städte:');
        const cities = await db.query('SELECT id, display_name, map_x, map_y FROM cities ORDER BY id');
        cities.forEach(city => {
            console.log(`   ${city.id}: ${city.display_name} (${city.map_x}, ${city.map_y})`);
        });
        
        console.log('\n✅ Städte erfolgreich ersetzt!');
        
        // Get the first city ID (New Port)
        const firstCity = await db.query('SELECT id FROM cities ORDER BY id LIMIT 1');
        const newPortId = firstCity[0].id;
        
        // Set admin home to first city (New Port)
        console.log(`\n🏠 Setze Admin-Heimatstadt auf New Port (ID: ${newPortId})...`);
        await db.query('UPDATE users SET home_city_id = ?, current_city_id = ? WHERE is_admin = TRUE', [newPortId, newPortId]);
        console.log('✅ Admin-Heimatstadt aktualisiert');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Fehler beim Ersetzen der Städte:', error);
        process.exit(1);
    }
}

replaceCities();
