/**
 * Skill System UI Helper
 * Zeigt Skill-Phase und verfügbare Skills an
 */

import { SKILL_SYSTEM_CONSTANTS } from './combat/types.js';

export class SkillSystemUI {
    /**
     * Aktualisiert die Skill-Phase-Info-Box
     */
    static updatePhaseInfo(level: number, awakeningState: 'locked' | 'available' | 'in_progress' | 'completed'): void {
        const isAwakened = awakeningState === 'completed';
        const titleEl = document.getElementById('skill-phase-title');
        const descEl = document.getElementById('skill-phase-description');
        const infoBox = document.getElementById('skill-system-info');
        
        if (!titleEl || !descEl || !infoBox) return;
        
        if (isAwakened) {
            // Phase 2: Nach Erwachen
            titleEl.textContent = '⭐ PHASE 2: HUNTER-STATUS';
            descEl.innerHTML = `
                <strong style="color: #00ff88;">✓ Alle Skills verfügbar!</strong><br>
                Eigene Rollen-Skills: 100% Effektivität<br>
                Fremde Skills: -30% Effekt, +20% Kosten, +15% Cooldown
            `;
            infoBox.style.background = 'rgba(0,255,136,0.1)';
            infoBox.style.borderColor = 'rgba(0,255,136,0.3)';
        } else {
            // Phase 1: Vor Erwachen
            const remaining = SKILL_SYSTEM_CONSTANTS.PRE_AWAKENING_LEVEL - level;
            titleEl.textContent = '🔒 PHASE 1: VOR DEM ERWACHEN';
            descEl.innerHTML = `
                Nur <strong>rollenspezifische Skills</strong> verfügbar.<br>
                ${remaining > 0 
                    ? `Noch <strong>${remaining} Level</strong> bis zum Erwachen (Level ${SKILL_SYSTEM_CONSTANTS.PRE_AWAKENING_LEVEL})`
                    : `Erwache jetzt um alle Skills freizuschalten!`
                }
            `;
            infoBox.style.background = 'rgba(255,152,0,0.1)';
            infoBox.style.borderColor = 'rgba(255,152,0,0.3)';
        }
    }
    
    /**
     * Fügt visuelle Indikatoren zu Skill-Karten hinzu
     */
    static addSkillIndicators(
        skillElement: HTMLElement,
        isOwnRole: boolean,
        isAwakened: boolean,
        requiresAwakening: boolean
    ): void {
        // Entferne alte Badges
        const oldBadges = skillElement.querySelectorAll('.skill-badge');
        oldBadges.forEach(b => b.remove());
        
        const badgeContainer = document.createElement('div');
        badgeContainer.className = 'skill-badges';
        badgeContainer.style.cssText = 'display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px;';
        
        if (!isAwakened && requiresAwakening) {
            // Gesperrt bis Erwachen
            const badge = this.createBadge('🔒 ERWACHEN', '#ff4444');
            badgeContainer.appendChild(badge);
        } else if (isAwakened && !isOwnRole) {
            // Fremde Rolle - Malus aktiv
            const badge = this.createBadge('⚠️ MALUS', '#ff9500');
            badgeContainer.appendChild(badge);
            
            // Tooltip mit Details
            badge.title = `Fremde Rolle:\n-30% Effekt\n+20% Kosten\n+15% Cooldown`;
        } else if (isOwnRole) {
            // Eigene Rolle - Optimal
            const badge = this.createBadge('✓ OPTIMAL', '#00ff88');
            badgeContainer.appendChild(badge);
        }
        
        skillElement.appendChild(badgeContainer);
    }
    
    /**
     * Erstellt ein Badge-Element
     */
    private static createBadge(text: string, color: string): HTMLElement {
        const badge = document.createElement('span');
        badge.className = 'skill-badge';
        badge.textContent = text;
        badge.style.cssText = `
            display: inline-block;
            padding: 2px 6px;
            font-size: 0.7rem;
            font-weight: bold;
            background: ${color}22;
            color: ${color};
            border: 1px solid ${color}44;
            border-radius: 4px;
        `;
        return badge;
    }
    
