/**
 * COMBAT ACTIONS
 * Definiert alle verfügbaren Kampf-Aktionen
 */

import { 
    CombatAction, 
    ActionTag, 
    TelegraphType, 
    ThreatLevel,
    StatusEffectType,
    CombatRole 
} from './combat-types.js';

// ==================== SPIELER-AKTIONEN ====================

export const PLAYER_BASIC_ACTIONS: CombatAction[] = [
    {
        id: 'basic_attack',
        name: 'Normaler Angriff',
        tags: [ActionTag.SCHLAG],
        preparationTicks: 0,
        cooldownTicks: 1,
        baseDamage: 50,
        description: 'Ein schneller Schlag'
    },
    {
        id: 'quick_stab',
        name: 'Schneller Stich',
        tags: [ActionTag.STICH],
        preparationTicks: 0,
        cooldownTicks: 1,
        baseDamage: 40,
        description: 'Ein präziser Stich'
    },
    {
        id: 'block',
        name: 'Blocken',
        tags: [ActionTag.BLOCK],
        preparationTicks: 0,
        cooldownTicks: 2,
        description: 'Blockiert den nächsten Angriff'
    },
    {
        id: 'dodge',
        name: 'Ausweichen',
        tags: [ActionTag.AUSWEICHEN],
        preparationTicks: 0,
        cooldownTicks: 2,
        description: 'Weicht dem nächsten Angriff aus'
    }
];

export const PLAYER_ADVANCED_ACTIONS: CombatAction[] = [
    {
        id: 'heavy_strike',
        name: 'Schwerer Schlag',
        tags: [ActionTag.SCHLAG, ActionTag.KANALISIERUNG],
        preparationTicks: 2,
        cooldownTicks: 3,
        baseDamage: 180,
        telegraphType: TelegraphType.SCHWERER_SCHLAG,
        threatLevel: ThreatLevel.HOCH,
        description: 'Ein mächtiger Schlag mit Vorbereitungszeit'
    },
    {
        id: 'interrupt',
        name: 'Unterbrechen',
        tags: [ActionTag.UNTERBRECHEN],
        preparationTicks: 0,
        cooldownTicks: 4,
        baseDamage: 30,
        description: 'Unterbricht kanalisierte Aktionen'
    },
    {
        id: 'piercing_shot',
        name: 'Durchdringender Schuss',
        tags: [ActionTag.PROJEKTIL, ActionTag.DURCHDRINGEND],
        preparationTicks: 1,
        cooldownTicks: 3,
        baseDamage: 120,
        description: 'Durchdringt Verteidigungen'
    },
    {
        id: 'magic_missile',
        name: 'Magisches Geschoss',
        tags: [ActionTag.MAGIE, ActionTag.PROJEKTIL],
        preparationTicks: 0,
        cooldownTicks: 2,
        manaCost: 30,
        baseDamage: 80,
        description: 'Ein magischer Projektil-Angriff'
    },
    {
        id: 'fireball',
        name: 'Feuerball',
        tags: [ActionTag.MAGIE, ActionTag.FLAECHE, ActionTag.KANALISIERUNG],
        preparationTicks: 3,
        cooldownTicks: 5,
        manaCost: 80,
        baseDamage: 200,
        telegraphType: TelegraphType.FLAECHENANGRIFF,
        threatLevel: ThreatLevel.HOCH,
        statusEffects: [{
            type: StatusEffectType.VERBRENNUNG,
            baseDuration: 3,
            baseValue: 20,
            levelScaling: true
        }],
        description: 'Explosiver Flächenzauber'
    },
    {
        id: 'shield_wall',
        name: 'Schildwall',
        tags: [ActionTag.SCHILD],
        preparationTicks: 0,
        cooldownTicks: 5,
        description: 'Erschafft einen mächtigen Schild für 2 Ticks',
        statusEffects: [{
            type: StatusEffectType.SCHILD,
            baseDuration: 2,
            baseValue: 200,
            levelScaling: true
        }]
    }
];

// ==================== ROLLEN-SPEZIFISCHE AKTIONEN ====================

