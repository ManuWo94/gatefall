/**
 * TELEGRAPH SYSTEM
 * Generiert und formatiert Telegraph-Nachrichten
 */
import { TelegraphType, ThreatLevel } from './combat-types.js';
export class TelegraphSystem {
    /**
     * Erstellt einen Telegraph für eine vorbereitete Aktion
     */
    static createTelegraph(action, sourceId, targetId) {
        const actionId = `telegraph_${Date.now()}_${Math.random()}`;
        return {
            type: action.telegraphType || TelegraphType.SCHWERER_SCHLAG,
            threatLevel: action.threatLevel || ThreatLevel.HOCH,
            preparationTicks: action.preparationTicks,
            remainingTicks: action.preparationTicks,
            sourceId,
            targetId,
            actionId
        };
    }
    /**
     * Formatiert Telegraph-Nachricht für Combat-Log
     */
    static formatTelegraph(telegraph, sourceName) {
        const typeMessages = {
            [TelegraphType.SCHWERER_SCHLAG]: `${sourceName} bereitet einen schweren Schlag vor`,
            [TelegraphType.MAGISCHE_KANALISIERUNG]: `${sourceName} kanalisiert magische Energie`,
            [TelegraphType.PROJEKTILANGRIFF]: `${sourceName} zielt mit einem Projektil`,
            [TelegraphType.FLAECHENANGRIFF]: `${sourceName} bereitet einen Flächenangriff vor`,
            [TelegraphType.EXEKUTION]: `${sourceName} bereitet eine Exekution vor`,
            [TelegraphType.RITUAL]: `${sourceName} beginnt ein dunkles Ritual`
        };
        const message = typeMessages[telegraph.type] || `${sourceName} bereitet etwas vor`;
        // Tick-Info hinzufügen
        const tickInfo = telegraph.remainingTicks > 1
            ? ` (${telegraph.remainingTicks} Ticks)`
            : ' (nächster Tick!)';
        return message + tickInfo;
    }
    /**
     * System-Nachricht für Bedrohungslevel
     */
    static formatThreatWarning(threatLevel) {
        const warnings = {
            [ThreatLevel.GERING]: '⚠️ SYSTEM: Schwache Aktion erkannt',
            [ThreatLevel.HOCH]: '⚠️ SYSTEM: Gefährliche Aktion erkannt',
            [ThreatLevel.TOEDLICH]: '🔴 SYSTEM: Tödliche Aktion erkannt',
            [ThreatLevel.KATASTROPHAL]: '🔴🔴 SYSTEM: KATASTROPHALE BEDROHUNG ERKANNT'
        };
        return warnings[threatLevel];
    }
    /**
     * Prüft ob ein Telegraph kritisch ist (sollte in UI hervorgehoben werden)
     */
    static isCritical(telegraph) {
        return telegraph.threatLevel === ThreatLevel.TOEDLICH ||
            telegraph.threatLevel === ThreatLevel.KATASTROPHAL ||
            telegraph.remainingTicks === 1;
    }
    /**
     * UI-Farbe für Threat-Level
     */
    static getThreatColor(threatLevel) {
        const colors = {
            [ThreatLevel.GERING]: '#4a9eff',
            [ThreatLevel.HOCH]: '#ff9f4a',
            [ThreatLevel.TOEDLICH]: '#ff4a4a',
            [ThreatLevel.KATASTROPHAL]: '#ff00ff'
        };
        return colors[threatLevel];
    }
    /**
     * Vorschläge für Reaktionen basierend auf Telegraph
     */
    static suggestReactions(telegraph, action) {
        const suggestions = [];
        // Basierend auf Tags
        if (action.tags.includes(ActionTag.KANALISIERUNG)) {
            suggestions.push('Unterbrechen empfohlen');
        }
        if (action.tags.includes(ActionTag.SCHLAG)) {
            suggestions.push('Block möglich');
        }
        if (action.tags.includes(ActionTag.PROJEKTIL)) {
            suggestions.push('Ausweichen empfohlen');
        }
        if (action.tags.includes(ActionTag.FLAECHE)) {
            suggestions.push('Block oder Schild nutzen');
        }
        // Basierend auf Threat-Level
        if (telegraph.threatLevel === ThreatLevel.TOEDLICH ||
            telegraph.threatLevel === ThreatLevel.KATASTROPHAL) {
            suggestions.unshift('DEFENSIVE AKTION ERFORDERLICH');
        }
        return suggestions;
    }
}
import { ActionTag } from './combat-types.js';
//# sourceMappingURL=telegraph.js.map