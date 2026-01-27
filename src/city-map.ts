/**
 * CITY MAP - Interaktive Stadtkarte mit POIs
 */

const API_BASE = 'http://localhost:3001';

interface CityPOI {
    id: string;
    name: string;
    type: 'shop' | 'arena' | 'guild' | 'inn' | 'bank' | 'crafting' | 'quest';
    x: number;
    y: number;
    radius: number;
    icon: string;
    description: string;
    action?: string; // Panel to switch to
}

interface Gate {
    id: number;
    city_id: number;
    city_name?: string;
    name: string;
    gate_rank: string;
    gate_type: string;
    level: number;
    map_x: number;
    map_y: number;
    status: string;
    created_at: string;
}

class CityMap {
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private cityImage: HTMLImageElement | null = null;
    private pois: CityPOI[] = [];
    private gates: Gate[] = [];
    private hoveredPOI: CityPOI | null = null;
    private hoveredGate: Gate | null = null;
    private currentCityId: number | null = null;
    private isResting: boolean = false;
    private restingInterval: number | null = null;
    private restStartTime: number = 0;
    private gatesUpdateInterval: number | null = null;

    async init(cityId?: number) {
        this.canvas = document.getElementById('city-map-canvas') as HTMLCanvasElement;
        if (!this.canvas) {
            console.error('City map canvas not found');
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('Could not get canvas context');
            return;
        }

        // Set canvas size
        this.canvas.width = 850;
        this.canvas.height = 510;

        this.currentCityId = cityId || 19; // Default to starting city

        await this.loadCityImage();
        await this.loadPOIsFromDatabase(); // Load from database
        await this.loadGates(); // Load gates
        this.setupEvents();
        this.render();
        this.renderGatesList(); // Render gates list
        
        // Update gates every 30 seconds
        this.gatesUpdateInterval = window.setInterval(() => {
            this.loadGates();
            this.renderGatesList();
        }, 30000);
    }

    async loadPOIsFromDatabase() {
        try {
            const response = await fetch(`${API_BASE}/api/admin/city-pois/${this.currentCityId}`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const dbPOIs = await response.json();
                
                // Convert DB POIs to CityPOI format
                this.pois = dbPOIs.map((poi: any) => ({
                    id: poi.type,
                    name: poi.name,
                    type: poi.type as any,
                    x: poi.map_x,
                    y: poi.map_y,
                    radius: 25,
                    icon: poi.icon,
                    description: poi.description,
                    action: poi.action
                }));
                
                console.log(`✅ Loaded ${this.pois.length} POIs from database`);
            } else {
                // Fallback to default POIs if none in database
                console.log('⚠️ No POIs in database, using defaults');
                this.setupPOIs();
            }
        } catch (error) {
            console.error('Error loading POIs from database:', error);
            // Fallback to default POIs
            this.setupPOIs();
        }
    }

    async loadCityImage() {
        try {
            // Try to load city-specific image
            const response = await fetch(`${API_BASE}/api/cities/${this.currentCityId}/map-image`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.imageUrl) {
                this.cityImage = new Image();
                this.cityImage.crossOrigin = 'anonymous';
                this.cityImage.onload = () => {
                    console.log('City map image loaded successfully');
                    this.render();
                };
                this.cityImage.onerror = () => {
                    console.warn('Failed to load city map image, using canvas fallback');
                    this.cityImage = null;
                    this.render();
                };
                // Vollständige URL mit API_BASE für Cross-Origin
                const fullImageUrl = data.imageUrl.startsWith('http') ? data.imageUrl : `${API_BASE}${data.imageUrl}`;
                this.cityImage.src = fullImageUrl;
            } else {
                console.log('No city image, using canvas fallback');
                this.cityImage = null;
                this.render();
            }
        } catch (error) {
            console.error('Error loading city map:', error);
            this.cityImage = null;
            this.render();
        }
    }

