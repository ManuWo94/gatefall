/**
 * Admin Initialization - Lädt alle Default-Daten beim ersten Start
 */

import { AdminStorage, Enemy, GameSkill, AttackAction } from './admin-storage.js';
import { ROLE_SKILLS } from './combat/skills.js';

export function initializeAdminData(): void {
    // Prüfe ob bereits Daten vorhanden sind
    const existingEnemies = AdminStorage.getAllEnemies();
    const existingSkills = AdminStorage.getAllSkills();
    const existingAttacks = AdminStorage.getAllAttackActions();
    
    console.log(`📊 Status: ${existingSkills.length} Skills, ${existingEnemies.length} Gegner, ${existingAttacks.length} Angriffe vorhanden`);
    
    let enemyCount = 0;
    let skillCount = 0;
    let attackCount = 0;
    
    // ==================== ATTACK ACTIONS IMPORTIEREN ====================
    if (existingAttacks.length === 0) {
        console.log('⚙️ Importiere Default-Angriffe...');
        const defaultAttacks: AttackAction[] = [
            {
                id: 'attack_default_1',
                action_id: 'attack',
                name: 'Angriff',
                description: 'Standard Angriff',
                damage_multiplier: 1.0,
                stamina_cost: 0,
                cooldown: 0,
                can_block: true,
                can_dodge: true,
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                id: 'attack_default_2',
                action_id: 'strong-attack',
                name: 'Starker Angriff',
                description: 'Extra Schaden für mehr Stamina',
                damage_multiplier: 1.5,
                stamina_cost: 20,
                cooldown: 3,
                can_block: true,
                can_dodge: false,
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                id: 'attack_default_3',
                action_id: 'block',
                name: 'Blocken',
                description: 'Verteidigung gegen Angriffe',
                damage_multiplier: 0,
                stamina_cost: 0,
                cooldown: 0,
                can_block: true,
                can_dodge: false,
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            {
                id: 'attack_default_4',
                action_id: 'dodge',
                name: 'Ausweichen',
                description: 'Weiche dem Angriff aus',
                damage_multiplier: 0,
                stamina_cost: 10,
                cooldown: 2,
                can_block: false,
                can_dodge: true,
                createdAt: Date.now(),
                updatedAt: Date.now()
            }
        ];
        
        defaultAttacks.forEach(attack => {
            AdminStorage.saveAttackAction(attack);
            attackCount++;
        });
        console.log(`✅ ${attackCount} Default-Angriffe importiert`);
    }
    
    // ==================== SKILLS IMPORTIEREN ====================
    if (existingSkills.length === 0) {
        console.log('⚙️ Importiere Skills...');
        Object.entries(ROLE_SKILLS).forEach(([role, skills]) => {
            skills.forEach(skill => {
                const gameSkill: GameSkill = {
                    id: String(skill.id),
                    name: skill.name,
                    description: skill.description || '',
                    type: skill.effect?.type === 'damage' ? 'damage' 
                        : skill.effect?.type === 'heal' ? 'healing'
                        : skill.effect?.type === 'buff' ? 'buff'
                        : skill.effect?.type === 'debuff' ? 'debuff'
                        : 'utility',
                    element: 'physical',
                    baseDamage: skill.effect?.type === 'damage' ? skill.effect.value : undefined,
                    baseHealing: skill.effect?.type === 'heal' ? skill.effect.value : undefined,
                    baseManaCost: skill.manaCost,
                    baseStaminaCost: skill.staminaCost,
                    baseCooldown: skill.cooldown,
                    roles: [role],
                    canHunterUse: true,
                    requiresAwakening: false,
                    minPlayerLevel: 1,
                    icon: '',
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };
                
                AdminStorage.saveSkill(gameSkill);
                skillCount++;
            });
        });
    }
    
    // ==================== GEGNER UND BOSSE IMPORTIEREN ====================
    // Gates System entfernt - Gegner können jetzt manuell über Admin-Panel erstellt werden
    
    if (skillCount > 0) console.log(`✅ ${skillCount} Skills importiert!`);
    if (enemyCount > 0) console.log(`✅ ${enemyCount} Gegner und Bosse importiert!`);
    
    // Zeige Erfolgsmeldung nur wenn etwas importiert wurde
    if ((skillCount > 0 || enemyCount > 0) && typeof window !== 'undefined') {
        setTimeout(() => {
            let message = '🎉 Willkommen im Admin-Panel!\n\n';
            if (skillCount > 0) message += `✅ ${skillCount} Skills wurden geladen\n`;
            if (enemyCount > 0) message += `✅ ${enemyCount} Gegner und Bosse wurden geladen\n`;
            message += '\nDu kannst jetzt Bilder hochladen und Daten anpassen!';
            alert(message);
        }, 500);
    }
}
