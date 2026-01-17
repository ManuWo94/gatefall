/**
 * Gates UI Manager
 * Verwaltet die Gate-Auswahl und Anzeige
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
     * Event-Listener für Filter-Buttons
     */
    private setupEventListeners;
    /**
     * Setzt Filter für Gates
     */
    private setFilter;
    /**
     * Rendert die Gates-Kacheln
     */
    private renderGates;
    /**
     * Erstellt eine Gate-Kachel
     */
    private createGateCard;
    /**
     * Gibt Rang-Icon zurück
     */
    private getRankIcon;
    /**
     * Generiert Schwierigkeits-Dots
     */
    private getDifficultyDots;
    /**
     * Betretet ein Gate
     */
    private enterGate;
    /**
     * Startet Combat für ein Gate
     */
    private startGateCombat;
    /**
     * Markiert ein Gate als abgeschlossen
     */
    completeGate(gateId: string): Promise<void>;
    /**
     * Aktualisiert Zähler
     */
    private updateCounters;
    /**
     * Startet den Reset-Timer (täglicher Reset)
     */
    private startResetTimer;
    /**
     * Setzt Gates zurück (täglicher Reset)
     */
    resetGates(): void;
}
//# sourceMappingURL=gates-ui.d.ts.map