    /**
     * Formatiert Skill-Kosten mit Malus-Anzeige
     */
    static formatSkillCost(
        baseCost: number,
        costMultiplier: number,
        costType: 'Mana' | 'Stamina'
    ): string {
        const actualCost = Math.ceil(baseCost * costMultiplier);
        const hasMalus = costMultiplier > 1.0;
        
        if (hasMalus) {
            const increase = Math.round((costMultiplier - 1.0) * 100);
            return `${actualCost} ${costType} <span style="color: #ff9500;">(+${increase}%)</span>`;
        }
        
        return `${actualCost} ${costType}`;
    }
    
    /**
     * Formatiert Skill-Effekt mit Malus-Anzeige
     */
    static formatSkillEffect(
        baseValue: number,
        effectMultiplier: number,
        effectType: 'Schaden' | 'Heilung'
    ): string {
        const actualValue = Math.floor(baseValue * effectMultiplier);
        const hasMalus = effectMultiplier < 1.0;
        
        if (hasMalus) {
            const reduction = Math.round((1.0 - effectMultiplier) * 100);
            return `${actualValue} ${effectType} <span style="color: #ff4444;">(-${reduction}%)</span>`;
        }
        
        return `${actualValue} ${effectType}`;
    }
    
    /**
     * Erstellt eine Skill-Karte mit allen Informationen
     */
    static createSkillCard(
        skill: any,
        isOwnRole: boolean,
        isAwakened: boolean,
        effectiveness: any
    ): HTMLElement {
        const card = document.createElement('div');
        card.className = 'skill-card';
        
        // Style basierend auf Verfügbarkeit
        let borderColor = '#00d4ff';
        if (!isAwakened && skill.requiresAwakening) {
            borderColor = '#666';
            card.style.opacity = '0.5';
        } else if (isAwakened && !isOwnRole) {
            borderColor = '#ff9500';
        } else if (isOwnRole) {
            borderColor = '#00ff88';
        }
        
        card.style.cssText = `
            padding: 1rem;
            background: rgba(0,0,0,0.3);
            border: 2px solid ${borderColor};
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        `;
        
        // Skill-Name und Beschreibung
        const name = document.createElement('div');
        name.textContent = skill.name;
        name.style.cssText = 'font-weight: bold; margin-bottom: 0.5rem; color: ' + borderColor;
        card.appendChild(name);
        
        const desc = document.createElement('div');
        desc.textContent = skill.description || '';
        desc.style.cssText = 'font-size: 0.9rem; opacity: 0.8; margin-bottom: 0.5rem;';
        card.appendChild(desc);
        
        // Stats
        const stats = document.createElement('div');
        stats.style.cssText = 'font-size: 0.85rem; line-height: 1.6;';
        
        if (skill.baseDamage) {
            const dmg = this.formatSkillEffect(skill.baseDamage, effectiveness.effectMultiplier, 'Schaden');
            stats.innerHTML += `⚔️ ${dmg}<br>`;
        }
        
        if (skill.baseHealing) {
            const heal = this.formatSkillEffect(skill.baseHealing, effectiveness.effectMultiplier, 'Heilung');
            stats.innerHTML += `💚 ${heal}<br>`;
        }
        
        if (skill.baseManaCost) {
            const mana = this.formatSkillCost(skill.baseManaCost, effectiveness.costMultiplier, 'Mana');
            stats.innerHTML += `🔵 ${mana}<br>`;
        }
        
        if (skill.baseCooldown) {
            const cd = Math.ceil(skill.baseCooldown * effectiveness.cooldownMultiplier);
            const hasMalus = effectiveness.cooldownMultiplier > 1.0;
            const increase = hasMalus ? Math.round((effectiveness.cooldownMultiplier - 1.0) * 100) : 0;
            stats.innerHTML += `⏱️ ${cd} Runden${hasMalus ? ` <span style="color: #ff9500;">(+${increase}%)</span>` : ''}<br>`;
        }
        
        card.appendChild(stats);
        
        // Badges hinzufügen
        this.addSkillIndicators(card, isOwnRole, isAwakened, skill.requiresAwakening || false);
        
        return card;
    }
}
