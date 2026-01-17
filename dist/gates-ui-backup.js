/**
 * Gates UI Manager - Galactic Universe Style
 * Verwaltet die Gate-Auswahl im Universums-Grid
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
        this.currentGalaxy = 1;
        this.currentSystem = 1;
        this.gatesPerPage = 15; // 5x3 Grid
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
     * Event-Listener für Navigation und Filter
     */
    setupEventListeners() {
        // Galaxy Navigation
        const btnPrevGalaxy = document.getElementById('btn-prev-galaxy');
        const btnNextGalaxy = document.getElementById('btn-next-galaxy');
        const btnPrevSystem = document.getElementById('btn-prev-system');
        const btnNextSystem = document.getElementById('btn-next-system');
        btnPrevGalaxy?.addEventListener('click', () => this.changeGalaxy(-1));
        btnNextGalaxy?.addEventListener('click', () => this.changeGalaxy(1));
        btnPrevSystem?.addEventListener('click', () => this.changeSystem(-1));
        btnNextSystem?.addEventListener('click', () => this.changeSystem(1));
        // Filter Buttons
        const filterButtons = document.querySelectorAll('.filter-icon-btn');
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
        // Search Box
        const searchBox = document.getElementById('gate-search');
        searchBox?.addEventListener('input', (e) => {
            this.searchGates(e.target.value);
        });
    }
    /**
     * Wechselt Galaxie
     */
    changeGalaxy(delta) {
        const maxGalaxy = Math.ceil(this.gates.length / (this.gatesPerPage * 10));
        this.currentGalaxy = Math.max(1, Math.min(maxGalaxy, this.currentGalaxy + delta));
        this.currentSystem = 1;
        this.updateGalaxyDisplay();
        this.renderGates();
    }
    /**
     * Wechselt System
     */
    changeSystem(delta) {
        const maxSystem = 10;
        this.currentSystem = Math.max(1, Math.min(maxSystem, this.currentSystem + delta));
        this.updateGalaxyDisplay();
        this.renderGates();
    }
    /**
     * Aktualisiert Galaxie/System-Anzeige
     */
    updateGalaxyDisplay() {
        const galaxyEl = document.getElementById('current-galaxy');
        const systemEl = document.getElementById('current-system');
        const systemLabelEl = document.querySelector('.system-label');
        if (galaxyEl)
            galaxyEl.textContent = this.currentGalaxy.toString();
        if (systemEl)
            systemEl.textContent = this.currentSystem.toString();
        if (systemLabelEl)
            systemLabelEl.textContent = `SYSTEM ${this.currentGalaxy}.${this.currentSystem}`;
    }
    /**
     * Setzt Filter für Gates
     */
    setFilter(filter) {
        this.currentFilter = filter;
        switch (filter) {
            case 'all':
                this.filteredGates = [...this.gates];
                break;
            case 'owned':
                this.filteredGates = this.gates.filter(gate => this.completedGates.has(gate.id));
                break;
            case 'unowned':
                this.filteredGates = this.gates.filter(gate => !this.completedGates.has(gate.id));
                break;
            case 'active':
                // Für zukünftige Implementierung
                this.filteredGates = [...this.gates];
                break;
            default:
                this.filteredGates = [...this.gates];
        }
        this.renderGates();
    }
    /**
     * Suche nach Gates
     */
    searchGates(query) {
        if (!query.trim()) {
            this.filteredGates = [...this.gates];
        }
        else {
            const lowerQuery = query.toLowerCase();
            this.filteredGates = this.gates.filter(gate => gate.name.toLowerCase().includes(lowerQuery) ||
                gate.boss.name.toLowerCase().includes(lowerQuery));
        }
        this.renderGates();
    }
    /**
     * Rendert die Gates im 5x3 Grid
     */
    renderGates() {
        const gridEl = document.getElementById('gates-grid');
        if (!gridEl)
            return;
        gridEl.innerHTML = '';
        // Berechne aktuelle Seite basierend auf Galaxy/System
        const startIndex = ((this.currentGalaxy - 1) * 10 + (this.currentSystem - 1)) * this.gatesPerPage;
        const endIndex = startIndex + this.gatesPerPage;
        const pageGates = this.filteredGates.slice(startIndex, endIndex);
        // Fülle Grid mit 15 Slots (5x3)
        for (let i = 0; i < this.gatesPerPage; i++) {
            const gate = pageGates[i];
            const card = gate ? this.createGatePlanetCard(gate) : this.createEmptySlot(i);
            gridEl.appendChild(card);
        }
        this.updateCounters();
    }
    /**
     * Erstellt eine Gate-Planetenkarte im Galactic Style
     */
    createGatePlanetCard(gate) {
        const card = document.createElement('div');
        card.className = 'gate-planet-card';
        if (this.completedGates.has(gate.id)) {
            card.classList.add('completed');
        }
        const planetIcon = this.getPlanetIcon(gate.rank);
        card.innerHTML = `
            <div class="gate-info-btn" title="Gate Information">ℹ</div>
            <div class="gate-rank-badge rank-${gate.rank.toLowerCase()}">${gate.rank}</div>
            <div class="gate-planet-icon">${planetIcon}</div>
            <div class="gate-planet-name">${gate.name}</div>
            <div class="gate-owner-badge">
                <span>👑</span>
                <span>${gate.boss.name}</span>
            </div>
        `;
        // Click Event
        card.addEventListener('click', () => this.enterGate(gate));
        // Info Button Event (verhindert Propagation)
        const infoBtn = card.querySelector('.gate-info-btn');
        infoBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showGateInfo(gate);
        });
        return card;
    }
    /**
     * Erstellt einen leeren Slot
     */
    createEmptySlot(index) {
        const card = document.createElement('div');
        card.className = 'gate-planet-card empty-slot';
        card.innerHTML = `
            <div class="gate-planet-icon">⭕</div>
            <div class="gate-planet-name">Empty Slot ${index + 1}</div>
        `;
        return card;
    }
    /**
     * Gibt Planeten-Icon basierend auf Rang zurück
     */
    getPlanetIcon(rank) {
        const planetIcons = {
            'D': '🟤', // Brauner Planet
            'C': '🔵', // Blauer Planet
            'B': '🟢', // Grüner Planet
            'A': '🟡', // Gelber Planet/Stern
            'S': '🔴', // Roter Riese
            'SS': '⚫' // Schwarzes Loch
        };
        return planetIcons[rank];
    }
    /**
     * Zeigt Gate-Informationen
     */
    showGateInfo(gate) {
        alert(`GATE: ${gate.name}\n\nRang: ${gate.rank}\nBoss: ${gate.boss.name}\nGegner: ${gate.enemies.length}\nSchwierigkeit: ${gate.difficulty}/10\n\nKlicke auf den Planeten um das Gate zu betreten!`);
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
            const combatNavBtn = document.querySelector('.nav-item[data-panel="combat"]');
            if (combatNavBtn) {
                combatNavBtn.click();
            }
            // Markiere Gate als begonnen
            console.log(`Gate "${gate.name}" wurde betreten!`);
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
//# sourceMappingURL=gates-ui-backup.js.map