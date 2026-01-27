const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email-Konfiguration aus Umgebungsvariablen
const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : null
};

const fromEmail = process.env.SMTP_FROM || 'noreply@gatefall.local';
const isDev = !smtpConfig.auth;

// Transporter erstellen (oder null im Dev-Modus)
let transporter = null;
if (!isDev) {
  try {
    transporter = nodemailer.createTransport(smtpConfig);
    console.log('✓ SMTP-Transporter konfiguriert');
  } catch (error) {
    console.warn('⚠ SMTP-Konfiguration fehlerhaft, verwende Dev-Modus');
  }
}

/**
 * Generiert einen sicheren zufälligen Token
 */
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hasht einen Token (SHA256)
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Sendet eine Verifizierungs-Email
 */
async function sendVerificationEmail(email, displayName, verifyLink) {
  const mailOptions = {
    from: fromEmail,
    to: email,
    subject: 'Gatefall - E-Mail bestätigen',
    html: `
      <h2>Willkommen bei Gatefall, ${displayName}!</h2>
      <p>Bitte bestätige deine E-Mail-Adresse, um dein Konto zu aktivieren:</p>
      <p><a href="${verifyLink}" style="display: inline-block; padding: 10px 20px; background: #4a90e2; color: white; text-decoration: none; border-radius: 5px;">E-Mail bestätigen</a></p>
      <p>Oder kopiere diesen Link in deinen Browser:</p>
      <p>${verifyLink}</p>
      <p>Dieser Link ist 24 Stunden gültig.</p>
      <hr>
      <p><small>Falls du dich nicht bei Gatefall registriert hast, ignoriere diese E-Mail.</small></p>
    `,
    text: `
Willkommen bei Gatefall, ${displayName}!

Bitte bestätige deine E-Mail-Adresse, um dein Konto zu aktivieren:
${verifyLink}

Dieser Link ist 24 Stunden gültig.

Falls du dich nicht bei Gatefall registriert hast, ignoriere diese E-Mail.
    `
  };

  if (isDev || !transporter) {
    // Dev-Modus: Logge den Link in die Konsole
    console.log('\n' + '='.repeat(80));
    console.log('📧 [DEV] Verifizierungs-Email würde gesendet an:', email);
    console.log('🔗 Bestätigungslink:');
    console.log('   ', verifyLink);
    console.log('='.repeat(80) + '\n');
    return { dev: true };
  }

  // Produktions-Modus: Sende die Email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Verifizierungs-Email gesendet an:', email);
    return info;
  } catch (error) {
    console.error('✗ Fehler beim Senden der Email:', error);
    throw new Error('Email konnte nicht gesendet werden');
  }
}

module.exports = {
  generateVerificationToken,
  hashToken,
  sendVerificationEmail,
  isDev
};
