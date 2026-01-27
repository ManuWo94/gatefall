/**
 * Import all skills from skills.ts into database
 */

const mysql = require('mysql2/promise');

const ROLE_SKILLS = {
    waechter: [
        // Modul 1: Standhaftigkeit
        { id: 'waechter_shield_stance', name: 'Schildhaltung', description: 'Defensivhaltung - erhöht Schadensreduktion massiv', manaCost: 15, staminaCost: 20, cooldown: 3, skillType: 'buff', baseValue: 50, duration: 2, moduleIndex: 0 },
        { id: 'waechter_firm_stand', name: 'Fester Stand', description: 'Kann nicht zurückgestoßen werden, reduziert Schaden', manaCost: 20, staminaCost: 15, cooldown: 4, skillType: 'buff', baseValue: 40, duration: 3, moduleIndex: 0 },
        { id: 'waechter_damage_absorb', name: 'Schaden abfangen', description: 'Absorbiert den nächsten Angriff vollständig', manaCost: 30, staminaCost: 25, cooldown: 5, skillType: 'buff', baseValue: 100, duration: 1, moduleIndex: 0 },
        // Modul 2: Schutzwall
        { id: 'waechter_provoke', name: 'Provokation', description: 'Zwingt Gegner zum Angriff', manaCost: 20, staminaCost: 10, cooldown: 3, skillType: 'debuff', baseValue: 30, duration: 2, moduleIndex: 1 },
        { id: 'waechter_group_barrier', name: 'Gruppenbarriere', description: 'Schützt alle Verbündeten', manaCost: 40, staminaCost: 20, cooldown: 6, skillType: 'buff', baseValue: 35, duration: 2, moduleIndex: 1 },
        { id: 'waechter_threat_bash', name: 'Bedrohungsstoß', description: 'Schlägt zu und erhöht Aggro', manaCost: 25, staminaCost: 20, cooldown: 4, skillType: 'damage', baseValue: 45, moduleIndex: 1 },
        // Modul 3: Vergeltung
        { id: 'waechter_counter', name: 'Gegenschlag', description: 'Kontert den nächsten Angriff', manaCost: 25, staminaCost: 20, cooldown: 4, skillType: 'damage', baseValue: 70, moduleIndex: 2 },
        { id: 'waechter_pushback', name: 'Zurückstoßen', description: 'Stößt Gegner zurück und betäubt', manaCost: 20, staminaCost: 25, cooldown: 5, skillType: 'damage', baseValue: 40, statusEffect: 'stunned', duration: 1, moduleIndex: 2 },
        { id: 'waechter_revenge', name: 'Racheimpuls', description: 'Starker Angriff nach Schaden', manaCost: 30, staminaCost: 30, cooldown: 5, skillType: 'damage', baseValue: 90, moduleIndex: 2 },
        // Exclusive
        { id: 'waechter_unshakeable', name: 'Unerschütterlich', description: 'Erleidet für kurze Zeit keinen kritischen Schaden', manaCost: 0, staminaCost: 0, cooldown: 0, skillType: 'buff', baseValue: 75, duration: 4, moduleIndex: 0, isExclusive: true },
        { id: 'waechter_avenging_strike', name: 'Rächender Schlag', description: 'Kontert einen Angriff mit erhöhtem Schaden', manaCost: 0, staminaCost: 0, cooldown: 0, skillType: 'damage', baseValue: 140, moduleIndex: 2, isExclusive: true },
        { id: 'waechter_protection_banner', name: 'Schutzbanner', description: 'Verbündete im Bereich erhalten Schadensreduktion', manaCost: 0, staminaCost: 0, cooldown: 0, skillType: 'buff', baseValue: 45, duration: 5, moduleIndex: 1, isExclusive: true }
    ],
    assassine: [
        // Modul 1
        { id: 'assassine_shadow_strike', name: 'Schattenstoß', description: 'Schneller Angriff aus dem Schatten', manaCost: 20, staminaCost: 15, cooldown: 2, skillType: 'damage', baseValue: 65, moduleIndex: 0 },
        { id: 'assassine_backstab', name: 'Meucheln', description: 'Kritischer Treffer von hinten', manaCost: 30, staminaCost: 20, cooldown: 4, skillType: 'damage', baseValue: 110, moduleIndex: 0 },
        { id: 'assassine_poison_blade', name: 'Giftklinge', description: 'Vergiftet den Gegner', manaCost: 25, staminaCost: 15, cooldown: 3, skillType: 'dot', baseValue: 15, statusEffect: 'bleed', duration: 3, moduleIndex: 0 },
        // Modul 2
        { id: 'assassine_shadow_shift', name: 'Schattenverlagerung', description: 'Teleportiert hinter den Gegner', manaCost: 25, staminaCost: 20, cooldown: 4, skillType: 'damage', baseValue: 50, moduleIndex: 1 },
        { id: 'assassine_precise_dodge', name: 'Präzises Ausweichen', description: 'Perfektes Ausweichen', manaCost: 20, staminaCost: 25, cooldown: 5, skillType: 'buff', baseValue: 100, duration: 1, moduleIndex: 1 },
        { id: 'assassine_chase', name: 'Nachsetzen', description: 'Verfolgt und greift an', manaCost: 15, staminaCost: 20, cooldown: 3, skillType: 'damage', baseValue: 55, moduleIndex: 1 },
        // Modul 3
        { id: 'assassine_bleed', name: 'Blutung', description: 'Starke Blutung', manaCost: 30, staminaCost: 20, cooldown: 4, skillType: 'dot', baseValue: 20, statusEffect: 'bleed', duration: 4, moduleIndex: 2 },
        { id: 'assassine_armor_break', name: 'Rüstungsbruch', description: 'Durchbricht Rüstung', manaCost: 25, staminaCost: 15, cooldown: 5, skillType: 'debuff', baseValue: 30, statusEffect: 'weak_spot', duration: 3, moduleIndex: 2 },
        { id: 'assassine_weakening_cut', name: 'Schwächender Schnitt', description: 'Schwächt Gegner', manaCost: 20, staminaCost: 15, cooldown: 4, skillType: 'debuff', baseValue: 25, duration: 2, moduleIndex: 2 },
        // Exclusive
        { id: 'assassine_deadly_appearance', name: 'Tödliche Erscheinung', description: 'Massiver Schaden aus dem Hinterhalt', manaCost: 0, staminaCost: 0, cooldown: 0, skillType: 'damage', baseValue: 180, moduleIndex: 0, isExclusive: true },
        { id: 'assassine_perfect_cut', name: 'Perfekter Schnitt', description: 'Ignoriert Verteidigung', manaCost: 0, staminaCost: 0, cooldown: 0, skillType: 'damage', baseValue: 130, moduleIndex: 1, isExclusive: true },
        { id: 'assassine_bloodlust', name: 'Blutrausch', description: 'Schaden steigt pro Blutung', manaCost: 0, staminaCost: 0, cooldown: 0, skillType: 'buff', baseValue: 60, duration: 4, moduleIndex: 2, isExclusive: true }
    ],
    magier: [
        // Modul 1
        { id: 'magier_fire_missile', name: 'Feuerprojektil', description: 'Feuergeschoss', manaCost: 25, staminaCost: 5, cooldown: 2, skillType: 'damage', baseValue: 60, statusEffect: 'burn', duration: 2, moduleIndex: 0 },
        { id: 'magier_ice_lance', name: 'Eislanze', description: 'Durchbohrt mit Eis', manaCost: 30, staminaCost: 5, cooldown: 3, skillType: 'damage', baseValue: 70, moduleIndex: 0 },
        { id: 'magier_lightning', name: 'Blitzschlag', description: 'Blitz vom Himmel', manaCost: 35, staminaCost: 10, cooldown: 4, skillType: 'damage', baseValue: 85, moduleIndex: 0 },
        // Modul 2
        { id: 'magier_slow_field', name: 'Verlangsamungsfeld', description: 'Verlangsamende Zone', manaCost: 30, staminaCost: 10, cooldown: 5, skillType: 'debuff', baseValue: 40, duration: 3, moduleIndex: 1 },
        { id: 'magier_magic_bind', name: 'Magische Fessel', description: 'Fesselt Gegner', manaCost: 35, staminaCost: 5, cooldown: 6, skillType: 'debuff', baseValue: 100, statusEffect: 'stunned', duration: 1, moduleIndex: 1 },
        { id: 'magier_suppression_zone', name: 'Unterdrückungszone', description: 'Reduziert Gegnerschaden', manaCost: 40, staminaCost: 10, cooldown: 6, skillType: 'debuff', baseValue: 50, duration: 2, moduleIndex: 1 },
        // Modul 3
        { id: 'magier_mana_regen', name: 'Manaregeneration', description: 'Stellt Mana wieder her', manaCost: 0, staminaCost: 10, cooldown: 4, skillType: 'heal', baseValue: 30, duration: 3, moduleIndex: 2 },
        { id: 'magier_spell_focus', name: 'Zauberfokus', description: 'Erhöht Zauberschaden', manaCost: 25, staminaCost: 5, cooldown: 5, skillType: 'buff', baseValue: 30, duration: 3, moduleIndex: 2 },
        { id: 'magier_arcane_overload', name: 'Arkane Überladung', description: 'Massiver Schaden', manaCost: 60, staminaCost: 15, cooldown: 7, skillType: 'damage', baseValue: 150, moduleIndex: 2 },
        // Exclusive
        { id: 'magier_inferno', name: 'Inferno', description: 'Massive Feuerexplosion', manaCost: 0, staminaCost: 0, cooldown: 0, skillType: 'damage', baseValue: 200, moduleIndex: 0, isExclusive: true },
        { id: 'magier_absolute_zero', name: 'Absoluter Nullpunkt', description: 'Friert komplett ein', manaCost: 0, staminaCost: 0, cooldown: 0, skillType: 'damage', baseValue: 170, statusEffect: 'frozen', duration: 2, moduleIndex: 1, isExclusive: true },
        { id: 'magier_chain_lightning', name: 'Kettenblitz', description: 'Springt zwischen Zielen', manaCost: 0, staminaCost: 0, cooldown: 0, skillType: 'damage', baseValue: 150, moduleIndex: 2, isExclusive: true }
    ],
    heiler: [
        // Modul 1
        { id: 'heiler_heal_pulse', name: 'Heilimpuls', description: 'Sofortige Heilung', manaCost: 25, staminaCost: 5, cooldown: 2, skillType: 'heal', baseValue: 60, moduleIndex: 0 },
        { id: 'heiler_emergency_heal', name: 'Notfallheilung', description: 'Starke Sofort-Heilung', manaCost: 40, staminaCost: 10, cooldown: 5, skillType: 'heal', baseValue: 100, moduleIndex: 0 },
        { id: 'heiler_life_transfer', name: 'Lebensübertragung', description: 'Heilt über Zeit', manaCost: 35, staminaCost: 10, cooldown: 4, skillType: 'heal', baseValue: 25, duration: 4, moduleIndex: 0 },
        // Modul 2
        { id: 'heiler_blessing', name: 'Schutzsegen', description: 'Schützt vor Schaden', manaCost: 30, staminaCost: 10, cooldown: 5, skillType: 'buff', baseValue: 40, duration: 3, moduleIndex: 1 },
        { id: 'heiler_cleanse', name: 'Statusreinigung', description: 'Entfernt Debuffs', manaCost: 35, staminaCost: 5, cooldown: 6, skillType: 'buff', baseValue: 0, moduleIndex: 1 },
        { id: 'heiler_resistance', name: 'Widerstandsverstärkung', description: 'Erhöht Resistenzen', manaCost: 30, staminaCost: 10, cooldown: 5, skillType: 'buff', baseValue: 35, duration: 4, moduleIndex: 1 },
        // Modul 3
        { id: 'heiler_regen_field', name: 'Regenerationsfeld', description: 'Heilt alle in Zone', manaCost: 40, staminaCost: 15, cooldown: 6, skillType: 'heal', baseValue: 20, duration: 3, moduleIndex: 2 },
        { id: 'heiler_afterheal', name: 'Nachheilung', description: 'Heilt nach Angriffen', manaCost: 30, staminaCost: 10, cooldown: 5, skillType: 'heal', baseValue: 15, duration: 5, moduleIndex: 2 },
        { id: 'heiler_life_anchor', name: 'Lebensanker', description: 'Verhindert Tod', manaCost: 50, staminaCost: 20, cooldown: 8, skillType: 'buff', baseValue: 100, duration: 1, moduleIndex: 2 },
        // Exclusive
        { id: 'heiler_divine_resurrection', name: 'Göttliche Auferstehung', description: 'Massive Heilung bei niedriger HP', manaCost: 0, staminaCost: 0, cooldown: 0, skillType: 'heal', baseValue: 300, moduleIndex: 0, isExclusive: true },
        { id: 'heiler_sacred_ground', name: 'Heiliger Boden', description: 'Zone mit kontinuierlicher Heilung', manaCost: 0, staminaCost: 0, cooldown: 0, skillType: 'buff', baseValue: 50, duration: 5, moduleIndex: 1, isExclusive: true },
        { id: 'heiler_miracle', name: 'Wunder', description: 'Massive Heilung mit göttlicher Macht', manaCost: 0, staminaCost: 0, cooldown: 0, skillType: 'heal', baseValue: 250, moduleIndex: 2, isExclusive: true }
    ],
    beschwoerer: [
        // Modul 1
        { id: 'beschwoerer_summon', name: 'Kreatur beschwören', description: 'Beschwört Kampfkreatur', manaCost: 40, staminaCost: 10, cooldown: 6, skillType: 'damage', baseValue: 50, duration: 5, moduleIndex: 0 },
        { id: 'beschwoerer_enhance_bond', name: 'Bindungsverstärkung', description: 'Verstärkt Kreaturen', manaCost: 25, staminaCost: 10, cooldown: 4, skillType: 'buff', baseValue: 40, duration: 4, moduleIndex: 0 },
        { id: 'beschwoerer_essence_transfer', name: 'Essenzübertragung', description: 'Teilt Schaden', manaCost: 30, staminaCost: 15, cooldown: 5, skillType: 'buff', baseValue: 50, duration: 3, moduleIndex: 0 },
        // Modul 2
        { id: 'beschwoerer_focus_command', name: 'Fokusbefehl', description: 'Fokussierter Angriff', manaCost: 20, staminaCost: 10, cooldown: 3, skillType: 'damage', baseValue: 60, moduleIndex: 1 },
        { id: 'beschwoerer_swap_position', name: 'Positionswechsel', description: 'Tauscht Position', manaCost: 25, staminaCost: 15, cooldown: 5, skillType: 'buff', baseValue: 30, duration: 2, moduleIndex: 1 },
        { id: 'beschwoerer_sacrifice', name: 'Opferbefehl', description: 'Opfert Kreatur', manaCost: 35, staminaCost: 20, cooldown: 6, skillType: 'damage', baseValue: 120, moduleIndex: 1 },
        // Modul 3
        { id: 'beschwoerer_multi_summon', name: 'Mehrfachbeschwörung', description: 'Mehrere Kreaturen', manaCost: 50, staminaCost: 15, cooldown: 7, skillType: 'damage', baseValue: 40, duration: 4, moduleIndex: 2 },
        { id: 'beschwoerer_swarm', name: 'Schwarmangriff', description: 'Alle greifen an', manaCost: 40, staminaCost: 20, cooldown: 6, skillType: 'damage', baseValue: 80, moduleIndex: 2 },
        { id: 'beschwoerer_dominance', name: 'Dominanzimpuls', description: 'Schaden pro Kreatur', manaCost: 35, staminaCost: 15, cooldown: 5, skillType: 'damage', baseValue: 70, moduleIndex: 2 },
        // Exclusive
        { id: 'beschwoerer_elemental_fury', name: 'Elementarwut', description: 'Beschwört alle 4 Elementare', manaCost: 0, staminaCost: 0, cooldown: 0, skillType: 'damage', baseValue: 160, moduleIndex: 0, isExclusive: true },
        { id: 'beschwoerer_swarm_attack', name: 'Schwarm-Angriff', description: 'Unzählige kleine Kreaturen', manaCost: 0, staminaCost: 0, cooldown: 0, skillType: 'damage', baseValue: 140, moduleIndex: 1, isExclusive: true },
        { id: 'beschwoerer_alpha_beast', name: 'Alpha-Bestie', description: 'Mächtige Bestie mit erhöhten Stats', manaCost: 0, staminaCost: 0, cooldown: 0, skillType: 'damage', baseValue: 180, moduleIndex: 2, isExclusive: true }
    ],
    berserker: [
        // Modul 1
        { id: 'berserker_rage', name: 'Wutanfall', description: 'Wilde Angriffsserie', manaCost: 20, staminaCost: 30, cooldown: 3, skillType: 'damage', baseValue: 75, moduleIndex: 0 },
        { id: 'berserker_escalating_strike', name: 'Eskalierender Schlag', description: 'Schaden steigt', manaCost: 25, staminaCost: 25, cooldown: 4, skillType: 'damage', baseValue: 60, moduleIndex: 0 },
        { id: 'berserker_adrenaline', name: 'Adrenalinstoß', description: 'Erhöht Tempo', manaCost: 30, staminaCost: 35, cooldown: 5, skillType: 'buff', baseValue: 50, duration: 3, moduleIndex: 0 },
        // Modul 2
        { id: 'berserker_self_harm', name: 'Selbstverletzung', description: 'Opfert HP für Schaden', manaCost: 0, staminaCost: 20, cooldown: 4, skillType: 'damage', baseValue: 100, moduleIndex: 1 },
        { id: 'berserker_blood_frenzy', name: 'Blutrausch', description: 'Mehr Schaden bei niedrig HP', manaCost: 15, staminaCost: 25, cooldown: 5, skillType: 'damage', baseValue: 90, moduleIndex: 1 },
        { id: 'berserker_sacrifice_strike', name: 'Opferstoß', description: 'Verliert HP, massiv Schaden', manaCost: 25, staminaCost: 30, cooldown: 6, skillType: 'damage', baseValue: 130, moduleIndex: 1 },
        // Modul 3
        { id: 'berserker_cc_resist', name: 'CC-Resistenz', description: 'Immun gegen Kontrolle', manaCost: 20, staminaCost: 20, cooldown: 6, skillType: 'buff', baseValue: 100, duration: 2, moduleIndex: 2 },
        { id: 'berserker_breakthrough', name: 'Durchbrechen', description: 'Durchbricht Verteidigung', manaCost: 30, staminaCost: 35, cooldown: 5, skillType: 'damage', baseValue: 95, moduleIndex: 2 },
        { id: 'berserker_last_stand', name: 'Letzter Ansturm', description: 'Finaler Angriff', manaCost: 40, staminaCost: 40, cooldown: 7, skillType: 'damage', baseValue: 150, moduleIndex: 2 },
        // Exclusive
        { id: 'berserker_bloodbath', name: 'Blutbad', description: 'Opfert HP für massiven Schaden', manaCost: 0, staminaCost: 0, cooldown: 0, skillType: 'damage', baseValue: 250, moduleIndex: 0, isExclusive: true },
        { id: 'berserker_titanic_blow', name: 'Titanenschlag', description: 'Verheerender Angriff', manaCost: 0, staminaCost: 0, cooldown: 0, skillType: 'damage', baseValue: 220, moduleIndex: 1, isExclusive: true },
        { id: 'berserker_reaper_strike', name: 'Sensenhieb', description: 'Execute-Schaden an geschwächten Zielen', manaCost: 0, staminaCost: 0, cooldown: 0, skillType: 'damage', baseValue: 280, moduleIndex: 2, isExclusive: true }
    ],
    fluchwirker: [
        // Modul 1
        { id: 'fluchwirker_plague', name: 'Seuchenfluch', description: 'Infiziert mit Seuche', manaCost: 30, staminaCost: 10, cooldown: 4, skillType: 'dot', baseValue: 18, statusEffect: 'bleed', duration: 5, moduleIndex: 0 },
        { id: 'fluchwirker_weakness', name: 'Schwächungszauber', description: 'Schwächt massiv', manaCost: 25, staminaCost: 10, cooldown: 4, skillType: 'debuff', baseValue: 40, duration: 3, moduleIndex: 0 },
        { id: 'fluchwirker_decay_burst', name: 'Verfallsausbruch', description: 'DoTs explodieren', manaCost: 40, staminaCost: 15, cooldown: 6, skillType: 'damage', baseValue: 110, moduleIndex: 0 },
        // Modul 2
        { id: 'fluchwirker_fear', name: 'Angstschrei', description: 'Verursacht Furcht', manaCost: 30, staminaCost: 10, cooldown: 5, skillType: 'debuff', baseValue: 60, statusEffect: 'stunned', duration: 2, moduleIndex: 1 },
        { id: 'fluchwirker_ban_circle', name: 'Bannkreis', description: 'Bindet an Ort', manaCost: 35, staminaCost: 15, cooldown: 6, skillType: 'debuff', baseValue: 100, duration: 2, moduleIndex: 1 },
        { id: 'fluchwirker_mind_shock', name: 'Gedankenschock', description: 'Schockt den Geist', manaCost: 25, staminaCost: 10, cooldown: 4, skillType: 'damage', baseValue: 55, statusEffect: 'stunned', duration: 1, moduleIndex: 1 },
        // Modul 3
        { id: 'fluchwirker_doom_mark', name: 'Verdammungsmarke', description: 'Markiert für Tod', manaCost: 35, staminaCost: 15, cooldown: 5, skillType: 'debuff', baseValue: 50, duration: 4, moduleIndex: 2 },
        { id: 'fluchwirker_soul_break', name: 'Seelenbruch', description: 'Bricht die Seele', manaCost: 40, staminaCost: 20, cooldown: 6, skillType: 'damage', baseValue: 100, moduleIndex: 2 },
        { id: 'fluchwirker_judgement', name: 'Urteil', description: 'Richtspruch, Schaden pro Debuff', manaCost: 50, staminaCost: 25, cooldown: 7, skillType: 'damage', baseValue: 140, moduleIndex: 2 },
        // Exclusive
        { id: 'fluchwirker_overwhelming_curse', name: 'Überwältigender Fluch', description: 'Stapelt mehrere Debuffs', manaCost: 0, staminaCost: 0, cooldown: 0, skillType: 'debuff', baseValue: 60, duration: 5, moduleIndex: 0, isExclusive: true },
        { id: 'fluchwirker_undead_army', name: 'Untotenarmee', description: 'Beschwört mehrere Untote', manaCost: 0, staminaCost: 0, cooldown: 0, skillType: 'damage', baseValue: 170, moduleIndex: 1, isExclusive: true },
        { id: 'fluchwirker_final_judgement', name: 'Letztes Urteil', description: 'Massiver Schaden an geschwächten Zielen', manaCost: 0, staminaCost: 0, cooldown: 0, skillType: 'damage', baseValue: 220, moduleIndex: 2, isExclusive: true }
    ],
    hunter: [
        { id: 'hunter_strike', name: 'Hunter-Schlag', description: 'Basisangriff', manaCost: 15, staminaCost: 10, cooldown: 2, skillType: 'damage', baseValue: 50, moduleIndex: 0 },
        { id: 'hunter_awakened_power', name: 'Erwachte Kraft', description: 'Erwachte Energie', manaCost: 30, staminaCost: 20, cooldown: 4, skillType: 'damage', baseValue: 85, moduleIndex: 0 },
        { id: 'hunter_double_strike', name: 'Doppelschlag', description: 'Zweimal zuschlagen', manaCost: 25, staminaCost: 25, cooldown: 3, skillType: 'damage', baseValue: 70, moduleIndex: 0 }
    ]
};

