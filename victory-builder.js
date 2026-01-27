// Victory Popup Builder - JavaScript

const victoryPopup = document.getElementById('victoryPopup');
const titlePreview = document.getElementById('titlePreview');
const subtitlePreview = document.getElementById('subtitlePreview');
const lootGrid = document.getElementById('lootGrid');
const uploadZone = document.getElementById('uploadZone');
const frameInput = document.getElementById('frameImage');

// Popup Size Controls
document.getElementById('popupWidth').addEventListener('input', function(e) {
    victoryPopup.style.width = e.target.value + 'px';
    document.getElementById('widthValue').textContent = e.target.value + 'px';
});

document.getElementById('popupHeight').addEventListener('input', function(e) {
    victoryPopup.style.height = e.target.value + 'px';
    document.getElementById('heightValue').textContent = e.target.value + 'px';
});

// Title Controls
document.getElementById('titleFont').addEventListener('change', function(e) {
    titlePreview.style.fontFamily = e.target.value;
});

document.getElementById('titleText').addEventListener('input', function(e) {
    titlePreview.textContent = e.target.value;
});

document.getElementById('titleSize').addEventListener('input', function(e) {
    titlePreview.style.fontSize = e.target.value + 'px';
    document.getElementById('titleSizeValue').textContent = e.target.value + 'px';
});

document.getElementById('titleTop').addEventListener('input', function(e) {
    titlePreview.style.top = e.target.value + 'px';
    document.getElementById('titleTopValue').textContent = e.target.value + 'px';
});

document.getElementById('titleSpacing').addEventListener('input', function(e) {
    titlePreview.style.letterSpacing = e.target.value + 'px';
    document.getElementById('titleSpacingValue').textContent = e.target.value + 'px';
});

document.getElementById('titleColor').addEventListener('input', function(e) {
    titlePreview.style.color = e.target.value;
    updateTitleShadow();
});

document.getElementById('titleOutline').addEventListener('input', updateTitleShadow);
document.getElementById('titleOutlineWidth').addEventListener('input', function(e) {
    document.getElementById('titleOutlineWidthValue').textContent = e.target.value + 'px';
    updateTitleShadow();
});

document.getElementById('titleGlow').addEventListener('input', function(e) {
    document.getElementById('titleGlowValue').textContent = e.target.value + 'px';
    updateTitleShadow();
});

function updateTitleShadow() {
    const outlineColor = document.getElementById('titleOutline').value;
    const outlineWidth = document.getElementById('titleOutlineWidth').value;
    const glowSize = document.getElementById('titleGlow').value;
    
    let shadows = [];
    // Outline
    for (let i = -outlineWidth; i <= outlineWidth; i++) {
        for (let j = -outlineWidth; j <= outlineWidth; j++) {
            if (i !== 0 || j !== 0) {
                shadows.push(`${i}px ${j}px 0 ${outlineColor}`);
            }
        }
    }
    // Glow
    if (glowSize > 0) {
        shadows.push(`0 0 ${glowSize}px ${outlineColor}`);
    }
    
    titlePreview.style.textShadow = shadows.join(', ');
}

// Subtitle Controls
document.getElementById('subtitleFont').addEventListener('change', function(e) {
    subtitlePreview.style.fontFamily = e.target.value;
});

document.getElementById('subtitleText').addEventListener('input', function(e) {
    subtitlePreview.textContent = e.target.value;
});

document.getElementById('subtitleSize').addEventListener('input', function(e) {
    subtitlePreview.style.fontSize = e.target.value + 'px';
    document.getElementById('subtitleSizeValue').textContent = e.target.value + 'px';
});

document.getElementById('subtitleTop').addEventListener('input', function(e) {
    subtitlePreview.style.top = e.target.value + 'px';
    document.getElementById('subtitleTopValue').textContent = e.target.value + 'px';
});

document.getElementById('subtitleColor').addEventListener('input', function(e) {
    subtitlePreview.style.color = e.target.value;
});

// Rewards Controls
document.getElementById('expValue').addEventListener('input', function(e) {
    document.querySelector('.reward-row:nth-child(1) .reward-value').textContent = e.target.value;
});

document.getElementById('goldValue').addEventListener('input', function(e) {
    document.querySelector('.reward-row:nth-child(2) .reward-value').textContent = e.target.value;
});

document.getElementById('rewardsTop').addEventListener('input', function(e) {
    document.getElementById('rewardsContainer').style.top = e.target.value + 'px';
    document.getElementById('rewardsTopValue').textContent = e.target.value + 'px';
});

document.getElementById('rewardsWidth').addEventListener('input', function(e) {
    document.getElementById('rewardsContainer').style.width = e.target.value + 'px';
    document.getElementById('rewardsWidthValue').textContent = e.target.value + 'px';
});

