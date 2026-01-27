const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const db = require('./db-mysql');

// Discord OAuth Strategy - nur laden wenn konfiguriert
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  passport.use(new DiscordStrategy({
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CALLBACK_URL || 'http://localhost:3001/api/auth/discord/callback',
      scope: ['identify', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Suche Nutzer mit dieser Discord ID
        let user = await db.queryOne('SELECT * FROM users WHERE discord_id = ?', [profile.id]);

        if (user) {
          // Aktualisiere Discord-Daten
          await db.query(
            `UPDATE users SET discord_username = ?, discord_avatar = ? WHERE id = ?`,
            [profile.username, profile.avatar, user.id]
          );
          return done(null, user);
        } else {
          // Erstelle neuen Nutzer
          const displayName = profile.global_name || profile.username || `Discord-User-${profile.id}`;
          const email = profile.email || null;

          const result = await db.query(
            `INSERT INTO users (discord_id, discord_username, discord_avatar, display_name, email, email_verified_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              profile.id,
              profile.username,
              profile.avatar,
              displayName,
              email,
              profile.verified ? new Date().toISOString() : null
            ]
          );

          const userId = result.insertId;

          // player_stats wird automatisch erstellt
          const newUser = await db.getUserById(userId);
          console.log('✓ Neuer Discord-Nutzer:', newUser.display_name);
          return done(null, newUser);
        }
      } catch (error) {
        return done(error);
      }
    }
  ));
  
  console.log('✓ Discord OAuth aktiviert');
} else {
  console.log('⚠ Discord OAuth nicht konfiguriert (DISCORD_CLIENT_ID/SECRET fehlen)');
}

// Session Serialisierung
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.getUserById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