async function importSkills() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'gatefall_db'
    });

    try {
        console.log('🔄 Lösche alte Skills...');
        await connection.execute('DELETE FROM skills');
        
        let totalImported = 0;
        
        for (const [role, skills] of Object.entries(ROLE_SKILLS)) {
            console.log(`\n📦 Importiere ${skills.length} Skills für Rolle: ${role}`);
            
            for (const skill of skills) {
                const damageType = skill.skillType === 'damage' || skill.skillType === 'dot' ? 'physical' : null;
                const targetType = 'single_enemy';
                const usableBy = 'both';
                const minLevel = 1;
                
                await connection.execute(`
                    INSERT INTO skills (
                        id, name, description, mana_cost, stamina_cost, cooldown,
                        skill_type, damage_type, base_value, scaling_factor, duration,
                        status_effect, target_type, usable_by, min_level, animation
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    skill.id,
                    skill.name,
                    skill.description,
                    skill.manaCost || 0,
                    skill.staminaCost || 0,
                    skill.cooldown || 0,
                    skill.skillType,
                    damageType,
                    skill.baseValue || 0,
                    1.0,
                    skill.duration || 0,
                    skill.statusEffect || null,
                    targetType,
                    usableBy,
                    minLevel,
                    'attack'
                ]);
                
                totalImported++;
            }
        }
        
        console.log(`\n✅ ${totalImported} Skills erfolgreich importiert!`);
        
        // Statistik
        const [counts] = await connection.execute(`
            SELECT skill_type, COUNT(*) as count 
            FROM skills 
            GROUP BY skill_type
        `);
        
        console.log('\n📊 Statistik:');
        counts.forEach(row => {
            console.log(`   ${row.skill_type}: ${row.count}`);
        });
        
    } catch (error) {
        console.error('❌ Fehler beim Import:', error);
    } finally {
        await connection.end();
    }
}

importSkills();