document.getElementById('rewardBgColor').addEventListener('input', function(e) {
    const opacity = document.getElementById('rewardOpacity').value / 100;
    const color = e.target.value;
    const rgb = hexToRgb(color);
    document.querySelectorAll('.reward-row').forEach(el => {
        el.style.background = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    });
});

document.getElementById('rewardOpacity').addEventListener('input', function(e) {
    const opacity = e.target.value / 100;
    const color = document.getElementById('rewardBgColor').value;
    const rgb = hexToRgb(color);
    document.querySelectorAll('.reward-row').forEach(el => {
        el.style.background = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    });
    document.getElementById('rewardOpacityValue').textContent = opacity.toFixed(2);
});

document.getElementById('rewardGlowColor').addEventListener('input', updateRewardGlow);
document.getElementById('rewardGlow').addEventListener('input', function(e) {
    document.getElementById('rewardGlowValue').textContent = e.target.value + 'px';
    updateRewardGlow();
});

document.getElementById('rewardHoverGlow').addEventListener('input', function(e) {
    const value = e.target.value;
    const color = document.getElementById('rewardGlowColor').value;
    document.querySelectorAll('.reward-row').forEach(el => {
        el.dataset.hoverGlow = value;
        el.dataset.hoverColor = color;
    });
    document.getElementById('rewardHoverGlowValue').textContent = value + 'px';
});

function updateRewardGlow() {
    const glowColor = document.getElementById('rewardGlowColor').value;
    const glowSize = document.getElementById('rewardGlow').value;
    
    document.querySelectorAll('.reward-row').forEach(el => {
        if (glowSize > 0) {
            el.style.boxShadow = `0 0 ${glowSize}px ${glowColor}`;
        } else {
            el.style.boxShadow = 'none';
        }
        
        // Setup hover
        el.dataset.hoverGlow = document.getElementById('rewardHoverGlow').value;
        el.dataset.hoverColor = glowColor;
        
        el.addEventListener('mouseenter', function() {
            this.style.boxShadow = `0 0 ${this.dataset.hoverGlow}px ${this.dataset.hoverColor}`;
        });
        
        el.addEventListener('mouseleave', function() {
            const normalGlow = document.getElementById('rewardGlow').value;
            if (normalGlow > 0) {
                this.style.boxShadow = `0 0 ${normalGlow}px ${this.dataset.hoverColor}`;
            } else {
                this.style.boxShadow = 'none';
            }
        });
    });
}

// Loot Controls
document.getElementById('lootColumns').addEventListener('input', function(e) {
    lootGrid.style.gridTemplateColumns = `repeat(${e.target.value}, 1fr)`;
    document.getElementById('lootColumnsValue').textContent = e.target.value;
});

document.getElementById('lootTop').addEventListener('input', function(e) {
    lootGrid.style.top = e.target.value + 'px';
    document.getElementById('lootTopValue').textContent = e.target.value + 'px';
});

document.getElementById('lootBgColor').addEventListener('input', function(e) {
    const opacity = document.getElementById('lootOpacity').value / 100;
    const color = e.target.value;
    const rgb = hexToRgb(color);
    document.querySelectorAll('.loot-item').forEach(el => {
        el.style.background = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    });
});

document.getElementById('lootBorderColor').addEventListener('input', function(e) {
    document.querySelectorAll('.loot-item').forEach(el => {
        el.style.borderColor = e.target.value;
    });
});

document.getElementById('lootOpacity').addEventListener('input', function(e) {
    const opacity = e.target.value / 100;
    const color = document.getElementById('lootBgColor').value;
    const rgb = hexToRgb(color);
    document.querySelectorAll('.loot-item').forEach(el => {
        el.style.background = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
    });
    document.getElementById('lootOpacityValue').textContent = opacity.toFixed(2);
});

document.getElementById('lootGlowColor').addEventListener('input', updateLootHover);
document.getElementById('lootHoverGlow').addEventListener('input', function(e) {
    document.getElementById('lootHoverGlowValue').textContent = e.target.value + 'px';
    updateLootHover();
});

document.getElementById('lootWidth').addEventListener('input', function(e) {
    const value = e.target.value;
    document.querySelectorAll('.loot-item').forEach(el => {
        el.style.width = value + 'px';
    });
    document.getElementById('lootWidthValue').textContent = value + 'px';
});

document.getElementById('lootHeight').addEventListener('input', function(e) {
    const value = e.target.value;
    document.querySelectorAll('.loot-item').forEach(el => {
        el.style.height = value + 'px';
    });
    document.getElementById('lootHeightValue').textContent = value + 'px';
});

document.getElementById('lootGap').addEventListener('input', function(e) {
    lootGrid.style.gap = e.target.value + 'px';
    document.getElementById('lootGapValue').textContent = e.target.value + 'px';
});

