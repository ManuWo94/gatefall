-- ==========================================
-- SKILLS SYSTEM - Complete Database Schema
-- Speichert alle Skills für Spieler und Enemies
-- ==========================================

-- Skills Tabelle (Alle Skills im System)
CREATE TABLE IF NOT EXISTS skills (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon TEXT,
    
    -- Kosten
    mana_cost INT DEFAULT 0,
    stamina_cost INT DEFAULT 0,
    
    -- Cooldown (in Runden)
    cooldown INT DEFAULT 0,
    
    -- Skill-Typ und Effekt
    skill_type ENUM('damage', 'heal', 'buff', 'debuff', 'dot', 'stun', 'special') NOT NULL,
    damage_type ENUM('physical', 'fire', 'ice', 'lightning', 'dark', 'light', 'poison', 'wind', 'earth') DEFAULT NULL,
    
    -- Effekt-Werte
    base_value INT DEFAULT 0,
    scaling_factor DECIMAL(3,2) DEFAULT 1.0, -- Skalierung mit Level/Stats
    duration INT DEFAULT 0, -- Dauer in Runden (für DoTs/Buffs)
    
    -- Status-Effekt (optional)
    status_effect ENUM('burn', 'frozen', 'stunned', 'poisoned', 'bleeding', 'weak_spot', 'strengthened', 'protected') DEFAULT NULL,
    
    -- Zieltyp
    target_type ENUM('single_enemy', 'all_enemies', 'self', 'single_ally', 'all_allies') DEFAULT 'single_enemy',
    
    -- Verfügbarkeit
    usable_by ENUM('player', 'enemy', 'both') DEFAULT 'both',
    min_level INT DEFAULT 1,
    
    -- Animationen
    animation VARCHAR(50) DEFAULT 'attack',
    sound VARCHAR(100) DEFAULT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_skill_type (skill_type),
    INDEX idx_usable_by (usable_by),
    INDEX idx_damage_type (damage_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enemy-Skill Zuordnung (Welche Skills welcher Enemy nutzt)
CREATE TABLE IF NOT EXISTS enemy_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    enemy_id VARCHAR(100) NOT NULL,
    skill_id VARCHAR(100) NOT NULL,
    use_priority INT DEFAULT 50, -- 0-100, höher = öfter genutzt
    min_hp_percent INT DEFAULT 0, -- Nur nutzen wenn HP über diesem %
    max_hp_percent INT DEFAULT 100, -- Nur nutzen wenn HP unter diesem %
    
    FOREIGN KEY (enemy_id) REFERENCES enemies(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_enemy_skill (enemy_id, skill_id),
    INDEX idx_enemy (enemy_id),
    INDEX idx_skill (skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- Basis Skills für Enemies einfügen
-- ==========================================

INSERT INTO skills (id, name, description, skill_type, damage_type, base_value, mana_cost, stamina_cost, cooldown, usable_by) VALUES
-- Physische Angriffe
('basic_attack', 'Basis-Angriff', 'Einfacher physischer Schlag', 'damage', 'physical', 100, 0, 5, 0, 'both'),
('heavy_strike', 'Schwerer Schlag', 'Kräftiger Angriff mit hohem Schaden', 'damage', 'physical', 150, 0, 15, 2, 'both'),
('quick_slash', 'Schneller Schnitt', 'Schneller Angriff', 'damage', 'physical', 80, 0, 10, 1, 'both'),

-- Feuer-Magie
('fireball', 'Feuerball', 'Wirft einen Feuerball', 'damage', 'fire', 120, 25, 0, 2, 'both'),
('flame_burst', 'Flammenstoß', 'Kleine Flammenexplosion', 'damage', 'fire', 90, 15, 0, 1, 'both'),
('inferno_blast', 'Inferno-Explosion', 'Massive Feuerexplosion', 'damage', 'fire', 200, 50, 0, 5, 'both'),

-- Eis-Magie
('ice_shard', 'Eissplitter', 'Wirft scharfe Eiskristalle', 'damage', 'ice', 110, 20, 0, 2, 'both'),
('frost_nova', 'Frostnova', 'Eisexplosion die verlangsamt', 'damage', 'ice', 100, 30, 0, 3, 'both'),
('freeze', 'Einfrieren', 'Friert Ziel ein', 'stun', 'ice', 0, 35, 0, 5, 'both'),

-- Blitz-Magie
('lightning_bolt', 'Blitzschlag', 'Schneller Blitzangriff', 'damage', 'lightning', 130, 30, 0, 2, 'both'),
('chain_lightning', 'Kettenblitz', 'Springt zwischen Zielen', 'damage', 'lightning', 150, 45, 0, 4, 'both'),
('thunder_strike', 'Donnerschlag', 'Gewaltiger Blitzeinschlag', 'damage', 'lightning', 180, 40, 0, 4, 'both'),

-- Dunkel-Magie
('shadow_strike', 'Schattenangriff', 'Angriff aus den Schatten', 'damage', 'dark', 115, 25, 0, 2, 'both'),
('curse', 'Fluch', 'Schwächt das Ziel', 'debuff', 'dark', 30, 20, 0, 3, 'both'),
('life_drain', 'Lebensdiebstahl', 'Stiehlt Leben vom Ziel', 'damage', 'dark', 100, 30, 0, 3, 'both'),

-- Licht-Magie
('holy_smite', 'Heiliger Zorn', 'Lichtexplosion', 'damage', 'light', 125, 28, 0, 2, 'both'),
('purify', 'Reinigung', 'Entfernt negative Effekte', 'buff', 'light', 0, 25, 0, 4, 'both'),
('divine_shield', 'Göttliches Schild', 'Schützt vor Schaden', 'buff', 'light', 50, 35, 0, 5, 'both'),

-- Gift/DoT
('poison_sting', 'Giftstich', 'Vergiftet das Ziel über Zeit', 'dot', 'poison', 25, 15, 0, 3, 'both'),
('venom_spit', 'Giftspucke', 'Wirft Gift auf Gegner', 'dot', 'poison', 30, 20, 0, 2, 'both'),
('toxic_cloud', 'Giftgaswolke', 'Giftwolke die alle schadet', 'dot', 'poison', 20, 35, 0, 4, 'both'),

-- Buffs/Heals
('regeneration', 'Regeneration', 'Heilt über Zeit', 'heal', NULL, 40, 20, 0, 3, 'both'),
('enrage', 'Wut', 'Erhöht Angriffskraft', 'buff', NULL, 50, 15, 0, 4, 'both'),
('harden_skin', 'Haut verhärten', 'Erhöht Verteidigung', 'buff', NULL, 40, 20, 0, 4, 'both'),

-- Stuns/Debuffs
('stun_strike', 'Betäubender Schlag', 'Betäubt für 1 Runde', 'stun', 'physical', 70, 0, 20, 5, 'both'),
('intimidate', 'Einschüchtern', 'Senkt Gegner-Angriff', 'debuff', NULL, 25, 10, 0, 3, 'both'),
('armor_break', 'Rüstungsbruch', 'Senkt Verteidigung', 'debuff', 'physical', 30, 0, 15, 4, 'both');

-- ==========================================
-- Beispiel: E-Rang Boss Skills zuweisen
-- ==========================================
-- Später können Skills über Admin Panel zugewiesen werden