    setupPOIs() {
        // Default POIs for any city (can be customized per city later)
        this.pois = [
            {
                id: 'shop',
                name: 'Item Shop',
                type: 'shop',
                x: 200,
                y: 150,
                radius: 30,
                icon: '🏪',
                description: 'Kaufe und verkaufe Items',
                action: 'shop'
            },
            {
                id: 'arena',
                name: 'Arena',
                type: 'arena',
                x: 650,
                y: 150,
                radius: 30,
                icon: '⚔️',
                description: 'Kämpfe gegen Monster',
                action: 'combat'
            },
            {
                id: 'guild',
                name: 'Gildenhalle',
                type: 'guild',
                x: 425,
                y: 100,
                radius: 30,
                icon: '🏛️',
                description: 'Gründe oder trete einer Gilde bei',
                action: 'vereinigung'
            },
            {
                id: 'inn',
                name: 'Gasthof',
                type: 'inn',
                x: 150,
                y: 350,
                radius: 30,
                icon: '🏨',
                description: 'Heile HP/MP und speichere',
                action: undefined
            },
            {
                id: 'bank',
                name: 'Bank',
                type: 'bank',
                x: 700,
                y: 350,
                radius: 30,
                icon: '🏦',
                description: 'Verwalte dein Gold',
                action: undefined
            },
            {
                id: 'crafting',
                name: 'Crafting Station',
                type: 'crafting',
                x: 425,
                y: 400,
                radius: 30,
                icon: '🔨',
                description: 'Stelle Items her',
                action: 'crafting'
            },
            {
                id: 'quest-board',
                name: 'Quest Board',
                type: 'quest',
                x: 425,
                y: 250,
                radius: 30,
                icon: '📋',
                description: 'Nimm Quests an',
                action: 'quests'
            }
        ];
    }

    setupEvents() {
        if (!this.canvas) return;

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas!.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.hoveredPOI = null;
            for (const poi of this.pois) {
                const dx = x - poi.x;
                const dy = y - poi.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= poi.radius) {
                    this.hoveredPOI = poi;
                    this.canvas!.style.cursor = 'pointer';
                    break;
                }
            }

            if (!this.hoveredPOI) {
                this.canvas!.style.cursor = 'default';
            }

