/**
 * Gates UI Manager - Fixed Version
 * Verwaltet die Gate-Auswahl mit funktionierenden Filtern
 */
import { GateRank } from './combat/types.js';
export declare class GatesUIManager {
    private gates;
    private filteredGates;
    private currentFilter;
    private playerLevel;
    private playerRank;
    private completedGates;
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
     * Event-Listener für Filter
     */
    private setupEventListeners;
    /**
     * Setzt Filter für Gates
     */
    private setFilter;
    /**
     * Suche nach Gates
     */
    private searchGates;
    /**
     * Rendert die Gates im Grid
     */
    private renderGates;
    /**
     * Erstellt eine Gate-Karte mit animiertem Portal
     */
    private createGateCard;
    /**
     * Gibt Portal-Klasse basierend auf Rang zurück
     */
    private getPortalClass;
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
     * Markiert Gate als abgeschlossen
     */
    completeGate(gateId: string): void;
}
//# sourceMappingURL=gates-ui-fixed.d.ts.map