function updateLootHover() {
    const hoverGlow = document.getElementById('lootHoverGlow').value;
    const color = document.getElementById('lootGlowColor').value;
    
    document.querySelectorAll('.loot-item').forEach(el => {
        el.dataset.hoverGlow = hoverGlow;
        el.dataset.hoverColor = color;
        
        el.addEventListener('mouseenter', function() {
            this.style.boxShadow = `0 0 ${this.dataset.hoverGlow}px ${this.dataset.hoverColor}`;
        });
        
        el.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'none';
        });
    });
}

// Button Controls
const buttonsContainer = document.getElementById('buttonsContainer');

document.getElementById('buttonsBottom').addEventListener('input', function(e) {
    buttonsContainer.style.bottom = e.target.value + 'px';
    document.getElementById('buttonsBottomValue').textContent = e.target.value + 'px';
});

document.getElementById('btnSecondaryBg').addEventListener('input', function(e) {
    const opacity = document.getElementById('btnOpacity').value / 100;
    const color = e.target.value;
    const rgb = hexToRgb(color);
    document.querySelector('.victory-btn.secondary').style.background = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
});

document.getElementById('btnPrimaryBg').addEventListener('input', function(e) {
    const opacity = document.getElementById('btnOpacity').value / 100;
    const color = e.target.value;
    const rgb = hexToRgb(color);
    document.querySelector('.victory-btn.primary').style.background = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
});

document.getElementById('btnOpacity').addEventListener('input', function(e) {
    const opacity = e.target.value / 100;
    
    const secondaryColor = document.getElementById('btnSecondaryBg').value;
    const secondaryRgb = hexToRgb(secondaryColor);
    document.querySelector('.victory-btn.secondary').style.background = `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, ${opacity})`;
    
    const primaryColor = document.getElementById('btnPrimaryBg').value;
    const primaryRgb = hexToRgb(primaryColor);
    document.querySelector('.victory-btn.primary').style.background = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${opacity})`;
    
    document.getElementById('btnOpacityValue').textContent = opacity.toFixed(2);
});

document.getElementById('btnHoverGlow').addEventListener('input', function(e) {
    const hoverGlow = e.target.value;
    
    document.querySelectorAll('.victory-btn').forEach(btn => {
        btn.dataset.hoverGlow = hoverGlow;
        
        btn.addEventListener('mouseenter', function() {
            const color = this.classList.contains('secondary') 
                ? document.getElementById('btnSecondaryBg').value 
                : document.getElementById('btnPrimaryBg').value;
            this.style.boxShadow = `0 0 ${this.dataset.hoverGlow}px ${color}`;
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'none';
        });
    });
    
    document.getElementById('btnHoverGlowValue').textContent = hoverGlow + 'px';
});

// Padding Control
document.getElementById('popupPadding').addEventListener('input', function(e) {
    victoryPopup.style.padding = e.target.value + 'px';
    document.getElementById('paddingValue').textContent = e.target.value + 'px';
});

// Helper function to convert hex to rgb
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

// Image Upload
frameInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            victoryPopup.style.backgroundImage = `url(${event.target.result})`;
            uploadZone.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
});

// Drag & Drop for image
uploadZone.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.style.borderColor = '#60a5fa';
    this.style.background = 'rgba(96, 165, 250, 0.1)';
});

uploadZone.addEventListener('dragleave', function() {
    this.style.borderColor = '#4b5563';
    this.style.background = 'rgba(255, 255, 255, 0.05)';
});

uploadZone.addEventListener('drop', function(e) {
    e.preventDefault();
    this.style.borderColor = '#4b5563';
    this.style.background = 'rgba(255, 255, 255, 0.05)';
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(event) {
            victoryPopup.style.backgroundImage = `url(${event.target.result})`;
            uploadZone.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
});

// Draggable Elements
let currentDrag = null;

document.querySelectorAll('.draggable').forEach(el => {
    el.addEventListener('mousedown', function(e) {
        // Verhindere Dragging wenn auf Buttons geklickt wird
        if (e.target.tagName === 'BUTTON') {
            return;
        }
        
        const rect = this.getBoundingClientRect();
        const parent = this.parentElement.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(this);
        
        // Berechne aktuelle Position relativ zum Parent
        let currentLeft = rect.left - parent.left;
        let currentTop = rect.top - parent.top;
        
        currentDrag = {
            element: this,
            startX: e.clientX,
            startY: e.clientY,
            startLeft: currentLeft,
            startTop: currentTop
        };
        
        // Setze auf absolute Positionierung ohne Transform
        this.style.left = currentLeft + 'px';
        this.style.top = currentTop + 'px';
        this.style.bottom = 'auto';
        this.style.transform = 'none';
        
        e.preventDefault();
        e.stopPropagation();
    });
});

document.addEventListener('mousemove', function(e) {
    if (currentDrag) {
        const deltaX = e.clientX - currentDrag.startX;
        const deltaY = e.clientY - currentDrag.startY;
        
        currentDrag.element.style.left = (currentDrag.startLeft + deltaX) + 'px';
        currentDrag.element.style.top = (currentDrag.startTop + deltaY) + 'px';
    }
});

document.addEventListener('mouseup', function() {
    currentDrag = null;
});

// Export CSS
document.getElementById('exportCSS').addEventListener('click', function() {
    const computedPopup = window.getComputedStyle(victoryPopup);
    const computedTitle = window.getComputedStyle(titlePreview);
    const computedSubtitle = window.getComputedStyle(subtitlePreview);
    const computedReward = window.getComputedStyle(document.querySelector('.reward-row'));
    const computedLoot = window.getComputedStyle(document.querySelector('.loot-item'));
    
    const css = `
/* Victory Popup Styles */
.victory-popup {
    width: ${victoryPopup.style.width || computedPopup.width};
    height: ${victoryPopup.style.height || computedPopup.height};
    padding: ${victoryPopup.style.padding || computedPopup.padding};
    background-size: cover;
    background-position: center;
    background-image: ${victoryPopup.style.backgroundImage};
    position: relative;
}

.victory-title {
    position: absolute;
    top: ${titlePreview.style.top || computedTitle.top};
    left: 50%;
    transform: translateX(-50%);
    font-family: ${titlePreview.style.fontFamily || computedTitle.fontFamily};
    font-size: ${titlePreview.style.fontSize || computedTitle.fontSize};
    color: ${titlePreview.style.color || computedTitle.color};
    letter-spacing: ${titlePreview.style.letterSpacing || computedTitle.letterSpacing};
    text-shadow: ${titlePreview.style.textShadow || computedTitle.textShadow};
    text-align: center;
    z-index: 10;
}

.victory-subtitle {
    position: absolute;
    top: ${subtitlePreview.style.top || computedSubtitle.top};
    left: 50%;
    transform: translateX(-50%);
    font-family: ${subtitlePreview.style.fontFamily || computedSubtitle.fontFamily};
    font-size: ${subtitlePreview.style.fontSize || computedSubtitle.fontSize};
    color: ${subtitlePreview.style.color || computedSubtitle.color};
    text-align: center;
    z-index: 10;
}

.rewards-container {
    position: absolute;
    top: ${document.getElementById('rewardsContainer').style.top || computedReward.parentElement?.top || '170px'};
    left: 50%;
    transform: translateX(-50%);
    width: ${document.getElementById('rewardsContainer').style.width || '440px'};
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 10;
}

.reward-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: ${document.querySelector('.reward-row').style.background || computedReward.background};
    border-radius: 8px;
    backdrop-filter: blur(10px);
    transition: all 0.3s;
}

