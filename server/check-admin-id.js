const db = require('./db-mysql');

async function checkAdminId() {
  try {
    const users = await db.query(`
      SELECT id, email, display_name, home_city_id, is_admin 
      FROM users 
      LIMIT 10
    `);
    
    console.log('🔍 All users in database:');
    console.log(users);
    
    if (users.length > 0) {
      console.log('\n✅ Found', users.length, 'users');
    } else {
      console.log('\n❌ No users found!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAdminId();
