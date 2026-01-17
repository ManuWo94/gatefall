/**
 * Gates UI Manager - Galactic Universe Style
 * Verwaltet die Gate-Auswahl im Universums-Grid
 */
import { GateRank } from './combat/types.js';
export declare class GatesUIManager {
    private gates;
    private filteredGates;
    private currentFilter;
    private playerLevel;
    private playerRank;
    private completedGates;
    private currentGalaxy;
    private currentSystem;
    private gatesPerPage;
    constructor();
    /**
     * Initialisiert das Gates-System
     */
    init(playerLevel: number, playerRank: GateRank): Promise<void>;
    /**
     * Lädt abgeschlossene Gates vom Server
     */
    private loadCompletedGates;
    /**
     * Speichert abgeschlossenes Gate auf Server
     */
    private saveCompletedGate;
    /**
     * Event-Listener für Navigation und Filter
     */
    private setupEventListeners;
    /**
     * Wechselt Galaxie
     */
    private changeGalaxy;
    /**
     * Wechselt System
     */
    private changeSystem;
    /**
     * Aktualisiert Galaxie/System-Anzeige
     */
    private updateGalaxyDisplay;
    /**
     * Setzt Filter für Gates
     */
    private setFilter;
    /**
     * Suche nach Gates
     */
    private searchGates;
    /**
     * Rendert die Gates im 5x3 Grid
     */
    private renderGates;
    /**
     * Erstellt eine Gate-Planetenkarte im Galactic Style
     */
    private createGatePlanetCard;
    /**
     * Erstellt einen leeren Slot
     */
    private createEmptySlot;
    /**
     * Gibt Planeten-Icon basierend auf Rang zurück
     */
    private getPlanetIcon;
    /**
     * Zeigt Gate-Informationen
     */
    private showGateInfo;
    /**
     * Aktualisiert Counter-Anzeigen
     */
    private updateCounters;
    /**
     * Betretet ein Gate
     */
    private enterGate;
    /**
     * Startet Combat für ein Gate
     */
    private startGateCombat;
    /**
     * Markiert Gate als abgeschlossen
     */
    completeGate(gateId: string): void;
}
//# sourceMappingURL=gates-ui-backup.d.ts.map