.reward-icon {
    font-size: 24px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(59, 130, 246, 0.2);
    border-radius: 6px;
}

.reward-label {
    flex: 1;
    font-size: 14px;
    color: #d1d5db;
}

.reward-value {
    font-size: 16px;
    font-weight: bold;
    color: #fbbf24;
}

.loot-grid {
    position: absolute;
    top: ${lootGrid.style.top || computedLoot.top};
    left: 50%;
    transform: translateX(-50%);
    display: grid;
    grid-template-columns: ${lootGrid.style.gridTemplateColumns || 'repeat(3, 1fr)'};
    gap: ${lootGrid.style.gap || '10px'};
    z-index: 10;
}

.loot-item {
    width: ${document.querySelector('.loot-item').style.width || computedLoot.width};
    height: ${document.querySelector('.loot-item').style.height || computedLoot.height};
    background: ${document.querySelector('.loot-item').style.background || computedLoot.background};
    border: 2px solid ${document.querySelector('.loot-item').style.borderColor || computedLoot.borderColor};
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    backdrop-filter: blur(10px);
    transition: all 0.3s;
    cursor: pointer;
}

.victory-buttons {
    position: absolute;
    bottom: ${buttonsContainer.style.bottom || '40px'};
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 12px;
    z-index: 10;
}

.victory-btn {
    padding: 12px 32px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: bold;
    color: white;
    cursor: pointer;
    transition: all 0.3s;
    text-transform: uppercase;
}

.victory-btn.secondary {
    background: ${document.querySelector('.victory-btn.secondary').style.background || 'rgba(107, 114, 128, 0.6)'};
}

.victory-btn.primary {
    background: ${document.querySelector('.victory-btn.primary').style.background || 'rgba(59, 130, 246, 0.6)'};
}

