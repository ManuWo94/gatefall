/**
 * Gates UI Manager - Fixed Version
 * Verwaltet die Gate-Auswahl mit funktionierenden Filtern
 */

import { GateGenerator, Gate } from './combat/gates.js';
import { GateRank } from './combat/types.js';

export class GatesUIManager {
    private gates: Gate[] = [];
    private filteredGates: Gate[] = [];
    private currentFilter: string = 'all';
    private playerLevel: number = 1;
    private playerRank: GateRank = 'D';
    private completedGates: Set<string> = new Set();

    constructor() {
        // Event Listener werden nach DOM-Load gesetzt
    }

    /**
     * Initialisiert das Gates-System
     */
    public async init(playerLevel: number, playerRank: GateRank): Promise<void> {
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
    private async loadCompletedGates(): Promise<void> {
        try {
            const response = await fetch('/api/gates', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                this.completedGates = new Set(data.completedGateIds || []);
            }
        } catch (error) {
            console.error('Fehler beim Laden der abgeschlossenen Gates:', error);
        }
    }

    /**
     * Speichert abgeschlossenes Gate auf Server
     */
    private async saveCompletedGate(gateId: string): Promise<void> {
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
        } catch (error) {
            console.error('Fehler beim Speichern des Gates:', error);
        }
    }

    /**
     * Event-Listener für Filter
     */
    private setupEventListeners(): void {
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
        const searchBox = document.getElementById('gate-search') as HTMLInputElement;
        searchBox?.addEventListener('input', (e) => {
            this.searchGates((e.target as HTMLInputElement).value);
        });
    }

    /**
     * Setzt Filter für Gates
     */
    private setFilter(filter: string): void {
        console.log('Setting filter to:', filter);
        this.currentFilter = filter;
        
        if (filter === 'all') {
            this.filteredGates = [...this.gates];
        } else {
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
    private searchGates(query: string): void {
        if (!query.trim()) {
            this.setFilter(this.currentFilter);
            return;
        }
        
        const lowerQuery = query.toLowerCase();
        this.filteredGates = this.gates.filter(gate => 
            gate.name.toLowerCase().includes(lowerQuery) ||
            gate.boss.name.toLowerCase().includes(lowerQuery)
        );
        
        this.renderGates();
        this.updateCounters();
    }

    /**
     * Rendert die Gates im Grid
     */
    private renderGates(): void {
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
    private createGateCard(gate: Gate): HTMLElement {
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
    private getPortalClass(rank: GateRank): string {
        const portalClasses: Record<GateRank, string> = {
            'D': 'portal-blue',      // Hellblau (Bild 1)
            'C': 'portal-cyan',      // Cyan
            'B': 'portal-purple',    // Lila (Bild 2)
            'A': 'portal-red',       // Rot (Bild 4)
            'S': 'portal-dark',      // Dunkelblau (Bild 3)
            'SS': 'portal-black'     // Schwarz
        };
        return portalClasses[rank];
    }

    /**
     * Zeigt Gate-Informationen
     */
    private showGateInfo(gate: Gate): void {
        const bossInfo = `\n👑 BOSS: ${gate.boss.name}\n⚔️ Gegner: ${gate.enemies.length}\n📊 Schwierigkeit: ${gate.difficulty}/10`;
        alert(`🚪 GATE: ${gate.name}\n\n🏆 Rang: ${gate.rank}${bossInfo}\n\n➡️ Klicke auf das Portal um einzutreten!`);
    }

    /**
     * Aktualisiert Counter-Anzeigen
     */
    private updateCounters(): void {
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
    private enterGate(gate: Gate): void {
        console.log('Entering gate:', gate.name);
        
        // Starte das NEUE Combat-System
        import('./combat/combat-init.js').then(({ combatSystem }) => {
            const gameState = (window as any).gameState;
            const mainApp = (window as any).mainApp;
            
            // Trupp-Mitglieder abrufen
            const squadMembers = mainApp?.currentSquad || [];
            
            // Combat starten
            combatSystem.startCombat({
                playerLevel: gameState?.level || 1,
                playerRole: gameState?.role || 'waechter',
                playerHunterRank: gameState?.hunterRank || 'E',
                enemies: gate.enemies.map((e: any) => ({
                    name: e.name,
                    level: e.level,
                    isBoss: e.isBoss || false
                })),
                squadMembers: squadMembers.map((s: any) => ({
                    name: s.name,
                    level: s.level || 1,
                    role: s.role || 'jaeger'
                }))
            });
            
            // Wechsle zum Combat-Panel
            const combatNavBtn = document.querySelector('.nav-item[data-panel="combat"]') as HTMLElement;
            if (combatNavBtn) {
                combatNavBtn.click();
            }
            
            console.log(`Gate "${gate.name}" betreten - Neues Combat-System gestartet!`);
        }).catch(error => {
            console.error('Failed to start combat:', error);
        });
    }

    /**
     * Markiert Gate als abgeschlossen
     */
    public completeGate(gateId: string): void {
        this.completedGates.add(gateId);
        this.saveCompletedGate(gateId);
        this.renderGates();
        this.updateCounters();
    }
}
