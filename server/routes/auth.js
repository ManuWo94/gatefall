const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db-mysql');
const passport = require('passport');
const { generateVerificationToken, hashToken, sendVerificationEmail, isDev } = require('../email');

const router = express.Router();
const SALT_ROUNDS = 10;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  let { email, password, displayName, role, homeCity } = req.body;

  // Validierung
  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'E-Mail, Passwort und Name sind erforderlich' });
  }

  if (!homeCity) {
    return res.status(400).json({ error: 'Bitte wähle eine Heimatstadt' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Ungültige E-Mail-Adresse' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Passwort muss mindestens 8 Zeichen lang sein' });
  }

  if (displayName.length < 3) {
    return res.status(400).json({ error: 'Anzeigename muss mindestens 3 Zeichen lang sein' });
  }

  // Rolle validieren oder Default setzen
  const validRoles = ['waechter', 'assassine', 'magier', 'heiler', 'beschwoerer', 'berserker', 'fluchwirker'];
  if (!role || !validRoles.includes(role)) {
    console.log('⚠️ Keine gültige Rolle angegeben, setze Default: waechter');
    role = 'waechter'; // Default-Rolle
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Prüfen ob Email bereits existiert (MySQL)
    const existingUser = await db.getUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(400).json({ error: 'E-Mail bereits registriert' });
    }

    // Passwort hashen
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // User erstellen (auto-creates player_stats) - Email-Verifizierung übersprungen für Development
    const result = await db.query(
      `INSERT INTO users (email, password_hash, display_name, email_verified) 
       VALUES (?, ?, ?, ?)`,
      [normalizedEmail, passwordHash, displayName, true]
    );
    const userId = result.insertId;

    // Rolle setzen
    await db.updatePlayerStats(userId, { role });

    // Heimatstadt und aktuelle Stadt setzen
    await db.query(
      `UPDATE users SET home_city_id = ?, current_city_id = ? WHERE id = ?`,
      [homeCity, homeCity, userId]
    );

    console.log('✅ User registriert:', displayName, '(ID:', userId, ') - Rolle:', role, '- Stadt:', homeCity);
    
    // Session erstellen (User einloggen)
    req.session.userId = userId;
    req.session.email = normalizedEmail;
    req.session.displayName = displayName;

    // Session explizit speichern
    req.session.save((saveErr) => {
      if (saveErr) {
        console.error('❌ Session save error bei Registrierung:', saveErr);
        return res.status(500).json({ error: 'Session konnte nicht gespeichert werden' });
      }

      console.log('✅ Session gespeichert nach Registrierung:', req.sessionID);

      // Verifizierungs-Email senden
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
      const verifyLink = `${baseUrl}/verify-email?token=${verifyToken}`;
      
      sendVerificationEmail(normalizedEmail, displayName, verifyLink)
        .then((emailResult) => {
          res.json({
            success: true,
            user: {
              email: normalizedEmail,
              displayName
            },
            message: emailResult.dev 
              ? 'Registrierung erfolgreich. Bestätigungslink wurde (dev) in der Konsole ausgegeben.'
              : 'Registrierung erfolgreich. Bitte bestätige deine E-Mail.'
          });
        })
        .catch((emailError) => {
          console.error('Email send error:', emailError);
          // Registrierung war erfolgreich, nur Email-Versand fehlgeschlagen
          res.json({
            success: true,
            user: {
              email: normalizedEmail,
              displayName
            },
            warning: 'Registrierung erfolgreich, aber Email konnte nicht gesendet werden. Verwende "Link erneut senden".'
          });
        });
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Serverfehler bei der Registrierung' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('🔐 Login-Versuch:', email);

  if (!email || !password) {
    return res.status(400).json({ error: 'E-Mail und Passwort erforderlich' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // User suchen (MySQL)
    const user = await db.getUserByEmail(normalizedEmail);

    if (!user) {
      console.log('❌ User nicht gefunden:', normalizedEmail);
      return res.status(401).json({ error: 'Ungültige E-Mail oder Passwort' });
    }

    // Passwort prüfen
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      console.log('❌ Falsches Passwort für:', normalizedEmail);
      return res.status(401).json({ error: 'Ungültige E-Mail oder Passwort' });
    }

    console.log('✅ Login erfolgreich:', user.display_name);
    
    // Online-Status setzen
    await db.setUserOnline(user.id, true);
    console.log('🔧 Session vor save:', req.sessionID);

    // Session erstellen
    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.displayName = user.display_name;

    // Session explizit speichern
    req.session.save((saveErr) => {
      if (saveErr) {
        console.error('❌ Session save error:', saveErr);
        return res.status(500).json({ error: 'Session konnte nicht gespeichert werden' });
      }

      console.log('✅ Session gespeichert:', req.sessionID);
      console.log('🍪 Set-Cookie header wird gesendet');

      res.json({
        success: true,
        user: {
          email: user.email,
          displayName: user.display_name
        }
      });
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Serverfehler beim Login' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Serverfehler beim Logout' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// GET /api/auth/verify-email?token=...
router.get('/verify-email', (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Bestätigungstoken fehlt' });
  }

  const tokenHash = hashToken(token);
  const now = new Date().toISOString();

  db.get(
    `SELECT id, email, display_name FROM users 
     WHERE verify_token_hash = ? AND verify_token_expires_at > ?`,
    [tokenHash, now],
    (err, user) => {
      if (err) {
        console.error('Verification error:', err);
        return res.status(500).json({ error: 'Serverfehler bei der Bestätigung' });
      }

      if (!user) {
        return res.status(400).json({ error: 'Ungültiger oder abgelaufener Bestätigungslink' });
      }

      // Email als bestätigt markieren
      db.run(
        `UPDATE users 
         SET email_verified_at = ?, verify_token_hash = NULL, verify_token_expires_at = NULL 
         WHERE id = ?`,
        [now, user.id],
        (err) => {
          if (err) {
            console.error('Update verification error:', err);
            return res.status(500).json({ error: 'Serverfehler bei der Bestätigung' });
          }

          console.log('✓ E-Mail bestätigt:', user.email);
          res.json({
            success: true,
            message: 'E-Mail erfolgreich bestätigt! Du kannst jetzt spielen.'
          });
        }
      );
    }
  );
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
  // Prüfe ob User eingeloggt ist
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Nicht authentifiziert' });
  }

  // Rate limiting (einfach: 60 Sekunden Cooldown)
  const lastResendKey = `lastResend_${req.session.userId}`;
  const lastResend = req.session[lastResendKey];
  if (lastResend && Date.now() - lastResend < 60000) {
    const waitSeconds = Math.ceil((60000 - (Date.now() - lastResend)) / 1000);
    return res.status(429).json({ 
      error: `Bitte warte ${waitSeconds} Sekunden bevor du den Link erneut anforderst.` 
    });
  }

  try {
    db.get(
      'SELECT email, display_name, email_verified_at FROM users WHERE id = ?',
      [req.session.userId],
      async (err, user) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Serverfehler' });
        }

        if (!user) {
          return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }

        // Prüfe ob bereits bestätigt
        if (user.email_verified_at) {
          return res.json({ 
            success: true, 
            message: 'E-Mail ist bereits bestätigt.' 
          });
        }

        // Neuen Token generieren
        const verifyToken = generateVerificationToken();
        const verifyTokenHash = hashToken(verifyToken);
        const verifyTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        // Token in DB aktualisieren
        db.run(
          'UPDATE users SET verify_token_hash = ?, verify_token_expires_at = ? WHERE id = ?',
          [verifyTokenHash, verifyTokenExpiresAt, req.session.userId],
          async (err) => {
            if (err) {
              console.error('Update token error:', err);
              return res.status(500).json({ error: 'Serverfehler' });
            }

            // Email senden
            const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
            const verifyLink = `${baseUrl}/verify-email?token=${verifyToken}`;

            try {
              const emailResult = await sendVerificationEmail(user.email, user.display_name, verifyLink);
              
              // Cooldown setzen
              req.session[lastResendKey] = Date.now();

              res.json({
                success: true,
                message: emailResult.dev
                  ? 'Bestätigungslink wurde (dev) in der Konsole ausgegeben.'
                  : 'Bestätigungslink wurde erneut gesendet. Bitte prüfe deine E-Mails.'
              });
            } catch (emailError) {
              console.error('Email send error:', emailError);
              res.status(500).json({ error: 'Email konnte nicht gesendet werden' });
            }
          }
        );
      }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Serverfehler' });
  }
});

// Discord OAuth Routes - nur wenn konfiguriert
if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  router.get('/discord', passport.authenticate('discord'));

  router.get('/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/?error=discord_auth_failed' }),
    (req, res) => {
      // Erfolgreicher Login
      req.session.userId = req.user.id;
      res.redirect('/?discord_login=success');
    }
  );
} else {
  // Fallback wenn Discord nicht konfiguriert
  router.get('/discord', (req, res) => {
    res.redirect('/?error=discord_not_configured');
  });
  
  router.get('/discord/callback', (req, res) => {
    res.redirect('/?error=discord_not_configured');
  });
}

module.exports = router;