.victory-btn:hover {
    transform: translateY(-2px);
}
`;
    
    // In MySQL speichern statt localStorage
    saveToDatabase(css, getCurrentSettings());
    
    // In Zwischenablage kopieren
    navigator.clipboard.writeText(css).then(() => {
        alert('✅ CSS wurde in die Zwischenablage kopiert und in der Datenbank gespeichert!');
    }).catch(() => {
        alert('✅ CSS wurde in der Datenbank gespeichert!');
    });
});

// Demo-Seite öffnen
document.getElementById('openDemo').addEventListener('click', function() {
    // CSS in localStorage speichern
    const computedPopup = window.getComputedStyle(victoryPopup);
    const computedTitle = window.getComputedStyle(titlePreview);
    const computedSubtitle = window.getComputedStyle(subtitlePreview);
    const computedReward = window.getComputedStyle(document.querySelector('.reward-row'));
    const computedLoot = window.getComputedStyle(document.querySelector('.loot-item'));
    
    const css = `
/* Victory Popup Styles */
.victory-popup {
    width: ${victoryPopup.style.width || computedPopup.width};
    height: ${victoryPopup.style.height || computedPopup.height};
    padding: ${victoryPopup.style.padding || computedPopup.padding};
    background-size: cover;
    background-position: center;
    background-image: ${victoryPopup.style.backgroundImage};
    position: relative;
}

.victory-title {
    position: absolute;
    top: ${titlePreview.style.top || computedTitle.top};
    left: 50%;
    transform: translateX(-50%);
    font-family: ${titlePreview.style.fontFamily || computedTitle.fontFamily};
    font-size: ${titlePreview.style.fontSize || computedTitle.fontSize};
    color: ${titlePreview.style.color || computedTitle.color};
    letter-spacing: ${titlePreview.style.letterSpacing || computedTitle.letterSpacing};
    text-shadow: ${titlePreview.style.textShadow || computedTitle.textShadow};
    text-align: center;
    z-index: 10;
}

.victory-subtitle {
    position: absolute;
    top: ${subtitlePreview.style.top || computedSubtitle.top};
    left: 50%;
    transform: translateX(-50%);
    font-family: ${subtitlePreview.style.fontFamily || computedSubtitle.fontFamily};
    font-size: ${subtitlePreview.style.fontSize || computedSubtitle.fontSize};
    color: ${subtitlePreview.style.color || computedSubtitle.color};
    text-align: center;
    z-index: 10;
}

.rewards-container {
    position: absolute;
    top: ${document.getElementById('rewardsContainer').style.top || computedReward.parentElement?.top || '170px'};
    left: 50%;
    transform: translateX(-50%);
    width: ${document.getElementById('rewardsContainer').style.width || '440px'};
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 10;
}

.reward-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: ${document.querySelector('.reward-row').style.background || computedReward.background};
    border-radius: 8px;
    backdrop-filter: blur(10px);
    transition: all 0.3s;
}

.loot-grid {
    position: absolute;
    top: ${lootGrid.style.top || computedLoot.top};
    left: 50%;
    transform: translateX(-50%);
    display: grid;
    grid-template-columns: ${lootGrid.style.gridTemplateColumns || 'repeat(3, 1fr)'};
    gap: ${lootGrid.style.gap || '10px'};
    z-index: 10;
}

.loot-item {
    width: ${document.querySelector('.loot-item').style.width || computedLoot.width};
    height: ${document.querySelector('.loot-item').style.height || computedLoot.height};
    background: ${document.querySelector('.loot-item').style.background || computedLoot.background};
    border: 2px solid ${document.querySelector('.loot-item').style.borderColor || computedLoot.borderColor};
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    backdrop-filter: blur(10px);
    transition: all 0.3s;
    cursor: pointer;
}

.victory-buttons {
    position: absolute;
    bottom: ${buttonsContainer.style.bottom || '40px'};
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 12px;
    z-index: 10;
}

.victory-btn {
    padding: 12px 32px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: bold;
    color: white;
    cursor: pointer;
    transition: all 0.3s;
    text-transform: uppercase;
}

.victory-btn.secondary {
    background: ${document.querySelector('.victory-btn.secondary').style.background || 'rgba(107, 114, 128, 0.6)'};
}

