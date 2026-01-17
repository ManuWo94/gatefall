/**
 * Gates UI Manager - Fixed Version
 * Verwaltet die Gate-Auswahl mit funktionierenden Filtern
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
        // Event Listener werden nach DOM-Load gesetzt
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
        this.setupEventListeners();
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
     * Event-Listener für Filter
     */
    setupEventListeners() {
        console.log('Setting up event listeners for gates UI');
        // Filter Buttons
        const filterButtons = document.querySelectorAll('.filter-icon-btn');
        console.log('Found filter buttons:', filterButtons.length);
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = btn.getAttribute('data-filter');
                console.log('Filter clicked:', filter);
                if (filter) {
                    this.setFilter(filter);
                    // Update active state
                    filterButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                }
            });
        });
        // Search Box
        const searchBox = document.getElementById('gate-search');
        searchBox?.addEventListener('input', (e) => {
            this.searchGates(e.target.value);
        });
    }
    /**
     * Setzt Filter für Gates
     */
    setFilter(filter) {
        console.log('Setting filter to:', filter);
        this.currentFilter = filter;
        if (filter === 'all') {
            this.filteredGates = [...this.gates];
        }
        else {
            // Rang-Filter (D, C, B, A, S, SS)
            this.filteredGates = this.gates.filter(gate => gate.rank === filter);
        }
        console.log('Filtered gates:', this.filteredGates.length);
        this.renderGates();
        this.updateCounters();
    }
    /**
     * Suche nach Gates
     */
    searchGates(query) {
        if (!query.trim()) {
            this.setFilter(this.currentFilter);
            return;
        }
        const lowerQuery = query.toLowerCase();
        this.filteredGates = this.gates.filter(gate => gate.name.toLowerCase().includes(lowerQuery) ||
            gate.boss.name.toLowerCase().includes(lowerQuery));
        this.renderGates();
        this.updateCounters();
    }
    /**
     * Rendert die Gates im Grid
     */
    renderGates() {
        const gridEl = document.getElementById('gates-grid');
        if (!gridEl) {
            console.error('Gates grid element not found!');
            return;
        }
        gridEl.innerHTML = '';
        // Zeige alle gefilterten Gates
        this.filteredGates.forEach(gate => {
            const card = this.createGateCard(gate);
            gridEl.appendChild(card);
        });
        console.log('Rendered gates:', this.filteredGates.length);
    }
    /**
     * Erstellt eine Gate-Karte mit animiertem Portal
     */
    createGateCard(gate) {
        const card = document.createElement('div');
        card.className = 'gate-portal-card';
        if (this.completedGates.has(gate.id)) {
            card.classList.add('completed');
        }
        const portalClass = this.getPortalClass(gate.rank);
        card.innerHTML = `
            <div class="gate-info-btn" title="Gate Information">ℹ</div>
            <div class="gate-rank-badge rank-${gate.rank.toLowerCase()}">${gate.rank}</div>
            
            <div class="portal-container">
                <div class="portal ${portalClass}">
                    <div class="portal-ring ring-1"></div>
                    <div class="portal-ring ring-2"></div>
                    <div class="portal-ring ring-3"></div>
                    <div class="portal-core"></div>
                </div>
            </div>
            
            <div class="gate-name">${gate.name}</div>
            <div class="gate-boss-label">
                <span>👑 ${gate.boss.name}</span>
            </div>
        `;
        // Click Event
        card.addEventListener('click', () => this.enterGate(gate));
        // Info Button Event
        const infoBtn = card.querySelector('.gate-info-btn');
        infoBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showGateInfo(gate);
        });
        return card;
    }
    /**
     * Gibt Portal-Klasse basierend auf Rang zurück
     */
    getPortalClass(rank) {
        const portalClasses = {
            'D': 'portal-blue', // Hellblau (Bild 1)
            'C': 'portal-cyan', // Cyan
            'B': 'portal-purple', // Lila (Bild 2)
            'A': 'portal-red', // Rot (Bild 4)
            'S': 'portal-dark', // Dunkelblau (Bild 3)
            'SS': 'portal-black' // Schwarz
        };
        return portalClasses[rank];
    }
    /**
     * Zeigt Gate-Informationen
     */
    showGateInfo(gate) {
        const bossInfo = `\n👑 BOSS: ${gate.boss.name}\n⚔️ Gegner: ${gate.enemies.length}\n📊 Schwierigkeit: ${gate.difficulty}/10`;
        alert(`🚪 GATE: ${gate.name}\n\n🏆 Rang: ${gate.rank}${bossInfo}\n\n➡️ Klicke auf das Portal um einzutreten!`);
    }
    /**
     * Aktualisiert Counter-Anzeigen
     */
    updateCounters() {
        const showingCountEl = document.getElementById('showing-count');
        const totalCountEl = document.getElementById('total-count');
        if (showingCountEl) {
            showingCountEl.textContent = this.filteredGates.length.toString();
        }
        if (totalCountEl) {
            totalCountEl.textContent = this.gates.length.toString();
        }
    }
    /**
     * Betretet ein Gate
     */
    enterGate(gate) {
        console.log('Entering gate:', gate.name);
        // Erstelle Dungeon-Objekt
        const dungeon = {
            name: gate.name,
            enemies: gate.enemies,
            gateRank: gate.rank
        };
        // Starte Combat
        const engine = window.engine;
        if (engine) {
            console.log('Starting dungeon combat...');
            engine.startDungeon(dungeon);
            // Wechsle zum Combat-Panel
            const combatNavBtn = document.querySelector('.nav-item[data-panel="combat"]');
            if (combatNavBtn) {
                combatNavBtn.click();
            }
            console.log(`Gate "${gate.name}" betreten!`);
        }
        else {
            console.error('Combat engine not found!');
        }
    }
    /**
     * Markiert Gate als abgeschlossen
     */
    completeGate(gateId) {
        this.completedGates.add(gateId);
        this.saveCompletedGate(gateId);
        this.renderGates();
        this.updateCounters();
    }
}
//# sourceMappingURL=gates-ui-fixed.js.map