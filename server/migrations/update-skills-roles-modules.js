/**
 * Migration: Skills mit Rollen, Modulen und Spezialisierungen aktualisieren
 */

const mysql = require('mysql2/promise');

// Rollentypen zuordnen
const ROLE_TYPE_MAP = {
    waechter: 'tank',
    berserker: 'dps',
    assassine: 'dps',
    magier: 'dps',
    heiler: 'support',
    beschwoerer: 'dps',
    fluchwirker: 'dps'
};

// Skills nach Rollen gruppieren mit moduleIndex
const ROLE_SKILLS_MAPPING = {
    waechter: {
        skills: [
            'waechter_shield_stance', 'waechter_firm_stand', 'waechter_damage_absorb',
            'waechter_provoke', 'waechter_group_barrier', 'waechter_threat_bash',
            'waechter_counter', 'waechter_pushback', 'waechter_revenge',
            'waechter_unshakeable', 'waechter_avenging_strike', 'waechter_protection_banner'
        ],
        moduleIndexes: [0, 0, 0, 1, 1, 1, 2, 2, 2, 0, 2, 1],
        specializations: ['waechter_fortress', 'waechter_guardian', 'waechter_avenger']
    },
    assassine: {
        skills: [
            'assassine_shadow_strike', 'assassine_backstab', 'assassine_poison_blade',
            'assassine_shadow_shift', 'assassine_precise_dodge', 'assassine_chase',
            'assassine_bleed', 'assassine_armor_break', 'assassine_weakening_cut',
            'assassine_deadly_appearance', 'assassine_perfect_cut', 'assassine_bloodlust'
        ],
        moduleIndexes: [0, 0, 0, 1, 1, 1, 2, 2, 2, 0, 1, 2],
        specializations: ['assassine_shadowblade', 'assassine_nightstalker', 'assassine_reaper']
    },
    magier: {
        skills: [
            'magier_fire_missile', 'magier_ice_lance', 'magier_lightning',
            'magier_slow_field', 'magier_magic_bind', 'magier_suppression_zone',
            'magier_mana_regen', 'magier_spell_focus', 'magier_arcane_overload',
            'magier_inferno', 'magier_absolute_zero', 'magier_chain_lightning'
        ],
        moduleIndexes: [0, 0, 0, 1, 1, 1, 2, 2, 2, 0, 1, 2],
        specializations: ['magier_pyromancer', 'magier_frostmage', 'magier_arcanist']
    },
    heiler: {
        skills: [
            'heiler_heal_pulse', 'heiler_emergency_heal', 'heiler_life_transfer',
            'heiler_blessing', 'heiler_cleanse', 'heiler_resistance',
            'heiler_regen_field', 'heiler_afterheal', 'heiler_life_anchor',
            'heiler_divine_resurrection', 'heiler_sacred_ground', 'heiler_miracle'
        ],
        moduleIndexes: [0, 0, 0, 1, 1, 1, 2, 2, 2, 0, 1, 2],
        specializations: ['heiler_priest', 'heiler_paladin', 'heiler_oracle']
    },
    beschwoerer: {
        skills: [
            'beschwoerer_summon', 'beschwoerer_enhance_bond', 'beschwoerer_essence_transfer',
            'beschwoerer_focus_command', 'beschwoerer_swap_position', 'beschwoerer_sacrifice',
            'beschwoerer_multi_summon', 'beschwoerer_swarm', 'beschwoerer_dominance',
            'beschwoerer_elemental_fury', 'beschwoerer_swarm_attack', 'beschwoerer_alpha_beast'
        ],
        moduleIndexes: [0, 0, 0, 1, 1, 1, 2, 2, 2, 0, 1, 2],
        specializations: ['beschwoerer_elementalist', 'beschwoerer_beastmaster', 'beschwoerer_necromancer']
    },
    berserker: {
        skills: [
            'berserker_rage', 'berserker_escalating_strike', 'berserker_adrenaline',
            'berserker_self_harm', 'berserker_blood_frenzy', 'berserker_sacrifice_strike',
            'berserker_cc_resist', 'berserker_breakthrough', 'berserker_last_stand',
            'berserker_bloodbath', 'berserker_titanic_blow', 'berserker_reaper_strike'
        ],
        moduleIndexes: [0, 0, 0, 1, 1, 1, 2, 2, 2, 0, 1, 2],
        specializations: ['berserker_ravager', 'berserker_warlord', 'berserker_champion']
    },
    fluchwirker: {
        skills: [
            'fluchwirker_plague', 'fluchwirker_weakness', 'fluchwirker_decay_burst',
            'fluchwirker_fear', 'fluchwirker_ban_circle', 'fluchwirker_mind_shock',
            'fluchwirker_doom_mark', 'fluchwirker_soul_break', 'fluchwirker_judgement',
            'fluchwirker_overwhelming_curse', 'fluchwirker_undead_army', 'fluchwirker_final_judgement'
        ],
        moduleIndexes: [0, 0, 0, 1, 1, 1, 2, 2, 2, 0, 1, 2],
        specializations: ['fluchwirker_plaguebringer', 'fluchwirker_voidcaller', 'fluchwirker_doomweaver']
    }
};