.victory-btn.primary {
    background: ${document.querySelector('.victory-btn.primary').style.background || 'rgba(59, 130, 246, 0.6)'};
}
`;
    
    localStorage.setItem('victoryBuilderCSS', css);
    
    // Demo-Seite in neuem Tab öffnen
    window.open('victory-builder-demo.html', '_blank');
});

// Speichern & Laden Funktionen
document.getElementById('saveSettings').addEventListener('click', function() {
    const settings = {
        // Popup
        popupWidth: document.getElementById('popupWidth').value,
        popupHeight: document.getElementById('popupHeight').value,
        frameImage: victoryPopup.style.backgroundImage,
        
        // Title
        titleFont: document.getElementById('titleFont').value,
        titleText: document.getElementById('titleText').value,
        titleSize: document.getElementById('titleSize').value,
        titleColor: document.getElementById('titleColor').value,
        titleSpacing: document.getElementById('titleSpacing').value,
        titleTop: document.getElementById('titleTop').value,
        titleOutline: document.getElementById('titleOutline').value,
        titleGlow: document.getElementById('titleGlow').value,
        
        // Subtitle
        subtitleFont: document.getElementById('subtitleFont').value,
        subtitleText: document.getElementById('subtitleText').value,
        subtitleSize: document.getElementById('subtitleSize').value,
        subtitleColor: document.getElementById('subtitleColor').value,
        subtitleTop: document.getElementById('subtitleTop').value,
        
        // Rewards
        rewardsTop: document.getElementById('rewardsTop').value,
        rewardsWidth: document.getElementById('rewardsWidth').value,
        rewardsBg: document.getElementById('rewardsBg').value,
        rewardsOpacity: document.getElementById('rewardsOpacity').value,
        rewardsBorder: document.getElementById('rewardsBorder').value,
        rewardsGlow: document.getElementById('rewardsGlow').value,
        
        // Loot
        lootTop: document.getElementById('lootTop').value,
        lootWidth: document.getElementById('lootWidth').value,
        lootHeight: document.getElementById('lootHeight').value,
        lootBg: document.getElementById('lootBg').value,
        lootOpacity: document.getElementById('lootOpacity').value,
        lootBorder: document.getElementById('lootBorder').value,
        lootGlow: document.getElementById('lootGlow').value,
        lootColumns: document.getElementById('lootColumns').value,
        lootGap: document.getElementById('lootGap').value,
        
        // Buttons
        buttonsBottom: document.getElementById('buttonsBottom').value,
        btnSecondaryBg: document.getElementById('btnSecondaryBg').value,
        btnPrimaryBg: document.getElementById('btnPrimaryBg').value,
        btnOpacity: document.getElementById('btnOpacity').value,
        btnHoverGlow: document.getElementById('btnHoverGlow').value
    };
    
    // In MySQL speichern statt localStorage
    saveToDatabase('', settings);
});

document.getElementById('loadSettings').addEventListener('click', async function() {
    try {
        const response = await fetch('http://localhost:3001/api/admin/victory-builder/load/default');
        const data = await response.json();
        
        if (!data.settings || Object.keys(data.settings).length === 0) {
            alert('❌ Keine gespeicherten Einstellungen gefunden!');
            return;
        }
        
        const settings = data.settings;
    
    // Popup
    document.getElementById('popupWidth').value = settings.popupWidth;
    document.getElementById('popupWidth').dispatchEvent(new Event('input'));
    document.getElementById('popupHeight').value = settings.popupHeight;
    document.getElementById('popupHeight').dispatchEvent(new Event('input'));
    if (settings.frameImage && settings.frameImage !== 'none') {
        victoryPopup.style.backgroundImage = settings.frameImage;
    }
    
    // Title
    document.getElementById('titleFont').value = settings.titleFont;
    document.getElementById('titleFont').dispatchEvent(new Event('change'));
    document.getElementById('titleText').value = settings.titleText;
    document.getElementById('titleText').dispatchEvent(new Event('input'));
    document.getElementById('titleSize').value = settings.titleSize;
    document.getElementById('titleSize').dispatchEvent(new Event('input'));
    document.getElementById('titleColor').value = settings.titleColor;
    document.getElementById('titleColor').dispatchEvent(new Event('input'));
    document.getElementById('titleSpacing').value = settings.titleSpacing;
    document.getElementById('titleSpacing').dispatchEvent(new Event('input'));
    document.getElementById('titleTop').value = settings.titleTop;
    document.getElementById('titleTop').dispatchEvent(new Event('input'));
    document.getElementById('titleOutline').value = settings.titleOutline;
    document.getElementById('titleOutline').dispatchEvent(new Event('input'));
    document.getElementById('titleGlow').value = settings.titleGlow;
    document.getElementById('titleGlow').dispatchEvent(new Event('input'));
    
    // Subtitle
    document.getElementById('subtitleFont').value = settings.subtitleFont;
    document.getElementById('subtitleFont').dispatchEvent(new Event('change'));
    document.getElementById('subtitleText').value = settings.subtitleText;
    document.getElementById('subtitleText').dispatchEvent(new Event('input'));
    document.getElementById('subtitleSize').value = settings.subtitleSize;
    document.getElementById('subtitleSize').dispatchEvent(new Event('input'));
    document.getElementById('subtitleColor').value = settings.subtitleColor;
    document.getElementById('subtitleColor').dispatchEvent(new Event('input'));
    document.getElementById('subtitleTop').value = settings.subtitleTop;
    document.getElementById('subtitleTop').dispatchEvent(new Event('input'));
    
    // Rewards
    document.getElementById('rewardsTop').value = settings.rewardsTop;
    document.getElementById('rewardsTop').dispatchEvent(new Event('input'));
    document.getElementById('rewardsWidth').value = settings.rewardsWidth;
    document.getElementById('rewardsWidth').dispatchEvent(new Event('input'));
    document.getElementById('rewardsBg').value = settings.rewardsBg;
    document.getElementById('rewardsBg').dispatchEvent(new Event('input'));
    document.getElementById('rewardsOpacity').value = settings.rewardsOpacity;
    document.getElementById('rewardsOpacity').dispatchEvent(new Event('input'));
    document.getElementById('rewardsBorder').value = settings.rewardsBorder;
    document.getElementById('rewardsBorder').dispatchEvent(new Event('input'));
    document.getElementById('rewardsGlow').value = settings.rewardsGlow;
    document.getElementById('rewardsGlow').dispatchEvent(new Event('input'));
    
    // Loot
    document.getElementById('lootTop').value = settings.lootTop;
    document.getElementById('lootTop').dispatchEvent(new Event('input'));
    document.getElementById('lootWidth').value = settings.lootWidth;
    document.getElementById('lootWidth').dispatchEvent(new Event('input'));
    document.getElementById('lootHeight').value = settings.lootHeight;
    document.getElementById('lootHeight').dispatchEvent(new Event('input'));
    document.getElementById('lootBg').value = settings.lootBg;
    document.getElementById('lootBg').dispatchEvent(new Event('input'));
    document.getElementById('lootOpacity').value = settings.lootOpacity;
    document.getElementById('lootOpacity').dispatchEvent(new Event('input'));
    document.getElementById('lootBorder').value = settings.lootBorder;
    document.getElementById('lootBorder').dispatchEvent(new Event('input'));
    document.getElementById('lootGlow').value = settings.lootGlow;
    document.getElementById('lootGlow').dispatchEvent(new Event('input'));
    document.getElementById('lootColumns').value = settings.lootColumns;
    document.getElementById('lootColumns').dispatchEvent(new Event('input'));
    document.getElementById('lootGap').value = settings.lootGap;
    document.getElementById('lootGap').dispatchEvent(new Event('input'));
    
    // Buttons
    document.getElementById('buttonsBottom').value = settings.buttonsBottom;
    document.getElementById('buttonsBottom').dispatchEvent(new Event('input'));
    document.getElementById('btnSecondaryBg').value = settings.btnSecondaryBg;
    document.getElementById('btnSecondaryBg').dispatchEvent(new Event('input'));
    document.getElementById('btnPrimaryBg').value = settings.btnPrimaryBg;
    document.getElementById('btnPrimaryBg').dispatchEvent(new Event('input'));
    document.getElementById('btnOpacity').value = settings.btnOpacity;
    document.getElementById('btnOpacity').dispatchEvent(new Event('input'));
    document.getElementById('btnHoverGlow').value = settings.btnHoverGlow;
    document.getElementById('btnHoverGlow').dispatchEvent(new Event('input'));
    
    alert('✅ Einstellungen geladen!');
    } catch (error) {
        console.error('Load error:', error);
        alert('❌ Fehler beim Laden: ' + error.message);
    }
});

// Automatisches Laden beim Start
window.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('http://localhost:3001/api/admin/victory-builder/load/default');
        const data = await response.json();
        
        if (data.settings && Object.keys(data.settings).length > 0) {
            console.log('🔄 Gespeicherte Einstellungen gefunden. Klicke auf "📂 Laden" um sie wiederherzustellen.');
        }
        
        if (data.css) {
            console.log('✅ Gespeichertes CSS in Datenbank verfügbar.');
        }
    } catch (error) {
        console.log('ℹ️ Noch keine Einstellungen in der Datenbank.');
    }
});

// CSS als Datei herunterladen
function downloadCSS() {
    const computedPopup = window.getComputedStyle(victoryPopup);
    const computedTitle = window.getComputedStyle(titlePreview);
    const computedSubtitle = window.getComputedStyle(subtitlePreview);
    const computedReward = window.getComputedStyle(document.querySelector('.reward-row'));
    const computedLoot = window.getComputedStyle(document.querySelector('.loot-item'));
    
    const css = `
