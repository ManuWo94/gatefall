const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const db = require('./db');

// Discord OAuth Strategy - nur laden wenn konfiguriert
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  passport.use(new DiscordStrategy({
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CALLBACK_URL || 'http://localhost:3000/api/auth/discord/callback',
      scope: ['identify', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Suche Nutzer mit dieser Discord ID
        db.get('SELECT * FROM users WHERE discord_id = ?', [profile.id], (err, user) => {
          if (err) {
            return done(err);
          }

          if (user) {
            // Aktualisiere Discord-Daten
            db.run(
              `UPDATE users SET discord_username = ?, discord_avatar = ? WHERE id = ?`,
              [profile.username, profile.avatar, user.id],
              (err) => {
                if (err) return done(err);
                return done(null, user);
              }
            );
          } else {
            // Erstelle neuen Nutzer
            const displayName = profile.global_name || profile.username || `Discord-User-${profile.id}`;
            const email = profile.email || null;

            db.run(
              `INSERT INTO users (discord_id, discord_username, discord_avatar, display_name, email, email_verified_at)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                profile.id,
                profile.username,
                profile.avatar,
                displayName,
                email,
                profile.verified ? new Date().toISOString() : null
              ],
              function(err) {
                if (err) return done(err);

                const userId = this.lastID;

                // Erstelle Progression
                db.run(
                  'INSERT INTO progression (user_id, level, xp, gold) VALUES (?, 1, 0, 0)',
                  [userId],
                  (err) => {
                    if (err) return done(err);

                    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, newUser) => {
                      if (err) return done(err);
                      console.log('✓ Neuer Discord-Nutzer:', newUser.display_name);
                      return done(null, newUser);
                    });
                  }
                );
              }
            );
          }
        });
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

passport.deserializeUser((id, done) => {
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
    done(err, user);
  });
});

module.exports = passport;
