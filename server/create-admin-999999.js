const db = require('./db-mysql');
const bcrypt = require('bcrypt');

async function createAdmin() {
  try {
    // Check if user exists
    const existing = await db.query('SELECT id FROM users WHERE id = 999999');
    
    if (existing.length > 0) {
      console.log('✅ User 999999 already exists');
      process.exit(0);
    }
    
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    await db.query(`
      INSERT INTO users (id, email, password_hash, display_name, is_admin, home_city_id)
      VALUES (999999, 'admin@admin.de', ?, 'Admin', TRUE, 19)
    `, [passwordHash]);
    
    console.log('✅ Created admin user with ID 999999');
    console.log('   Email: admin@admin.de');
    console.log('   Password: admin123');
    console.log('   Home City: 19 (New Port)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