/* Victory Popup Styles - Exportiert aus Victory Builder */
.victory-popup {
    width: ${victoryPopup.style.width || computedPopup.width};
    height: ${victoryPopup.style.height || computedPopup.height};
    padding: ${victoryPopup.style.padding || computedPopup.padding};
    background-size: cover;
    background-position: center;
    background-image: ${victoryPopup.style.backgroundImage};
    position: relative;
}

.victory-title {
    position: absolute;
    top: ${titlePreview.style.top || computedTitle.top};
    left: 50%;
    transform: translateX(-50%);
    font-family: ${titlePreview.style.fontFamily || computedTitle.fontFamily};
    font-size: ${titlePreview.style.fontSize || computedTitle.fontSize};
    color: ${titlePreview.style.color || computedTitle.color};
    letter-spacing: ${titlePreview.style.letterSpacing || computedTitle.letterSpacing};
    text-shadow: ${titlePreview.style.textShadow || computedTitle.textShadow};
    text-align: center;
    z-index: 10;
}

.victory-subtitle {
    position: absolute;
    top: ${subtitlePreview.style.top || computedSubtitle.top};
    left: 50%;
    transform: translateX(-50%);
    font-family: ${subtitlePreview.style.fontFamily || computedSubtitle.fontFamily};
    font-size: ${subtitlePreview.style.fontSize || computedSubtitle.fontSize};
    color: ${subtitlePreview.style.color || computedSubtitle.color};
    text-align: center;
    z-index: 10;
}

