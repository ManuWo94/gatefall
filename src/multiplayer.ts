// Multiplayer-System mit Socket.io
let socket: any = null;
let currentChannel: 'guild' | 'party' = 'guild';
let currentChannelId: number | null = null;
let unreadMessages = 0;
let isPanelOpen = false;
let retryCount = 0;
const MAX_RETRIES = 50; // 5 Sekunden maximal

export function initMultiplayer(userId: number, username: string) {
  console.log('🔌 Initializing multiplayer for user:', username);

  // UI immer initialisieren
  setupUIHandlers(userId);
  showMultiplayerUI();

  // Prüfe ob Socket.io verfügbar ist
  if (typeof (window as any).io === 'undefined') {
    console.warn('⚠️ Socket.io not available. Multiplayer features disabled. Game runs in single-player mode.');
    addSystemMessage('⚠️ Multiplayer-Server nicht verfügbar. Chat ist derzeit offline.', 'error');
    return;
  }

  console.log('✅ Socket.io loaded successfully');

  // @ts-ignore
  socket = io('http://localhost:3001', {
    withCredentials: true,
    autoConnect: false
  });

  // Verbinde zum Server
  socket.connect();

  // Connection Events
  socket.on('connect', () => {
    console.log('✅ Connected to multiplayer server');
    showMultiplayerUI();
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from multiplayer server');
    hideMultiplayerUI();
  });

  socket.on('connect_error', (err: Error) => {
    console.error('❌ Connection error:', err.message);
  });

  // Online Players
  socket.on('online:players', (players: any[]) => {
    console.log('📊 Online players:', players.length);
    updateOnlineList(players);
  });

  socket.on('player:online', (player: any) => {
    console.log('✅ Player online:', player.username);
    addOnlinePlayer(player);
    addSystemMessage(`${player.username} ist jetzt online`);
  });

  socket.on('player:offline', (player: any) => {
    console.log('❌ Player offline:', player.username);
    removeOnlinePlayer(player.id);
    addSystemMessage(`${player.username} ist jetzt offline`);
  });

  // Chat Messages
  socket.on('chat:message', (data: any) => {
    console.log('💬 Chat message:', data);
    
    // Nur Guild oder Party Messages anzeigen
    if (data.channel === currentChannel && data.channel_id === currentChannelId) {
      addChatMessage(data);
    }

    if (!isPanelOpen) {
      unreadMessages++;
      updateBadge();
    }
  });

  // Chat Status Events (für Guild/Party)
  socket.on('chat:status', (data: any) => {
    // Guild/Party Chat Status Updates
    addSystemMessage(data.message);
  });

  socket.on('chat:restart', (data: any) => {
    addSystemMessage('🔄 ' + data.message);
    // Clear messages
    const messagesContainer = document.getElementById('mp-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
    }
  });

  // Party Events
  socket.on('party:updated', (data: any) => {
    console.log('👥 Party updated:', data);
    if (currentChannel === 'party' && data.partyId === currentChannelId) {
      addSystemMessage('Party wurde aktualisiert');
    }
  });

  // Error Handling
  socket.on('error', (data: any) => {
    console.error('❌ Socket error:', data.message);
    addSystemMessage(`Fehler: ${data.message}`, 'error');
  });

  // UI Event Handlers
  setupUIHandlers(userId);
}

function setupUIHandlers(userId: number) {
  const mpToggle = document.getElementById('mp-toggle');
  const mpClose = document.getElementById('mp-close');
  const mpPanel = document.getElementById('multiplayer-panel');
  const mpSend = document.getElementById('mp-send');
  const mpInput = document.getElementById('mp-input') as HTMLInputElement;

  // Toggle Panel
  mpToggle?.addEventListener('click', () => {
    if (mpPanel) {
      isPanelOpen = !isPanelOpen;
      mpPanel.style.display = isPanelOpen ? 'flex' : 'none';
      
      if (isPanelOpen) {
        unreadMessages = 0;
        updateBadge();
        mpInput?.focus();
      }
    }
  });

  mpClose?.addEventListener('click', () => {
    if (mpPanel) {
      isPanelOpen = false;
      mpPanel.style.display = 'none';
      
      // Deactivate chat floating button
      const chatBtn = document.querySelector('.chat-floating-btn');
      if (chatBtn) {
        chatBtn.classList.remove('active');
      }
    }
  });

  // Channel Tabs
  document.querySelectorAll('.mp-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const channel = target.dataset.channel as 'guild' | 'party';
      
      if (channel) {
        switchChannel(channel);
      }
    });
  });

  // Send Message
  const sendMessage = () => {
    if (!mpInput || !mpInput.value.trim()) return;

    // Prüfe ob Socket.io verfügbar ist
    if (!socket) {
      addSystemMessage('⚠️ Chat ist derzeit offline. Bitte später erneut versuchen.', 'error');
      mpInput.value = '';
      return;
    }

    // Prüfe ob eine Gilde/Party ausgewählt ist
    if (!currentChannelId) {
      addSystemMessage(`Bitte trete zuerst einer ${currentChannel === 'guild' ? 'Gilde' : 'Party'} bei, um zu chatten!`, 'error');
      return;
    }

    const message = mpInput.value.trim();
    
    socket.emit('chat:message', {
      message,
      channel: currentChannel,
      channelId: currentChannelId
    });

    mpInput.value = '';
  };

  mpSend?.addEventListener('click', sendMessage);
  
  mpInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}

