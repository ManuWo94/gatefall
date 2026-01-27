/**
 * Skill Availability & Effectiveness System
 * Implementiert das zweiphasige Skill-System mit Hunter-Rang Beschränkungen
 */

import { 
    Role, 
    GateRank,
    SKILL_SYSTEM_CONSTANTS, 
    calculateSkillEffectiveness, 
    SkillEffectiveness,
    getAvailableModules,
    canSpecialize,
    RoleSpecialization
} from './types.js';
import { GameSkill } from '../admin-storage.js';
import { Skill } from './types.js';

export interface SkillAvailabilityCheck {
    available: boolean;
    reason?: string;
    effectiveness: SkillEffectiveness;
}

/**
 * Prüft ob ein Skill basierend auf Hunter-Rang und Modul-Index verfügbar ist
 */
export function isSkillAvailableByRank(
    skill: Skill,
    playerRank: GateRank,
    playerSpecialization?: RoleSpecialization
): { available: boolean; reason?: string } {
    // Modul-Beschränkung prüfen
    if (skill.moduleIndex !== undefined) {
        const availableModules = getAvailableModules(playerRank);
        
        // D-Rang: Nur Module 0 und 1 (Modul 1 & 2)
        // C-Rang+: Alle 3 Module (0, 1, 2)
        if (skill.moduleIndex >= availableModules) {
            return { 
                available: false, 
                reason: `Benötigt Modul ${skill.moduleIndex + 1} (freigeschaltet ab ${availableModules === 2 ? 'D-Rang' : 'C-Rang'})` 
            };
        }
    }
    
    // Spezialisierungs-exklusive Skills (ab B-Rang)
    if (skill.requiresSpecialization) {
        if (!canSpecialize(playerRank)) {
            return { 
                available: false, 
                reason: 'Benötigt Spezialisierung (ab B-Rang)' 
            };
        }
        
        if (!playerSpecialization || playerSpecialization !== skill.requiresSpecialization) {
            return { 
                available: false, 
                reason: `Benötigt Spezialisierung: ${skill.requiresSpecialization}` 
            };
        }
    }
    
    return { available: true };
}

/**
 * Prüft ob ein Skill für einen Spieler verfügbar ist
 */
export function isSkillAvailable(
    skill: GameSkill,
    playerRole: Role,
    playerLevel: number,
    awakeningState: 'locked' | 'available' | 'in_progress' | 'completed',
    playerRank?: GateRank,
    playerSpecialization?: RoleSpecialization
): SkillAvailabilityCheck {
    const isAwakened = awakeningState === 'completed';
    const { PRE_AWAKENING_LEVEL } = SKILL_SYSTEM_CONSTANTS;
    
    // Level-Requirement prüfen
    if (playerLevel < skill.minPlayerLevel) {
        return {
            available: false,
            reason: `Benötigt Level ${skill.minPlayerLevel}`,
            effectiveness: {
                effectMultiplier: 0,
                costMultiplier: 1,
                cooldownMultiplier: 1,
                isForeignSkill: false
            }
        };
    }
    
    // Awakening-Requirement prüfen
    if (skill.requiresAwakening && !isAwakened) {
        return {
            available: false,
            reason: 'Benötigt Erwachen (Level 10)',
            effectiveness: {
                effectMultiplier: 0,
                costMultiplier: 1,
                cooldownMultiplier: 1,
                isForeignSkill: false
            }
        };
    }
    
    // Hunter-Rang basierte Verfügbarkeit (wenn Rang angegeben)
    if (playerRank && (skill as any).moduleIndex !== undefined) {
        const rankCheck = isSkillAvailableByRank(skill as any, playerRank, playerSpecialization);
        if (!rankCheck.available) {
            return {
                available: false,
                reason: rankCheck.reason,
                effectiveness: {
                    effectMultiplier: 0,
                    costMultiplier: 1,
                    cooldownMultiplier: 1,
                    isForeignSkill: false
                }
            };
        }
    }
    
    const effectiveness = calculateSkillEffectiveness(playerRole, skill.roles, isAwakened, playerRank);
    
    // Phase 1: Vor Erwachen - nur eigene Rollen-Skills
    if (!isAwakened && effectiveness.effectMultiplier === 0) {
        const isOwnRole = skill.roles.includes(playerRole);
        return {
            available: false,
            reason: isOwnRole ? 'Skill verfügbar' : 'Nur eigene Rollen-Skills vor Erwachen',
            effectiveness
        };
    }
    
    // Phase 2: Nach Erwachen - alle Skills verfügbar
    return {
        available: true,
        effectiveness
    };
}

