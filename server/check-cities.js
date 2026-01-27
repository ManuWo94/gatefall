// Check cities table structure
const db = require('./db-mysql');

async function checkCities() {
    try {
        console.log('📊 Aktuelle Städte-Tabelle:');
        const cities = await db.query('SELECT * FROM cities');
        console.log(cities);
        
        console.log('\n📋 Tabellenstruktur:');
        const structure = await db.query('DESCRIBE cities');
        console.log(structure);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Fehler:', error);
        process.exit(1);
    }
}

checkCities();