function showMultiplayerUI() {
  console.log('🎨 showMultiplayerUI called');
  const mpToggle = document.getElementById('mp-toggle');
  console.log('🎨 mp-toggle element:', mpToggle);
  if (mpToggle) {
    mpToggle.style.display = 'block';
    console.log('✅ Chat button shown!');
  } else {
    console.error('❌ mp-toggle element not found!');
  }
}

function hideMultiplayerUI() {
  const mpToggle = document.getElementById('mp-toggle');
  const mpPanel = document.getElementById('multiplayer-panel');
  
  if (mpToggle) mpToggle.style.display = 'none';
  if (mpPanel) mpPanel.style.display = 'none';
  
  isPanelOpen = false;
}

function switchChannel(channel: 'guild' | 'party') {
  currentChannel = channel;
  
  // Update active tab
  document.querySelectorAll('.mp-tab').forEach(tab => {
    tab.classList.remove('active');
    if ((tab as HTMLElement).dataset.channel === channel) {
      tab.classList.add('active');
    }
  });

  // Clear messages
  const messagesContainer = document.getElementById('mp-messages');
  if (messagesContainer) {
    messagesContainer.innerHTML = '';
  }

  // Zeige Info-Nachricht wenn keine Guild/Party aktiv
  if (!currentChannelId) {
    if (channel === 'guild') {
      addSystemMessage('🏰 Trete einer Gilde bei oder gründe eine, um den Gilde-Chat zu nutzen.', 'info');
    } else if (channel === 'party') {
      addSystemMessage('👥 Erstelle oder trete einer Party bei, um den Party-Chat zu nutzen.', 'info');
    }
  } else {
    addSystemMessage(`Kanal gewechselt: ${getChannelName(channel)}`);
  }
}

function getChannelName(channel: string): string {
  switch (channel) {
    case 'guild': return 'Gilde';
    case 'party': return 'Party';
    default: return channel;
  }
}

function addChatMessage(data: any) {
  const messagesContainer = document.getElementById('mp-messages');
  if (!messagesContainer) return;

  const messageEl = document.createElement('div');
  messageEl.className = 'mp-message';
  
  const time = new Date(data.created_at).toLocaleTimeString('de-DE', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  messageEl.innerHTML = `
    <div class="mp-message-header">
      <span class="mp-message-author">${escapeHtml(data.username)}</span>
      <span class="mp-message-time">${time}</span>
    </div>
    <div class="mp-message-content">${escapeHtml(data.message)}</div>
  `;

  messagesContainer.appendChild(messageEl);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addSystemMessage(message: string, type: 'info' | 'error' = 'info') {
  const messagesContainer = document.getElementById('mp-messages');
  if (!messagesContainer) return;

  const messageEl = document.createElement('div');
  messageEl.className = `mp-message mp-system-message mp-${type}`;
  messageEl.textContent = `ℹ️ ${message}`;

  messagesContainer.appendChild(messageEl);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function updateOnlineList(players: any[]) {
  const onlineList = document.getElementById('mp-online-list');
  const onlineCount = document.getElementById('mp-online-count');
  
  if (!onlineList) return;

  onlineList.innerHTML = '';
  
  players.forEach(player => {
    const playerEl = document.createElement('div');
    playerEl.className = 'mp-online-player';
    playerEl.dataset.playerId = player.id.toString();
    playerEl.innerHTML = `
      <span class="mp-online-status">🟢</span>
      <span class="mp-online-name">${escapeHtml(player.username)}</span>
    `;
    onlineList.appendChild(playerEl);
  });

  if (onlineCount) {
    onlineCount.textContent = players.length.toString();
  }
}

function addOnlinePlayer(player: any) {
  const onlineList = document.getElementById('mp-online-list');
  const onlineCount = document.getElementById('mp-online-count');
  
  if (!onlineList) return;

  // Check if player already exists
  if (onlineList.querySelector(`[data-player-id="${player.id}"]`)) {
    return;
  }

  const playerEl = document.createElement('div');
  playerEl.className = 'mp-online-player';
  playerEl.dataset.playerId = player.id.toString();
  playerEl.innerHTML = `
    <span class="mp-online-status">🟢</span>
    <span class="mp-online-name">${escapeHtml(player.username)}</span>
  `;
  onlineList.appendChild(playerEl);

  if (onlineCount) {
    const count = parseInt(onlineCount.textContent || '0') + 1;
    onlineCount.textContent = count.toString();
  }
}

function removeOnlinePlayer(playerId: number) {
  const onlineList = document.getElementById('mp-online-list');
  const onlineCount = document.getElementById('mp-online-count');
  
  if (!onlineList) return;

  const playerEl = onlineList.querySelector(`[data-player-id="${playerId}"]`);
  if (playerEl) {
    playerEl.remove();

    if (onlineCount) {
      const count = Math.max(0, parseInt(onlineCount.textContent || '0') - 1);
      onlineCount.textContent = count.toString();
    }
  }
}

function updateBadge() {
  const badge = document.getElementById('mp-badge');
  if (!badge) return;

  if (unreadMessages > 0) {
    badge.textContent = unreadMessages > 99 ? '99+' : unreadMessages.toString();
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Party Functions
export function joinParty(partyId: number) {
  if (!socket) return;
  socket.emit('party:join', partyId);
  currentChannelId = partyId;
}

export function leaveParty(partyId: number) {
  if (!socket) return;
  socket.emit('party:leave', partyId);
  if (currentChannel === 'party' && currentChannelId === partyId) {
    currentChannelId = null;
    switchChannel('guild');
  }
}

export function setGuildChannel(guildId: number | null) {
  currentChannelId = guildId;
}

export function disconnectMultiplayer() {
  if (socket) {
    socket.disconnect();
  }
}