            this.render();
        });

        this.canvas.addEventListener('click', (e) => {
            if (this.hoveredPOI) {
                this.handlePOIClick(this.hoveredPOI);
            }
        });
    }

    handlePOIClick(poi: CityPOI) {
        console.log(`🏙️ Clicked POI: ${poi.name}`);

        // Prevent multiple clicks
        if (this.isResting) {
            alert('Du ruhst gerade im Gasthof. Warte bis die Heilung abgeschlossen ist.');
            return;
        }

        // Special handlers
        if (poi.id === 'inn') {
            this.startRestAtInn();
            return;
        }

        if (poi.id === 'bank') {
            alert('🏦 Bank-System kommt bald!');
            return;
        }

        // Switch to corresponding panel
        if (poi.action && typeof (window as any).switchPanel === 'function') {
            (window as any).switchPanel(poi.action);
        }
    }

    startRestAtInn() {
        const player = (window as any).LocalStorage?.getCurrentPlayer();
        if (!player) {
            alert('Kein Spieler gefunden');
            return;
        }

        const healCost = 50;
        if (player.gold < healCost) {
            alert('❌ Nicht genug Gold!\n\nDu benötigst 50 Gold um im Gasthof zu übernachten.');
            return;
        }

        const hpMissing = player.maxHp - player.currentHp;
        const mpMissing = player.maxMp - player.currentMp;
        
        if (hpMissing === 0 && mpMissing === 0) {
            alert('Du bist bereits vollständig geheilt!');
            return;
        }

        // Calculate rest time (1% HP/MP per 3 seconds)
        const totalMissing = hpMissing + mpMissing;
        const totalMax = player.maxHp + player.maxMp;
        const percentMissing = (totalMissing / totalMax) * 100;
        const restTimeSeconds = Math.ceil(percentMissing * 3); // 3 seconds per 1%
        const restTimeMinutes = Math.floor(restTimeSeconds / 60);
        const restTimeRemainderSeconds = restTimeSeconds % 60;

        if (!confirm(`🏨 Im Gasthof übernachten?\n\n💰 Kosten: 50 Gold\n❤️ HP: ${player.currentHp}/${player.maxHp}\n💙 MP: ${player.currentMp}/${player.maxMp}\n\n⏰ Ruhezeit: ${restTimeMinutes}m ${restTimeRemainderSeconds}s\n\nDu wirst langsam über Zeit geheilt.`)) {
            return;
        }

        // Pay for the inn
        (window as any).LocalStorage?.updateCurrentPlayer({
            gold: player.gold - healCost
        });

        // Start resting
        this.isResting = true;
        this.restStartTime = Date.now();

        // Show resting UI
        this.showRestingUI(restTimeSeconds);

        // Heal over time
        this.restingInterval = window.setInterval(() => {
            this.tickResting();
        }, 3000); // Tick every 3 seconds (1% HP/MP)
    }

    showRestingUI(durationSeconds: number) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'resting-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const restBox = document.createElement('div');
        restBox.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 2px solid rgba(100, 181, 246, 0.3);
            border-radius: 15px;
            padding: 30px;
            max-width: 400px;
            text-align: center;
            color: white;
        `;

        restBox.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 15px;">🛏️</div>
            <h2 style="color: #64B5F6; margin-bottom: 10px;">Ruhe im Gasthof</h2>
            <p style="color: rgba(255,255,255,0.6); margin-bottom: 20px;">Du schläfst und regenerierst dich...</p>
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div id="rest-hp-bar" style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>❤️ HP</span>
                        <span id="rest-hp-text">0/0</span>
                    </div>
                    <div style="background: rgba(0,0,0,0.5); height: 10px; border-radius: 5px; overflow: hidden;">
                        <div id="rest-hp-fill" style="background: linear-gradient(90deg, #06b6d4, #22d3ee); height: 100%; width: 0%; transition: width 0.5s;"></div>
                    </div>
                </div>
                <div id="rest-mp-bar">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>💙 MP</span>
                        <span id="rest-mp-text">0/0</span>
                    </div>
                    <div style="background: rgba(0,0,0,0.5); height: 10px; border-radius: 5px; overflow: hidden;">
                        <div id="rest-mp-fill" style="background: linear-gradient(90deg, #8b5cf6, #a78bfa); height: 100%; width: 0%; transition: width 0.5s;"></div>
                    </div>
                </div>
            </div>
            <div style="font-size: 1.2rem; color: #fbbf24; margin-bottom: 15px;">
                ⏰ <span id="rest-timer">00:00</span>
            </div>
            <button id="rest-cancel-btn" style="
                background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
                border: none;
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
            ">Aufstehen (Heilung abbrechen)</button>
        `;

        overlay.appendChild(restBox);
        document.body.appendChild(overlay);

        // Update initial values
        this.updateRestingUI();

        // Cancel button
        const cancelBtn = document.getElementById('rest-cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.stopResting();
            });
        }
    }

    updateRestingUI() {
        const player = (window as any).LocalStorage?.getCurrentPlayer();
        if (!player) return;

        const hpPercent = (player.currentHp / player.maxHp) * 100;
        const mpPercent = (player.currentMp / player.maxMp) * 100;

        const hpText = document.getElementById('rest-hp-text');
        const mpText = document.getElementById('rest-mp-text');
        const hpFill = document.getElementById('rest-hp-fill');
        const mpFill = document.getElementById('rest-mp-fill');

        if (hpText) hpText.textContent = `${player.currentHp}/${player.maxHp}`;
        if (mpText) mpText.textContent = `${player.currentMp}/${player.maxMp}`;
        if (hpFill) (hpFill as HTMLElement).style.width = `${hpPercent}%`;
        if (mpFill) (mpFill as HTMLElement).style.width = `${mpPercent}%`;

        // Update timer
        const elapsed = Math.floor((Date.now() - this.restStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timerEl = document.getElementById('rest-timer');
        if (timerEl) {
            timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    tickResting() {
        const player = (window as any).LocalStorage?.getCurrentPlayer();
        if (!player) {
            this.stopResting();
            return;
        }

        // Heal 1% of max HP and MP
        const hpHeal = Math.ceil(player.maxHp * 0.01);
        const mpHeal = Math.ceil(player.maxMp * 0.01);

        const newHp = Math.min(player.currentHp + hpHeal, player.maxHp);
        const newMp = Math.min(player.currentMp + mpHeal, player.maxMp);

        (window as any).LocalStorage?.updateCurrentPlayer({
            currentHp: newHp,
            currentMp: newMp
        });

        // Update UI
        this.updateRestingUI();

        // Check if fully healed
        if (newHp >= player.maxHp && newMp >= player.maxMp) {
            this.completeResting();
        }
    }

    completeResting() {
        this.stopResting();
        alert('✅ Du bist vollständig ausgeruht!\n\nHP und MP wurden vollständig wiederhergestellt.');
    }

    stopResting() {
        this.isResting = false;

        if (this.restingInterval) {
            clearInterval(this.restingInterval);
            this.restingInterval = null;
        }

        // Remove overlay
        const overlay = document.getElementById('resting-overlay');
        if (overlay) {
            overlay.remove();
        }

        // Update main UI
        if (typeof (window as any).systemUI?.updateStatsDisplay === 'function') {
            (window as any).systemUI.updateStatsDisplay();
        }
    }

    render() {
        if (!this.ctx || !this.canvas) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        if (this.cityImage && this.cityImage.complete) {
            this.ctx.drawImage(this.cityImage, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.drawCityBackground();
        }

        // Draw Gates (behind POIs)
        this.gates.forEach(gate => {
            this.drawGate(gate, gate === this.hoveredGate);
        });

        // Draw POIs
        this.pois.forEach(poi => {
            this.drawPOI(poi, poi === this.hoveredPOI);
        });

        // Draw tooltip for hovered POI or Gate
        if (this.hoveredPOI) {
            this.drawTooltip(this.hoveredPOI);
        } else if (this.hoveredGate) {
            this.drawGateTooltip(this.hoveredGate);
        }
    }

    drawCityBackground() {
        if (!this.ctx) return;

        // Professional dark background (like admin panels)
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas!.height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas!.width, this.canvas!.height);

        // Subtle grid pattern
        this.ctx.strokeStyle = 'rgba(100, 181, 246, 0.05)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < this.canvas!.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas!.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < this.canvas!.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas!.width, y);
            this.ctx.stroke();
        }
    }

    drawPOI(poi: CityPOI, isHovered: boolean) {
        if (!this.ctx) return;

        // Professional hexagon shape
        const radius = poi.radius;
        const x = poi.x;
        const y = poi.y;

        // Draw hexagon
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const px = x + radius * Math.cos(angle);
            const py = y + radius * Math.sin(angle);
            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        }
        this.ctx.closePath();
        
        if (isHovered) {
            this.ctx.fillStyle = 'rgba(100, 181, 246, 0.3)';
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#64B5F6';
        } else {
            this.ctx.fillStyle = 'rgba(33, 150, 243, 0.2)';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = 'rgba(33, 150, 243, 0.3)';
        }
        
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Draw border
        this.ctx.strokeStyle = isHovered ? '#64B5F6' : '#2196F3';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw icon
        this.ctx.font = `${radius * 0.8}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(poi.icon, poi.x, poi.y);

        // Draw label (only when hovered for cleaner look)
        if (isHovered) {
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillStyle = 'white';
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 3;
            this.ctx.strokeText(poi.name, poi.x, poi.y + poi.radius + 15);
            this.ctx.fillText(poi.name, poi.x, poi.y + poi.radius + 15);
        }
    }

    drawTooltip(poi: CityPOI) {
        if (!this.ctx) return;

        const padding = 10;
        const text = poi.description;
        this.ctx.font = '14px Arial';
        const textWidth = this.ctx.measureText(text).width;
        const tooltipWidth = textWidth + padding * 2;
        const tooltipHeight = 30;

        let x = poi.x - tooltipWidth / 2;
        let y = poi.y - poi.radius - tooltipHeight - 10;

        // Keep tooltip in bounds
        if (x < 0) x = 0;
        if (x + tooltipWidth > this.canvas!.width) x = this.canvas!.width - tooltipWidth;
        if (y < 0) y = poi.y + poi.radius + 10;

        // Draw tooltip background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.roundRect(x, y, tooltipWidth, tooltipHeight, 5);
        this.ctx.fill();
        this.ctx.stroke();

        // Draw text
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x + tooltipWidth / 2, y + tooltipHeight / 2);
    }

    roundRect(x: number, y: number, width: number, height: number, radius: number) {
        if (!this.ctx) return;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
    
    drawGate(gate: Gate, isHovered: boolean) {
        if (!this.ctx) return;
        
        const rankColors: Record<string, string> = {
            'E': '#A0522D', 'D': '#8B4513', 'C': '#4169E1', 
            'B': '#32CD32', 'A': '#FFD700', 'S': '#FF4444',
            'SS': '#8B008B', 'SSS': '#FF00FF'
        };
        const rankColor = rankColors[gate.gate_rank] || '#666';
        
        // Pulsating glow effect
        const pulse = Math.sin(Date.now() / 500) * 0.3 + 0.7;
        
        // Draw outer glow
        if (isHovered) {
            this.ctx.shadowBlur = 30;
            this.ctx.shadowColor = rankColor;
        } else {
            this.ctx.shadowBlur = 15 * pulse;
            this.ctx.shadowColor = rankColor;
        }
        
        // Draw gate circle
        this.ctx.beginPath();
        this.ctx.arc(gate.map_x, gate.map_y, isHovered ? 32 : 30, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${parseInt(rankColor.slice(1,3), 16)}, ${parseInt(rankColor.slice(3,5), 16)}, ${parseInt(rankColor.slice(5,7), 16)}, 0.3)`;
        this.ctx.fill();
        this.ctx.strokeStyle = rankColor;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        this.ctx.shadowBlur = 0;
        
        // Draw gate icon
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('🌀', gate.map_x, gate.map_y);
        
        // Draw rank badge
        if (isHovered) {
            this.ctx.font = 'bold 10px Arial';
            this.ctx.fillStyle = rankColor;
            this.ctx.fillText(gate.gate_rank, gate.map_x, gate.map_y + 45);
        }
    }
    
    drawGateTooltip(gate: Gate) {
        if (!this.ctx) return;
        
        const padding = 10;
        const text = `${gate.name} [${gate.gate_rank}] - Lv.${gate.level}`;
        this.ctx.font = '14px Arial';
        const textWidth = this.ctx.measureText(text).width;
        const tooltipWidth = textWidth + padding * 2;
        const tooltipHeight = 30;
        
        let x = gate.map_x - tooltipWidth / 2;
        let y = gate.map_y - 30 - tooltipHeight - 10;
        
        // Keep tooltip in bounds
        if (x < 0) x = 0;
        if (x + tooltipWidth > this.canvas!.width) x = this.canvas!.width - tooltipWidth;
        if (y < 0) y = gate.map_y + 30 + 10;
        
        // Draw tooltip background
        this.ctx.fillStyle = 'rgba(139, 0, 0, 0.95)';
        this.ctx.strokeStyle = '#dc3545';
        this.ctx.lineWidth = 2;
        this.roundRect(x, y, tooltipWidth, tooltipHeight, 5);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw text
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, x + tooltipWidth / 2, y + tooltipHeight / 2);
    }

    updateCity(cityId: number) {
        this.currentCityId = cityId;
        this.loadCityImage();
        this.loadGates();
        this.render();
    }
    
    async loadGates() {
        try {
            // Load ALL gates from all cities
            const response = await fetch(`${API_BASE}/api/gates/all`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                this.gates = data.gates || [];
                console.log(`🌀 Loaded ${this.gates.length} gates from all cities`);
                this.renderGatesList();
                this.render();
            }
        } catch (error) {
            console.error('Error loading gates:', error);
        }
    }
    
    renderGatesList() {
        const gatesList = document.getElementById('gates-list');
        if (!gatesList) return;
        
        if (this.gates.length === 0) {
            gatesList.innerHTML = `
                <div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.3); font-size: 0.9rem;">
                    Keine aktiven Gates
                </div>
            `;
            return;
        }
        
        // Group gates by city
        const gatesByCity: Record<number, any[]> = {};
        const cityNames: Record<number, string> = {};
        
        this.gates.forEach(gate => {
            if (!gatesByCity[gate.city_id]) {
                gatesByCity[gate.city_id] = [];
                cityNames[gate.city_id] = gate.city_name || `Stadt ${gate.city_id}`;
            }
            gatesByCity[gate.city_id].push(gate);
        });
        
        let html = '';
        
        Object.keys(gatesByCity).forEach(cityIdStr => {
            const cityId = parseInt(cityIdStr);
            const cityGates = gatesByCity[cityId];
            const cityName = cityNames[cityId];
            const isCurrentCity = cityId === this.currentCityId;
            
            html += `
                <div style="margin-bottom: 15px;">
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px; padding: 5px 8px; background: ${isCurrentCity ? 'rgba(100,200,255,0.15)' : 'rgba(255,255,255,0.05)'}; border-radius: 4px; border-left: 3px solid ${isCurrentCity ? '#64c8ff' : '#666'};">
                        <span style="font-size: 0.9rem;">${isCurrentCity ? '📍' : '🏙️'}</span>
                        <span style="font-size: 0.85rem; font-weight: bold; color: ${isCurrentCity ? '#64c8ff' : 'rgba(255,255,255,0.7)'}; text-transform: capitalize;">${cityName.replace('_', ' ')}</span>
                        <span style="font-size: 0.7rem; color: rgba(255,255,255,0.4);">(${cityGates.length})</span>
                    </div>
                    ${cityGates.map(gate => this.renderGateCard(gate, isCurrentCity)).join('')}
                </div>
            `;
        });
        
        gatesList.innerHTML = html;
    }
    
    renderGateCard(gate: any, isCurrentCity: boolean): string {
        const rankColors: Record<string, string> = {
            'E': '#A0522D', 'D': '#8B4513', 'C': '#4169E1', 
            'B': '#32CD32', 'A': '#FFD700', 'S': '#FF4444',
            'SS': '#8B008B', 'SSS': '#FF00FF'
        };
        const rankColor = rankColors[gate.gate_rank] || '#666';
        
        const typeIcons: Record<string, string> = {
            'normal': '🌀',
            'raid': '🔴',
            'dungeon': '🏰',
            'boss': '💀',
            'instant': '⚡'
        };
        const icon = typeIcons[gate.gate_type] || '🌀';
        
        const timeSinceCreated = Math.floor((Date.now() - new Date(gate.created_at).getTime()) / 60000);
        
        return `
            <div style="background: linear-gradient(90deg, rgba(${parseInt(rankColor.slice(1,3), 16)}, ${parseInt(rankColor.slice(3,5), 16)}, ${parseInt(rankColor.slice(5,7), 16)}, 0.1), transparent); border-left: 3px solid ${rankColor}; padding: 8px 10px; border-radius: 4px; cursor: pointer; transition: all 0.2s; margin-bottom: 6px; ${isCurrentCity ? '' : 'opacity: 0.7;'}" 
                 onclick="cityMap.enterGate(${JSON.stringify(gate).replace(/"/g, '&quot;')})"
                 onmouseenter="this.style.background='linear-gradient(90deg, rgba(${parseInt(rankColor.slice(1,3), 16)}, ${parseInt(rankColor.slice(3,5), 16)}, ${parseInt(rankColor.slice(5,7), 16)}, 0.2), transparent)'; this.style.opacity='1'"
                 onmouseleave="this.style.background='linear-gradient(90deg, rgba(${parseInt(rankColor.slice(1,3), 16)}, ${parseInt(rankColor.slice(3,5), 16)}, ${parseInt(rankColor.slice(5,7), 16)}, 0.1), transparent)'; this.style.opacity='${isCurrentCity ? '1' : '0.7'}'">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 1.1rem;">${icon}</span>
                        <span style="font-weight: bold; color: ${rankColor}; font-size: 0.85rem;">Rang ${gate.gate_rank}</span>
                    </div>
                    <span style="font-size: 0.7rem; color: rgba(255,255,255,0.4);">Lv.${gate.level}</span>
                </div>
                <div style="font-size: 0.8rem; color: rgba(255,255,255,0.8); margin-bottom: 2px;">${gate.name}</div>
                <div style="font-size: 0.65rem; color: rgba(255,255,255,0.35);">
                    ${timeSinceCreated < 60 ? `${timeSinceCreated}min` : `${Math.floor(timeSinceCreated/60)}h ${timeSinceCreated%60}min`}
                </div>
            </div>
        `;
    }
    
    async enterGate(gate: Gate) {
        console.log('🌀 Entering gate:', gate);
        
        // Check if player is in the same city as the gate
        if (gate.city_id !== this.currentCityId) {
            alert(`⚠️ Dieses Gate ist nicht in deiner aktuellen Stadt!\n\nGate-Stadt: ${gate.city_name}\nDu musst zuerst in diese Stadt reisen.`);
            return;
        }
        
        // Confirm entry
        if (!confirm(`🌀 ${gate.name} betreten?\n\nRang: ${gate.gate_rank}\nLevel: ${gate.level}\nTyp: ${gate.gate_type}\n\nBereit für den Kampf?`)) {
            return;
        }
        
        console.log('✅ Starting gate combat with ID:', gate.id);
        
        // Start combat with gate ID (combat system loads from MySQL)
        this.startGateCombat(gate.id);
    }
    
    private startGateCombat(gateId: number) {
        console.log('🎮 startGateCombat called with gateId:', gateId);
        
        // Trigger combat panel switch with gate ID
        // Combat system will load gate data from API/MySQL
        const event = new CustomEvent('startGateCombat', { 
            detail: { gateId } 
        });
        
        console.log('📡 Dispatching startGateCombat event:', event.detail);
        window.dispatchEvent(event);
        
        console.log(`🎮 Event dispatched for gate ID: ${gateId}`);
    }
}

export const cityMap = new CityMap();