export const ROLE_ACTIONS: Record<CombatRole, CombatAction[]> = {
    [CombatRole.WAECHTER]: [
        {
            id: 'taunt',
            name: 'Verspotten',
            tags: [ActionTag.SCHLAG],
            preparationTicks: 0,
            cooldownTicks: 4,
            baseDamage: 20,
            description: 'Zieht die Aufmerksamkeit des Gegners',
            statusEffects: [{
                type: StatusEffectType.VERSTAERKUNG,
                baseDuration: 2,
                baseValue: 0.3,
                levelScaling: false
            }]
        },
        {
            id: 'fortify',
            name: 'Verstärken',
            tags: [ActionTag.SCHILD],
            preparationTicks: 0,
            cooldownTicks: 6,
            description: 'Erhöht Verteidigung für 3 Ticks',
            statusEffects: [{
                type: StatusEffectType.VERSTAERKUNG,
                baseDuration: 3,
                baseValue: 0.5,
                levelScaling: false
            }]
        }
    ],
    
    [CombatRole.JAEGER]: [
        {
            id: 'aimed_shot',
            name: 'Gezielter Schuss',
            tags: [ActionTag.PROJEKTIL, ActionTag.STICH, ActionTag.KANALISIERUNG],
            preparationTicks: 2,
            cooldownTicks: 3,
            baseDamage: 180,
            telegraphType: TelegraphType.PROJEKTILANGRIFF,
            threatLevel: ThreatLevel.HOCH,
            description: 'Präziser Fernkampfangriff',
            statusEffects: [{
                type: StatusEffectType.BLUTUNG,
                baseDuration: 3,
                baseValue: 15,
                levelScaling: true
            }]
        },
        {
            id: 'rapid_fire',
            name: 'Schnellfeuer',
            tags: [ActionTag.PROJEKTIL],
            preparationTicks: 0,
            cooldownTicks: 2,
            baseDamage: 35,
            description: 'Mehrere schnelle Schüsse'
        }
    ],
    
    [CombatRole.MAGIER]: [
        {
            id: 'arcane_blast',
            name: 'Arkaner Schlag',
            tags: [ActionTag.MAGIE, ActionTag.KANALISIERUNG],
            preparationTicks: 2,
            cooldownTicks: 3,
            manaCost: 60,
            baseDamage: 150,
            telegraphType: TelegraphType.MAGISCHE_KANALISIERUNG,
            threatLevel: ThreatLevel.HOCH,
            description: 'Mächtiger magischer Angriff'
        },
        {
            id: 'mana_shield',
            name: 'Manaschild',
            tags: [ActionTag.MAGIE, ActionTag.SCHILD],
            preparationTicks: 0,
            cooldownTicks: 5,
            manaCost: 40,
            description: 'Wandelt Mana in einen Schild um',
            statusEffects: [{
                type: StatusEffectType.SCHILD,
                baseDuration: 3,
                baseValue: 150,
                levelScaling: true
            }]
        }
    ],
    
    [CombatRole.HEILER]: [
        {
            id: 'heal',
            name: 'Heilung',
            tags: [ActionTag.MAGIE],
            preparationTicks: 0,
            cooldownTicks: 3,
            manaCost: 50,
            baseHealing: 120,
            description: 'Heilt einen Verbündeten'
        },
        {
            id: 'regeneration',
            name: 'Regeneration',
            tags: [ActionTag.MAGIE, ActionTag.KANALISIERUNG],
            preparationTicks: 1,
            cooldownTicks: 5,
            manaCost: 70,
            telegraphType: TelegraphType.MAGISCHE_KANALISIERUNG,
            threatLevel: ThreatLevel.GERING,
            description: 'Heilt über Zeit',
            statusEffects: [{
                type: StatusEffectType.REGENERATION,
                baseDuration: 4,
                baseValue: 30,
                levelScaling: true
            }]
        }
    ]
};

// ==================== GEGNER-AKTIONEN ====================

export const ENEMY_BASIC_ACTIONS: CombatAction[] = [
    {
        id: 'enemy_slash',
        name: 'Klauenangriff',
        tags: [ActionTag.SCHLAG],
        preparationTicks: 0,
        cooldownTicks: 1,
        baseDamage: 60,
        description: 'Ein wilder Schlag'
    },
    {
        id: 'enemy_bite',
        name: 'Biss',
        tags: [ActionTag.STICH],
        preparationTicks: 0,
        cooldownTicks: 1,
        baseDamage: 50,
        description: 'Ein schneller Biss',
        statusEffects: [{
            type: StatusEffectType.BLUTUNG,
            baseDuration: 2,
            baseValue: 10,
            levelScaling: true
        }]
    }
];