.rewards-container {
    position: absolute;
    top: ${document.getElementById('rewardsContainer').style.top || '170px'};
    left: 50%;
    transform: translateX(-50%);
    width: ${document.getElementById('rewardsContainer').style.width || '440px'};
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 10;
}

.reward-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: ${document.querySelector('.reward-row').style.background || computedReward.background};
    border-radius: 8px;
    backdrop-filter: blur(10px);
    transition: all 0.3s;
}

.reward-icon {
    font-size: 24px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(59, 130, 246, 0.2);
    border-radius: 6px;
}

.reward-label {
    flex: 1;
    font-size: 14px;
    color: #d1d5db;
}

.reward-value {
    font-size: 16px;
    font-weight: bold;
    color: #fbbf24;
}

.loot-grid {
    position: absolute;
    top: ${lootGrid.style.top || computedLoot.top};
    left: 50%;
    transform: translateX(-50%);
    display: grid;
    grid-template-columns: ${lootGrid.style.gridTemplateColumns || 'repeat(3, 1fr)'};
    gap: ${lootGrid.style.gap || '10px'};
    z-index: 10;
}

.loot-item {
    width: ${document.querySelector('.loot-item').style.width || computedLoot.width};
    height: ${document.querySelector('.loot-item').style.height || computedLoot.height};
    background: ${document.querySelector('.loot-item').style.background || computedLoot.background};
    border: 2px solid ${document.querySelector('.loot-item').style.borderColor || computedLoot.borderColor};
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    backdrop-filter: blur(10px);
    transition: all 0.3s;
    cursor: pointer;
}

.loot-item:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}

.victory-buttons {
    position: absolute;
    bottom: ${buttonsContainer.style.bottom || '40px'};
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 12px;
    z-index: 10;
}

.victory-btn {
    padding: 12px 32px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: bold;
    color: white;
    cursor: pointer;
    transition: all 0.3s;
    text-transform: uppercase;
}

.victory-btn.secondary {
    background: ${document.querySelector('.victory-btn.secondary').style.background || 'rgba(107, 114, 128, 0.6)'};
}

.victory-btn.primary {
    background: ${document.querySelector('.victory-btn.primary').style.background || 'rgba(59, 130, 246, 0.6)'};
}

.victory-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}
`;

    // In MySQL speichern
    saveToDatabase(css, getCurrentSettings());
    
    // Als Datei herunterladen
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'victory-popup-styles.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('✅ CSS wurde gespeichert und heruntergeladen!');
}

// Globale Funktion für Download-Button
window.downloadVictoryCSS = downloadCSS;

// ==================== MySQL INTEGRATION ====================

function getCurrentSettings() {
    return {
        popupWidth: document.getElementById('popupWidth').value,
        popupHeight: document.getElementById('popupHeight').value,
        titleFont: document.getElementById('titleFont').value,
        titleText: document.getElementById('titleText').value,
        titleSize: document.getElementById('titleSize').value,
        titleColor: document.getElementById('titleColor').value,
        titleSpacing: document.getElementById('titleSpacing').value,
        titleTop: document.getElementById('titleTop').value,
        titleOutline: document.getElementById('titleOutline').value,
        titleGlow: document.getElementById('titleGlow').value,
        subtitleFont: document.getElementById('subtitleFont').value,
        subtitleText: document.getElementById('subtitleText').value,
        subtitleSize: document.getElementById('subtitleSize').value,
        subtitleColor: document.getElementById('subtitleColor').value,
        subtitleTop: document.getElementById('subtitleTop').value
    };
}

async function saveToDatabase(cssCode, settings) {
    try {
        const response = await fetch('http://localhost:3001/api/admin/victory-builder/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                settingName: 'default',
                cssCode: cssCode,
                settings: settings
            })
        });

        const result = await response.json();
        if (result.success) {
            console.log('✅ In Datenbank gespeichert!');
        } else {
            console.error('❌ Datenbank Fehler:', result.error);
        }
    } catch (error) {
        console.error('❌ Speichern fehlgeschlagen:', error);
    }
}
