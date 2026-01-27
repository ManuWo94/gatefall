import React from 'react';
import './VictoryPopup.css';

const VictoryPopup = ({ 
  open = false, 
  onClose, 
  onNext,
  rewards = { exp: 0, gold: 0 },
  lootItems = [],
  bonusItems = []
}) => {
  if (!open) return null;

  // Platzhalter für Demonstration (Rare Victory)
  const dummyLoot = [
    { id: 1, name: 'Legendary Gem', rarity: 'epic', icon: 'gem' },
    { id: 2, name: 'Mythril Blade', rarity: 'rare', icon: 'sword' },
    { id: 3, name: 'Dragon Scale Cloak', rarity: 'rare', icon: 'cloak' }
  ];

  const dummyBonus = [
    { id: 1, name: 'Mega Potion', count: 3, icon: 'potion' },
    { id: 2, name: 'Rare Scroll', count: 2, icon: 'scroll' }
  ];

  const displayLoot = lootItems.length > 0 ? lootItems : dummyLoot;
  const displayBonus = bonusItems.length > 0 ? bonusItems : dummyBonus;

  // Icon SVGs
  const IconGem = () => (
    <svg viewBox="0 0 100 100" className="item-icon-svg">
      <defs>
        <linearGradient id="gemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#b66dff', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#6b21ff', stopOpacity: 1}} />
        </linearGradient>
      </defs>
      <polygon points="50,10 70,35 50,90 30,35" fill="url(#gemGrad)" stroke="#fff" strokeWidth="2"/>
      <polygon points="50,10 70,35 50,45" fill="rgba(255,255,255,0.3)"/>
    </svg>
  );

  const IconSword = () => (
    <svg viewBox="0 0 100 100" className="item-icon-svg">
      <defs>
        <linearGradient id="swordGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#c0c0c0', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#606060', stopOpacity: 1}} />
        </linearGradient>
      </defs>
      <rect x="45" y="15" width="10" height="50" fill="url(#swordGrad)"/>
      <polygon points="50,10 55,15 45,15" fill="#d4af37"/>
      <rect x="38" y="65" width="24" height="8" rx="2" fill="#8b4513"/>
      <circle cx="50" cy="72" r="6" fill="#d4af37"/>
    </svg>
  );

  const IconCloak = () => (
    <svg viewBox="0 0 100 100" className="item-icon-svg">
      <defs>
        <linearGradient id="cloakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor: '#4a5568', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#1a202c', stopOpacity: 1}} />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="30" rx="20" ry="15" fill="#2d3748"/>
      <path d="M 30,30 Q 20,60 25,90 L 75,90 Q 80,60 70,30" fill="url(#cloakGrad)"/>
      <circle cx="50" cy="30" r="5" fill="#60a5fa"/>
    </svg>
  );

  const IconPotion = () => (
    <svg viewBox="0 0 100 100" className="item-icon-svg">
      <defs>
        <linearGradient id="potionGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor: '#ef4444', stopOpacity: 0.8}} />
          <stop offset="100%" style={{stopColor: '#991b1b', stopOpacity: 0.9}} />
        </linearGradient>
      </defs>
      <rect x="35" y="20" width="30" height="10" rx="2" fill="#8b4513"/>
      <ellipse cx="50" cy="65" rx="22" ry="28" fill="url(#potionGrad)"/>
      <ellipse cx="50" cy="50" rx="15" ry="8" fill="rgba(255,255,255,0.3)"/>
    </svg>
  );

  const IconScroll = () => (
    <svg viewBox="0 0 100 100" className="item-icon-svg">
      <defs>
        <linearGradient id="scrollGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{stopColor: '#d4a574', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#b8956a', stopOpacity: 1}} />
        </linearGradient>
      </defs>
      <rect x="25" y="20" width="50" height="60" rx="3" fill="url(#scrollGrad)"/>
      <rect x="30" y="30" width="40" height="2" fill="#8b6f47"/>
      <rect x="30" y="38" width="35" height="2" fill="#8b6f47"/>
      <rect x="30" y="46" width="38" height="2" fill="#8b6f47"/>
      <rect x="30" y="54" width="30" height="2" fill="#8b6f47"/>
    </svg>
  );

  const getItemIcon = (iconType) => {
    switch(iconType) {
      case 'gem': return <IconGem />;
      case 'sword': return <IconSword />;
      case 'cloak': return <IconCloak />;
      case 'potion': return <IconPotion />;
      case 'scroll': return <IconScroll />;
      default: return <div className="item-placeholder">?</div>;
    }
  };

  const getRarityClass = (rarity) => {
    switch(rarity) {
      case 'epic': return 'rarity-epic';
      case 'rare': return 'rarity-rare';
      case 'uncommon': return 'rarity-uncommon';
      default: return 'rarity-common';
    }
  };

  return (
    <div className="victory-overlay">
      <div className="victory-particles"></div>
      
      <div className="victory-modal">
        {/* Metallischer Rahmen */}
        <div className="modal-frame-top"></div>
        <div className="modal-frame-bottom"></div>
        <div className="modal-frame-left"></div>
        <div className="modal-frame-right"></div>
        
        {/* Corner Decorations */}
        <div className="corner-decoration corner-tl"></div>
        <div className="corner-decoration corner-tr"></div>
        <div className="corner-decoration corner-bl"></div>
        <div className="corner-decoration corner-br"></div>

        {/* Content */}
        <div className="modal-content">
          {/* Header */}
          <div className="victory-header">
            <div className="victory-glow"></div>
            <h1 className="victory-title">SIEG!</h1>
            <p className="victory-subtitle">ALLE GEGNER BESIEGT!</p>
          </div>

          {/* Rewards */}
          <div className="rewards-section">
            <div className="reward-row">
              <div className="reward-icon">
                <svg viewBox="0 0 50 50" className="icon-exp">
                  <defs>
                    <radialGradient id="expGlow">
                      <stop offset="0%" style={{stopColor: '#60a5fa', stopOpacity: 1}} />
                      <stop offset="100%" style={{stopColor: '#1e40af', stopOpacity: 1}} />
                    </radialGradient>
                  </defs>
                  <circle cx="25" cy="25" r="20" fill="url(#expGlow)"/>
                  <circle cx="25" cy="25" r="15" fill="rgba(255,255,255,0.2)"/>
                  <circle cx="25" cy="25" r="8" fill="rgba(255,255,255,0.4)"/>
                </svg>
              </div>
              <span className="reward-label">ERFAHRUNG ERHALTEN</span>
              <span className="reward-value">+{rewards.exp?.toLocaleString() || '12,500'}</span>
            </div>

            <div className="reward-row">
              <div className="reward-icon">
                <svg viewBox="0 0 50 50" className="icon-gold">
                  <defs>
                    <radialGradient id="goldGlow">
                      <stop offset="0%" style={{stopColor: '#fbbf24', stopOpacity: 1}} />
                      <stop offset="100%" style={{stopColor: '#b45309', stopOpacity: 1}} />
                    </radialGradient>
                  </defs>
                  <ellipse cx="25" cy="25" rx="18" ry="20" fill="url(#goldGlow)"/>
                  <ellipse cx="25" cy="22" rx="12" ry="8" fill="rgba(255,255,255,0.3)"/>
                  <circle cx="25" cy="25" r="8" fill="rgba(180,83,9,0.4)"/>
                </svg>
              </div>
              <span className="reward-label">GOLD ERHALTEN</span>
              <span className="reward-value">+{rewards.gold?.toLocaleString() || '7,800'}</span>
            </div>
          </div>

          {/* Loot Section */}
          <div className="loot-section">
            <div className="section-divider">
              <div className="divider-line"></div>
              <h2 className="section-title">BEUTE</h2>
              <div className="divider-line"></div>
            </div>

            <div className="loot-grid">
              {displayLoot.slice(0, 3).map((item, idx) => (
                <div 
                  key={item.id || idx} 
                  className={`loot-card ${getRarityClass(item.rarity)}`}
                  style={{ '--card-index': idx }}
                >
                  <div className="card-glow"></div>
                  <div className="card-icon">
                    {getItemIcon(item.icon)}
                  </div>
                  <div className="card-label">
                    <span className="item-name">{item.name}</span>
                    {item.count && <span className="item-count">x{item.count}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bonus Section */}
          <div className="bonus-section">
            <div className="section-divider">
              <div className="divider-line"></div>
              <h2 className="section-title">BONUS-BELOHNUNGEN</h2>
              <div className="divider-line"></div>
            </div>

            <div className="bonus-grid">
              {displayBonus.slice(0, 2).map((item, idx) => (
                <div key={item.id || idx} className="bonus-card">
                  <div className="card-icon">
                    {getItemIcon(item.icon)}
                  </div>
                  <div className="card-label">
                    <span className="item-name">{item.name}</span>
                    {item.count && <span className="item-count">x{item.count}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn-secondary" onClick={onClose}>
              VERLASSEN
            </button>
            <button className="btn-primary" onClick={onNext}>
              WEITER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VictoryPopup;