/**
 * Berechnet die tatsächlichen Skill-Werte mit Effektivitäts-Modifiern
 */
export function calculateAdjustedSkillStats(
    skill: GameSkill,
    effectiveness: SkillEffectiveness
) {
    const { effectMultiplier, costMultiplier, cooldownMultiplier } = effectiveness;
    
    return {
        damage: skill.baseDamage ? Math.floor(skill.baseDamage * effectMultiplier) : undefined,
        healing: skill.baseHealing ? Math.floor(skill.baseHealing * effectMultiplier) : undefined,
        manaCost: skill.baseManaCost ? Math.ceil(skill.baseManaCost * costMultiplier) : 0,
        staminaCost: skill.baseStaminaCost ? Math.ceil(skill.baseStaminaCost * costMultiplier) : 0,
        cooldown: skill.baseCooldown ? Math.ceil(skill.baseCooldown * cooldownMultiplier) : 0
    };
}

/**
 * Gibt eine formatierte Skill-Beschreibung mit Malus-Info zurück
 */
export function getSkillTooltip(
    skill: GameSkill,
    effectiveness: SkillEffectiveness
): string {
    const { isForeignSkill } = effectiveness;
    
    let tooltip = skill.description || '';
    
    if (isForeignSkill) {
        const { FOREIGN_SKILL_EFFECT_MALUS, FOREIGN_SKILL_COST_INCREASE, FOREIGN_SKILL_COOLDOWN_INCREASE } = SKILL_SYSTEM_CONSTANTS;
        tooltip += `\n\n⚠️ FREMDE ROLLE:\n`;
        tooltip += `• Effekt: ${Math.floor(FOREIGN_SKILL_EFFECT_MALUS * 100)}% reduziert\n`;
        tooltip += `• Kosten: +${Math.floor(FOREIGN_SKILL_COST_INCREASE * 100)}%\n`;
        tooltip += `• Abklingzeit: +${Math.floor(FOREIGN_SKILL_COOLDOWN_INCREASE * 100)}%`;
    }
    
    return tooltip;
}

/**
 * Filtert verfügbare Skills für einen Spieler
 */
export function getAvailableSkills(
    allSkills: GameSkill[],
    playerRole: Role,
    playerLevel: number,
    awakeningState: 'locked' | 'available' | 'in_progress' | 'completed'
): GameSkill[] {
    return allSkills.filter(skill => {
        const check = isSkillAvailable(skill, playerRole, playerLevel, awakeningState);
        return check.available;
    });
}

/**
 * Gibt Statistik über verfügbare Skills zurück
 */
export function getSkillStats(
    allSkills: GameSkill[],
    playerRole: Role,
    playerLevel: number,
    awakeningState: 'locked' | 'available' | 'in_progress' | 'completed'
) {
    const isAwakened = awakeningState === 'completed';
    const ownRoleSkills = allSkills.filter(s => s.roles.includes(playerRole));
    const foreignSkills = allSkills.filter(s => !s.roles.includes(playerRole) && s.roles.length > 0);
    
    const availableOwn = ownRoleSkills.filter(s => 
        isSkillAvailable(s, playerRole, playerLevel, awakeningState).available
    );
    
    const availableForeign = isAwakened ? foreignSkills.filter(s => 
        isSkillAvailable(s, playerRole, playerLevel, awakeningState).available
    ) : [];
    
    return {
        totalSkills: allSkills.length,
        ownRoleSkills: ownRoleSkills.length,
        foreignSkills: foreignSkills.length,
        availableOwn: availableOwn.length,
        availableForeign: availableForeign.length,
        isAwakened,
        phase: isAwakened ? 2 : 1
    };
}
