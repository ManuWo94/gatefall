/**
 * TELEGRAPH SYSTEM
 * Generiert und formatiert Telegraph-Nachrichten
 */
import { Telegraph, ThreatLevel, CombatAction } from './combat-types.js';
export declare class TelegraphSystem {
    /**
     * Erstellt einen Telegraph für eine vorbereitete Aktion
     */
    static createTelegraph(action: CombatAction, sourceId: string, targetId: string): Telegraph;
    /**
     * Formatiert Telegraph-Nachricht für Combat-Log
     */
    static formatTelegraph(telegraph: Telegraph, sourceName: string): string;
    /**
     * System-Nachricht für Bedrohungslevel
     */
    static formatThreatWarning(threatLevel: ThreatLevel): string;
    /**
     * Prüft ob ein Telegraph kritisch ist (sollte in UI hervorgehoben werden)
     */
    static isCritical(telegraph: Telegraph): boolean;
    /**
     * UI-Farbe für Threat-Level
     */
    static getThreatColor(threatLevel: ThreatLevel): string;
    /**
     * Vorschläge für Reaktionen basierend auf Telegraph
     */
    static suggestReactions(telegraph: Telegraph, action: CombatAction): string[];
}
//# sourceMappingURL=telegraph.d.ts.map