async function migrateSkillsData() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'gatefall_db'
    });

    try {
        console.log('🔄 Aktualisiere Skills mit Rollen-, Modul- und Spezialisierungs-Daten...\n');
        
        let updatedCount = 0;

        for (const [roleName, data] of Object.entries(ROLE_SKILLS_MAPPING)) {
            console.log(`📦 Aktualisiere ${data.skills.length} Skills für Rolle: ${roleName}`);
            
            const roleType = ROLE_TYPE_MAP[roleName];
            
            for (let i = 0; i < data.skills.length; i++) {
                const skillId = data.skills[i];
                const moduleIndex = data.moduleIndexes[i];
                
                // Bestimme Spezialisierungs-Tier basierend auf moduleIndex
                // Modul 0 = E-Rang+ (Basis), Modul 1 = D-Rang+, Modul 2 = C-Rang+ (erste Spezialisierung)
                let specializationTier = 0; // Standard: Basis-Skill
                let requiresSpecialization = null;
                
                if (moduleIndex === 2) {
                    // C-Rang Skills benötigen erste Spezialisierung
                    specializationTier = 1;
                    // Nehme erste Spezialisierung der Rolle als Requirement
                    requiresSpecialization = data.specializations[0];
                }
                
                // Aktualisiere Skill
                await connection.execute(`
                    UPDATE skills 
                    SET 
                        roles = ?,
                        module_index = ?,
                        requires_specialization = ?,
                        specialization_tier = ?,
                        is_cross_class = 0,
                        role_type = ?
                    WHERE id = ?
                `, [
                    JSON.stringify([roleName]),
                    moduleIndex,
                    requiresSpecialization,
                    specializationTier,
                    roleType,
                    skillId
                ]);
                
                updatedCount++;
            }
        }
        
        // Hunter-Skills (Basis-Klasse ohne Spezialisierung)
        const hunterSkills = ['hunter_strike', 'hunter_awakened_power', 'hunter_double_strike'];
        console.log(`\n📦 Aktualisiere ${hunterSkills.length} Hunter-Skills (Basis)`);
        
        for (const skillId of hunterSkills) {
            await connection.execute(`
                UPDATE skills 
                SET 
                    roles = ?,
                    module_index = 0,
                    requires_specialization = NULL,
                    specialization_tier = 0,
                    is_cross_class = 0,
                    role_type = NULL
                WHERE id = ?
            `, [
                JSON.stringify(['hunter']),
                skillId
            ]);
            updatedCount++;
        }
        
        console.log(`\n✅ ${updatedCount} Skills erfolgreich aktualisiert!`);
        
        // Statistik
        const [stats] = await connection.execute(`
            SELECT 
                role_type,
                COUNT(*) as count,
                SUM(CASE WHEN module_index = 0 THEN 1 ELSE 0 END) as module_0,
                SUM(CASE WHEN module_index = 1 THEN 1 ELSE 0 END) as module_1,
                SUM(CASE WHEN module_index = 2 THEN 1 ELSE 0 END) as module_2
            FROM skills 
            WHERE roles IS NOT NULL
            GROUP BY role_type
        `);
        
        console.log('\n📊 Statistik nach Rollentyp:');
        stats.forEach(row => {
            console.log(`   ${row.role_type || 'NULL'}: ${row.count} Skills (Modul 0: ${row.module_0}, Modul 1: ${row.module_1}, Modul 2: ${row.module_2})`);
        });
        
        // Zeige Beispiel-Skills
        const [examples] = await connection.execute(`
            SELECT id, name, roles, module_index, requires_specialization, specialization_tier, role_type
            FROM skills 
            WHERE roles IS NOT NULL
            LIMIT 5
        `);
        
        console.log('\n📋 Beispiel-Skills:');
        examples.forEach(skill => {
            const roles = JSON.parse(skill.roles);
            console.log(`   ${skill.id}: ${roles.join(', ')} | Modul ${skill.module_index} | Tier ${skill.specialization_tier} | ${skill.role_type || 'N/A'}`);
        });
        
    } catch (error) {
        console.error('❌ Fehler bei Migration:', error);
    } finally {
        await connection.end();
    }
}

migrateSkillsData();
