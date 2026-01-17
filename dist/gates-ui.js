/**
 * Gates UI Manager
 * Verwaltet die Gate-Auswahl und Anzeige
 */
import { GateGenerator } from './combat/gates.js';
export class GatesUIManager {
    constructor() {
        this.gates = [];
        this.filteredGates = [];
        this.currentFilter = 'all';
        this.playerLevel = 1;
        this.playerRank = 'D';
        this.completedGates = new Set();
        this.setupEventListeners();
    }
    /**
     * Initialisiert das Gates-System
     */
    async init(playerLevel, playerRank) {
        this.playerLevel = playerLevel;
        this.playerRank = playerRank;
        // Generiere Gates-Pool (60 Gates)
        this.gates = GateGenerator.generateGatePool(playerLevel, playerRank);
        this.filteredGates = [...this.gates];
        // Lade abgeschlossene Gates vom Server
        await this.loadCompletedGates();
        this.renderGates();
        this.updateCounters();
        this.startResetTimer();
    }
    /**
     * Lädt abgeschlossene Gates vom Server
     */
    async loadCompletedGates() {
        try {
            const response = await fetch('/api/gates', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                this.completedGates = new Set(data.completedGateIds || []);
            }
        }
        catch (error) {
            console.error('Fehler beim Laden der abgeschlossenen Gates:', error);
        }
    }
    /**
     * Speichert abgeschlossenes Gate auf Server
     */
    async saveCompletedGate(gateId) {
        try {
            const response = await fetch('/api/gates/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ gateId })
            });
            if (!response.ok) {
                console.error('Fehler beim Speichern des Gates');
            }
        }
        catch (error) {
            console.error('Fehler beim Speichern des Gates:', error);
        }
    }
    /**
     * Event-Listener für Filter-Buttons
     */
    setupEventListeners() {
        // Filter Buttons
        const filterButtons = document.querySelectorAll('.gate-filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                if (filter) {
                    this.setFilter(filter);
                    // Update active state
                    filterButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                }
            });
        });
    }
    /**
     * Setzt Filter für Gates
     */
    setFilter(filter) {
        this.currentFilter = filter;
        if (filter === 'all') {
            this.filteredGates = [...this.gates];
        }
        else {
            this.filteredGates = this.gates.filter(gate => gate.rank === filter);
        }
        this.renderGates();
    }
    /**
     * Rendert die Gates-Kacheln
     */
    renderGates() {
        const gridEl = document.getElementById('gates-grid');
        if (!gridEl)
            return;
        gridEl.innerHTML = '';
        this.filteredGates.forEach(gate => {
            const gateCard = this.createGateCard(gate);
            gridEl.appendChild(gateCard);
        });
    }
    /**
     * Erstellt eine Gate-Kachel
     */
    createGateCard(gate) {
        const card = document.createElement('div');
        card.className = 'gate-card';
        if (this.completedGates.has(gate.id)) {
            card.classList.add('completed');
        }
        const isCompleted = this.completedGates.has(gate.id);
        const rankIcon = this.getRankIcon(gate.rank);
        const difficultyDots = this.getDifficultyDots(gate.difficulty);
        card.innerHTML = `
            <div class="gate-card-header">
                <div class="gate-rank-badge rank-${gate.rank.toLowerCase()}">
                    ${rankIcon} ${gate.rank}-RANG
                </div>
                <div class="gate-difficulty">
                    ${difficultyDots}
                </div>
            </div>
            
            <div class="gate-card-name">${gate.name}</div>
            
            <div class="gate-card-info">
                <div class="gate-info-row">
                    <span>👹 Gegner:</span>
                    <span>${gate.enemies.length}</span>
                </div>
                <div class="gate-info-row">
                    <span>⚔️ Schwierigkeit:</span>
                    <span>${gate.difficulty}/10</span>
                </div>
            </div>
            
            <div class="gate-boss-name">
                👑 Boss: ${gate.boss.name}
            </div>
            
            <div class="gate-card-footer">
                ${isCompleted ?
            '<div class="gate-completed-badge">✓ ABGESCHLOSSEN</div>' :
            '<button class="gate-enter-btn" data-gate-id="' + gate.id + '">BETRETEN →</button>'}
            </div>
        `;
        // Event-Listener für Enter-Button
        const enterBtn = card.querySelector('.gate-enter-btn');
        if (enterBtn) {
            enterBtn.addEventListener('click', () => this.enterGate(gate));
        }
        return card;
    }
    /**
     * Gibt Rang-Icon zurück
     */
    getRankIcon(rank) {
        const icons = {
            'D': '🟤',
            'C': '🔵',
            'B': '🟢',
            'A': '🟡',
            'S': '🔴',
            'SS': '⚫'
        };
        return icons[rank];
    }
    /**
     * Generiert Schwierigkeits-Dots
     */
    getDifficultyDots(difficulty) {
        let html = '';
        for (let i = 1; i <= 10; i++) {
            const active = i <= difficulty ? 'active' : '';
            html += `<div class="difficulty-dot ${active}"></div>`;
        }
        return html;
    }
    /**
     * Betretet ein Gate
     */
    enterGate(gate) {
        console.log('Entering gate:', gate);
        // TODO: Implementiere Party-Selection-Modal
        // Für jetzt: Direkt zum Combat wechseln
        this.startGateCombat(gate);
    }
    /**
     * Startet Combat für ein Gate
     */
    startGateCombat(gate) {
        // Erstelle Dungeon-Objekt aus Gate
        const dungeon = {
            name: gate.name,
            enemies: gate.enemies,
            gateRank: gate.rank
        };
        // Starte Combat mit Gate
        const engine = window.engine;
        if (engine) {
            engine.startDungeon(dungeon);
            // Wechsle zum Combat-Panel
            const combatNav = document.querySelector('[data-panel="combat"]');
            if (combatNav) {
                combatNav.click();
            }
        }
    }
    /**
     * Markiert ein Gate als abgeschlossen
     */
    async completeGate(gateId) {
        this.completedGates.add(gateId);
        await this.saveCompletedGate(gateId);
        this.renderGates();
        this.updateCounters();
    }
    /**
     * Aktualisiert Zähler
     */
    updateCounters() {
        const totalCompleted = this.completedGates.size;
        const totalGates = this.gates.length;
        const countEl = document.getElementById('gates-count');
        if (countEl) {
            countEl.textContent = `${totalCompleted}/${totalGates} Gates`;
        }
        // Update Filter-Counts
        const rankCounts = {
            'D': 0, 'C': 0, 'B': 0, 'A': 0, 'S': 0, 'SS': 0
        };
        this.gates.forEach(gate => {
            if (!this.completedGates.has(gate.id)) {
                rankCounts[gate.rank]++;
            }
        });
        Object.entries(rankCounts).forEach(([rank, count]) => {
            const countEl = document.getElementById(`filter-count-${rank.toLowerCase()}`);
            if (countEl) {
                countEl.textContent = count.toString();
            }
        });
        const allCountEl = document.getElementById('filter-count-all');
        if (allCountEl) {
            allCountEl.textContent = (totalGates - totalCompleted).toString();
        }
    }
    /**
     * Startet den Reset-Timer (täglicher Reset)
     */
    startResetTimer() {
        const updateTimer = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            const diff = tomorrow.getTime() - now.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            const timerEl = document.getElementById('gates-reset-timer');
            if (timerEl) {
                timerEl.textContent = `Reset in: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        };
        updateTimer();
        setInterval(updateTimer, 1000);
    }
    /**
     * Setzt Gates zurück (täglicher Reset)
     */
    resetGates() {
        this.completedGates.clear();
        this.gates = GateGenerator.generateGatePool(this.playerLevel, this.playerRank);
        this.filteredGates = [...this.gates];
        this.renderGates();
        this.updateCounters();
    }
}
//# sourceMappingURL=gates-ui.js.map