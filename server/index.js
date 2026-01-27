const express = require('express');
const session = require('express-session');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config(); // .env-Datei laden
const passport = require('passport');
require('./passport'); // Passport-Konfiguration laden

// MySQL Datenbank
const db = require('./db-mysql');
const gatesSpawnSystem = require('./gates-spawn-system');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const citiesRoutes = require('./routes/cities');
const homeChangeRoutes = require('./routes/home-change');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : 'http://localhost',
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// Chat Control
let globalChatEnabled = true;
let chatStats = {
  activeUsers: 0,
  messagesToday: 0,
  lastRestart: new Date()
};

// Trust Proxy - wichtig für Plesk/Nginx Reverse Proxy
app.set('trust proxy', 1);

// Logging für Debugging
console.log('🔧 Environment:', process.env.NODE_ENV);
console.log('🔧 SESSION_SECRET gesetzt:', !!process.env.SESSION_SECRET);
console.log('🔧 Trust Proxy: aktiviert');

// Middleware
app.use(express.json({ limit: '50mb' })); // Erhöhtes Limit für Bildupload
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Debug Logging für alle Requests
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.path}`);
  next();
});

// CORS nur für Development (Codespace)
if (process.env.NODE_ENV !== 'production') {
  const cors = require('cors');
  console.log('🔧 CORS aktiviert (Development)');
  app.use(cors({
    origin: true,
    credentials: true
  }));
} else {
  console.log('🔧 CORS deaktiviert (Production)');
}

// Session-Konfiguration - Memory Store für Development (stabiler)
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'gatefall-dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'gatefall.sid', // Custom cookie name
  cookie: {
    httpOnly: true,
    secure: false, // Immer false für localhost
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 Tage
    path: '/'
  }
};

console.log('🔧 Session Cookie Config:', {
  name: sessionConfig.name,
  httpOnly: sessionConfig.cookie.httpOnly,
  secure: sessionConfig.cookie.secure,
  sameSite: sessionConfig.cookie.sameSite,
  path: sessionConfig.cookie.path
});

// Session Middleware für Express und Socket.io
const sessionMiddleware = session(sessionConfig);
app.use(sessionMiddleware);

// Passport initialisieren
app.use(passport.initialize());
app.use(passport.session());

// API-Routen (vor statischen Dateien!)
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/progression', profileRoutes);
app.use('/api/awakening', profileRoutes);
app.use('/api/guild', profileRoutes);
app.use('/api/guilds', profileRoutes);
app.use('/api/cities', citiesRoutes);
app.use('/api/cities', homeChangeRoutes);
app.use('/api/cities', require('./routes/city-map-image'));
app.use('/api/combat', require('./routes/combat'));
try {
    const skillsRoutes = require('./routes/skills');
    app.use('/api/skills', skillsRoutes);
    console.log('✅ Skills routes loaded');
} catch (error) {
    console.error('❌ Error loading skills routes:', error.message);
}
try {
    const attackActionsRoutes = require('./routes/attack-actions');
    app.use('/api/combat/attack-actions', attackActionsRoutes);
    console.log('✅ Attack actions routes loaded');
} catch (error) {
    console.error('❌ Error loading attack actions routes:', error.message);
}
try {
    const combatBackgroundsRoutes = require('./routes/combat-backgrounds');
    app.use('/api/combat/backgrounds', combatBackgroundsRoutes);
    console.log('✅ Combat backgrounds routes loaded');
} catch (error) {
    console.error('❌ Error loading combat backgrounds routes:', error.message);
}
try {
    const charactersRoutes = require('./routes/characters');
    app.use('/api/characters', charactersRoutes);
    console.log('✅ Characters routes loaded');
} catch (error) {
    console.error('❌ Error loading characters routes:', error.message);
}
app.use('/api/gates', require('./routes/gates'));

// ==================== VICTORY BUILDER API ====================
// WICHTIG: Diese Routen müssen VOR app.use('/api/admin', ...) stehen!

// Save Victory Builder Settings
app.post('/api/admin/victory-builder/save', async (req, res) => {
  try {
    const { settingName, cssCode, settings } = req.body;
    
    if (!settingName) {
      return res.status(400).json({ error: 'Setting name required' });
    }
    
    await db.saveVictoryBuilderSettings(
      settingName,
      cssCode || '',
      JSON.stringify(settings || {})
    );
    
    res.json({ success: true, message: 'Victory Builder Einstellungen gespeichert!' });
  } catch (error) {
    console.error('Victory Builder Save Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Load Victory Builder Settings
app.get('/api/admin/victory-builder/load/:settingName', async (req, res) => {
  try {
    const { settingName } = req.params;
    const data = await db.getVictoryBuilderSettings(settingName);
    
    if (!data) {
      return res.json({ css: '', settings: {} });
    }
    
    res.json({
      css: data.css_code || '',
      settings: data.settings_json ? JSON.parse(data.settings_json) : {},
      updatedAt: data.updated_at
    });
  } catch (error) {
    console.error('Victory Builder Load Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List all Victory Builder Settings
app.get('/api/admin/victory-builder/list', async (req, res) => {
  try {
    const allSettings = await db.getAllVictoryBuilderSettings();
    res.json(allSettings);
  } catch (error) {
    console.error('Victory Builder List Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Victory Popup Background Upload
const multer = require('multer');
const victoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/assets/victory');
    if (!require('fs').existsSync(uploadDir)) {
      require('fs').mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'victory-bg-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const victoryUpload = multer({
  storage: victoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Nur Bilder erlaubt'));
    }
  }
});

app.post('/api/admin/victory-builder/upload-background', victoryUpload.single('background'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Keine Datei hochgeladen' });
    }
    
    const imageUrl = `/public/assets/victory/${req.file.filename}`;
    
    // Speichere URL in Datenbank
    await db.query(
      "INSERT INTO world_map_settings (setting_key, setting_value) VALUES ('victory_popup_bg', ?) ON DUPLICATE KEY UPDATE setting_value = ?",
      [imageUrl, imageUrl]
    );
    
    res.json({
      success: true,
      imageUrl: `http://localhost:3001${imageUrl}`,
      message: 'Hintergrundbild hochgeladen!'
    });
  } catch (error) {
    console.error('Victory Background Upload Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/victory-builder/background', async (req, res) => {
  try {
    const rows = await db.query(
      "SELECT setting_value FROM world_map_settings WHERE setting_key = 'victory_popup_bg'"
    );
    if (rows.length > 0) {
      res.json({ imageUrl: `http://localhost:3001${rows[0].setting_value}` });
    } else {
      res.json({ imageUrl: null });
    }
  } catch (error) {
    console.error('Victory Background Load Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin Routes
const adminWorldMapRoutes = require('./routes/admin-world-map');
const adminUIBackgroundRoutes = require('./routes/admin-ui-background');
const adminCitiesRoutes = require('./routes/admin-cities');
const adminCityImagesRoutes = require('./routes/admin-city-images');
const adminCityMapRoutes = require('./routes/admin-city-map');
app.use('/api/admin', adminWorldMapRoutes);
app.use('/api/admin', adminUIBackgroundRoutes);
app.use('/api/admin', adminCitiesRoutes);
app.use('/api/admin', adminCityImagesRoutes);
app.use('/api/admin', adminCityMapRoutes);

// Statische Dateien servieren (für Bilder)
const publicPath = path.join(__dirname, '../public');
const serverPublicPath = path.join(__dirname, 'public');
const distPath = path.join(__dirname, '../dist');
const rootPath = path.join(__dirname, '..');
console.log('📁 Static files path:', publicPath);
console.log('📁 Server public path:', serverPublicPath);
console.log('📁 Dist path:', distPath);
console.log('📁 Root path:', rootPath);
app.use('/public', express.static(publicPath));
app.use('/assets', express.static(path.join(serverPublicPath, 'assets')));
app.use('/dist', express.static(distPath));
// Serve HTML, CSS, JS files from root
app.use(express.static(rootPath));

// Socket.io Session-Sharing
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

// Socket.io Connection Handler
io.on('connection', async (socket) => {
  try {
    const session = socket.request.session;
    
    // TEMPORARY: Allow connections without auth for testing
    // TODO: Fix session sharing between XAMPP and Node.js
    let userId = null;
    let user = null;
    
    if (session && session.passport && session.passport.user) {
      userId = session.passport.user;
      user = await db.getUserById(userId);
    }
    
    if (!user) {
      // Use guest user for now
      console.log('⚠️ Guest socket connection (no session)');
      userId = 1; // Default to admin for testing
      user = await db.getUserById(userId);
    }
    
    if (!user) {
      socket.disconnect();
      return;
    }

    console.log(`✅ User connected: ${user.username} (ID: ${userId})`);
    
    // User mit Socket verbinden
    socket.userId = userId;
    socket.username = user.username;
    
    // User online setzen
    await db.setUserOnline(userId, true);
    
    // Join user-specific room
    socket.join(`user:${userId}`);
    
    // Wenn in Guild, join guild room
    if (user.guild_id) {
      socket.join(`guild:${user.guild_id}`);
    }

    // Sende aktuelle Online-Spieler
    const onlinePlayers = await db.getOnlinePlayers();
    socket.emit('online:players', onlinePlayers);
    
    // Broadcast an alle dass neuer Spieler online ist
    io.emit('player:online', {
      id: userId,
      username: user.username,
      guild_id: user.guild_id
    });

    // Party beitreten Event
    socket.on('party:join', async (partyId) => {
      try {
        await db.joinParty(userId, partyId);
        socket.join(`party:${partyId}`);
        
        const partyMembers = await db.getPartyMembers(partyId);
        io.to(`party:${partyId}`).emit('party:updated', { partyId, members: partyMembers });
        
        console.log(`User ${user.username} joined party ${partyId}`);
      } catch (err) {
        console.error('Error joining party:', err);
        socket.emit('error', { message: 'Konnte Party nicht beitreten' });
      }
    });

    // Party verlassen Event
    socket.on('party:leave', async (partyId) => {
      try {
        await db.leaveParty(userId, partyId);
        socket.leave(`party:${partyId}`);
        
        const partyMembers = await db.getPartyMembers(partyId);
        io.to(`party:${partyId}`).emit('party:updated', { partyId, members: partyMembers });
        
        console.log(`User ${user.username} left party ${partyId}`);
      } catch (err) {
        console.error('Error leaving party:', err);
      }
    });

    // Chat Message Event
    socket.on('chat:message', async (data) => {
      try {
        const { message, channel, channelId } = data;
        
        // Nur Guild und Party Chat erlauben
        if (channel !== 'guild' && channel !== 'party') {
          socket.emit('error', { message: 'Ungültiger Chat-Channel. Nur Guild und Party Chat verfügbar.' });
          return;
        }
        
        // Channel ID ist erforderlich
        if (!channelId) {
          socket.emit('error', { message: 'Keine Gilde oder Party ausgewählt.' });
          return;
        }
        
        // Save to database
        await db.saveChatMessage(userId, message, channel, channelId);
        
        // Update stats
        chatStats.messagesToday++;
        
        // Broadcast to appropriate room
        const chatData = {
          id: Date.now(),
          user_id: userId,
          username: user.username || user.email || 'Unbekannt',
          message,
          channel,
          channel_id: channelId,
          created_at: new Date()
        };

        if (channel === 'guild') {
          io.to(`guild:${channelId}`).emit('chat:message', chatData);
        } else if (channel === 'party') {
          io.to(`party:${channelId}`).emit('chat:message', chatData);
        }
      } catch (err) {
        console.error('Error sending chat message:', err);
        socket.emit('error', { message: 'Konnte Nachricht nicht senden' });
      }
    });

    // Disconnect Event
    socket.on('disconnect', async () => {
      try {
        await db.setUserOnline(userId, false);
        
        io.emit('player:offline', {
          id: userId,
          username: user.username
        });
        
        console.log(`❌ User disconnected: ${user.username}`);
      } catch (err) {
        console.error('Error on disconnect:', err);
      }
    });

  } catch (err) {
    console.error('Error in socket connection:', err);
    socket.disconnect();
  }
});

// WICHTIG: Server liefert NUR API, Frontend läuft auf XAMPP!
// Keine statischen Dateien mehr servieren - das macht XAMPP

// API-Only Error Handler
app.use((req, res, next) => {
  // Wenn es eine API-Route ist, die nicht gefunden wurde
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Alle anderen Anfragen ablehnen - Frontend läuft auf XAMPP!
  return res.status(404).json({ 
    error: 'This server only provides API endpoints. Please access the frontend via XAMPP at http://localhost/Gatefall' 
  });
});

// Admin Chat Control Endpoints
app.post('/api/admin/chat-control', (req, res) => {
  const { command, value } = req.body;
  
  if (command === 'toggle') {
    globalChatEnabled = value;
    console.log(`💬 Global Chat ${globalChatEnabled ? 'aktiviert' : 'deaktiviert'}`);
    
    // Notify all connected users
    io.emit('chat:status', { enabled: globalChatEnabled });
  } else if (command === 'restart') {
    chatStats.lastRestart = new Date();
    console.log('🔄 Chat neugestartet');
    
    // Notify all users
    io.emit('chat:restart', { message: 'Chat wurde neugestartet' });
  } else if (command === 'clear') {
    chatStats.messagesToday = 0;
    console.log('🗑️ Chat-Verlauf gelöscht');
  }
  
  res.json({ success: true });
});

app.get('/api/admin/chat-stats', (req, res) => {
  const connectedSockets = io.sockets.sockets.size;
  res.json({
    activeUsers: connectedSockets,
    messagesToday: chatStats.messagesToday,
    lastRestart: chatStats.lastRestart,
    enabled: globalChatEnabled
  });
});

// ==================== AUTOMATIC SYSTEMS ====================

// Close expired gates every 5 minutes
setInterval(async () => {
  try {
    await gatesSpawnSystem.closeExpiredGates();
  } catch (error) {
    console.error('❌ Error closing expired gates:', error);
  }
}, 5 * 60 * 1000);

// Delete old gates every hour (removes gates older than 24h)
setInterval(async () => {
  try {
    await gatesSpawnSystem.deleteOldGates();
  } catch (error) {
    console.error('❌ Error deleting old gates:', error);
  }
}, 60 * 60 * 1000); // Alle 60 Minuten

// 6-HOUR RENEWAL CYCLE: Spawn gates for active players
setInterval(async () => {
  try {
    console.log('🔄 6-Hour Renewal Cycle starting...');
    await gatesSpawnSystem.dailyGateSpawn();
  } catch (error) {
    console.error('❌ Error in renewal cycle:', error);
  }
}, 6 * 60 * 60 * 1000); // Alle 6 Stunden

// Initialize gates on first server start
setTimeout(async () => {
  try {
    console.log('🚀 Initializing Gates Spawn System...');
    await gatesSpawnSystem.closeExpiredGates();
    await gatesSpawnSystem.dailyGateSpawn();
    console.log('✅ Gates Spawn System ready');
    console.log('⏰ Next renewal cycle in 6 hours');
  } catch (error) {
    console.error('❌ Error initializing gates spawn system:', error);
  }
}, 3000);

server.listen(PORT, () => {
  console.log(`✓ Gatefall-Server läuft auf Port ${PORT}`);
  console.log(`  → http://localhost:${PORT}`);
  console.log(`🔌 WebSocket Server aktiv`);
}).on('error', (err) => {
  console.error('❌ Server Error:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`⚠ Port ${PORT} ist bereits belegt.`);
    console.error(`Bitte beende den laufenden Server oder verwende einen anderen Port.`);
    process.exit(1);
  } else {
    throw err;
  }
});

// Globaler Error Handler
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