export const ENEMY_ADVANCED_ACTIONS: CombatAction[] = [
    {
        id: 'devastating_blow',
        name: 'Verheerender Schlag',
        tags: [ActionTag.SCHLAG, ActionTag.KANALISIERUNG],
        preparationTicks: 2,
        cooldownTicks: 4,
        baseDamage: 220,
        telegraphType: TelegraphType.SCHWERER_SCHLAG,
        threatLevel: ThreatLevel.TOEDLICH,
        description: 'Ein extrem mächtiger Angriff'
    },
    {
        id: 'dark_magic',
        name: 'Dunkle Magie',
        tags: [ActionTag.MAGIE, ActionTag.SCHATTEN, ActionTag.KANALISIERUNG],
        preparationTicks: 3,
        cooldownTicks: 5,
        baseDamage: 180,
        telegraphType: TelegraphType.MAGISCHE_KANALISIERUNG,
        threatLevel: ThreatLevel.TOEDLICH,
        statusEffects: [{
            type: StatusEffectType.FURCHT,
            baseDuration: 2,
            baseValue: 0.3,
            levelScaling: true
        }],
        description: 'Dunkle Schatten-Magie'
    },
    {
        id: 'poison_cloud',
        name: 'Giftwolke',
        tags: [ActionTag.MAGIE, ActionTag.FLAECHE, ActionTag.KANALISIERUNG],
        preparationTicks: 2,
        cooldownTicks: 6,
        baseDamage: 80,
        telegraphType: TelegraphType.FLAECHENANGRIFF,
        threatLevel: ThreatLevel.HOCH,
        statusEffects: [{
            type: StatusEffectType.VERGIFTUNG,
            baseDuration: 4,
            baseValue: 25,
            levelScaling: true
        }],
        description: 'Giftige Wolke die anhaltenden Schaden verursacht'
    }
];

// ==================== BOSS-AKTIONEN ====================

export const BOSS_ACTIONS: CombatAction[] = [
    {
        id: 'execution',
        name: 'Exekution',
        tags: [ActionTag.SCHLAG, ActionTag.EXEKUTION, ActionTag.KANALISIERUNG],
        preparationTicks: 3,
        cooldownTicks: 8,
        baseDamage: 400,
        telegraphType: TelegraphType.EXEKUTION,
        threatLevel: ThreatLevel.KATASTROPHAL,
        description: 'Soforttod bei niedrigem HP'
    },
    {
        id: 'dark_ritual',
        name: 'Dunkles Ritual',
        tags: [ActionTag.MAGIE, ActionTag.SCHATTEN, ActionTag.RITUAL, ActionTag.KANALISIERUNG],
        preparationTicks: 4,
        cooldownTicks: 10,
        baseDamage: 300,
        telegraphType: TelegraphType.RITUAL,
        threatLevel: ThreatLevel.KATASTROPHAL,
        statusEffects: [{
            type: StatusEffectType.FURCHT,
            baseDuration: 3,
            baseValue: 0.5,
            levelScaling: false
        }],
        description: 'Beschwört dunkle Mächte'
    },
    {
        id: 'meteor_strike',
        name: 'Meteoriteneinschlag',
        tags: [ActionTag.MAGIE, ActionTag.FLAECHE, ActionTag.KANALISIERUNG],
        preparationTicks: 4,
        cooldownTicks: 8,
        baseDamage: 350,
        telegraphType: TelegraphType.FLAECHENANGRIFF,
        threatLevel: ThreatLevel.KATASTROPHAL,
        statusEffects: [{
            type: StatusEffectType.BETAEUBUNG,
            baseDuration: 1,
            baseValue: 1,
            levelScaling: false
        }],
        description: 'Massiver Flächenschaden'
    }
];

// ==================== HELPER FUNCTIONS ====================

export function getActionsForRole(role: CombatRole): CombatAction[] {
    return [
        ...PLAYER_BASIC_ACTIONS,
        ...PLAYER_ADVANCED_ACTIONS,
        ...(ROLE_ACTIONS[role] || [])
    ];
}

export function getActionById(actionId: string): CombatAction | undefined {
    const allActions = [
        ...PLAYER_BASIC_ACTIONS,
        ...PLAYER_ADVANCED_ACTIONS,
        ...Object.values(ROLE_ACTIONS).flat(),
        ...ENEMY_BASIC_ACTIONS,
        ...ENEMY_ADVANCED_ACTIONS,
        ...BOSS_ACTIONS
    ];
    
    return allActions.find(a => a.id === actionId);
}
