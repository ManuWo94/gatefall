-- ==========================================
-- ATTACK ACTIONS - Basic Combat Actions
-- Grundlegende Angriffsaktionen für das Combat-System
-- ==========================================

CREATE TABLE IF NOT EXISTS attack_actions (
    action_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255) DEFAULT NULL,
    
    -- Combat Properties
    damage_multiplier DECIMAL(3,2) DEFAULT 1.0,
    stamina_cost INT DEFAULT 0,
    cooldown INT DEFAULT 0,
    
    -- Defensive Properties
    can_block BOOLEAN DEFAULT FALSE,
    can_dodge BOOLEAN DEFAULT FALSE,
    dodge_bonus INT DEFAULT 0,
    block_reduction INT DEFAULT 0,
    
    -- Availability
    min_level INT DEFAULT 1,
    requires_awakening BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_min_level (min_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- Insert Default Attack Actions
-- ==========================================

INSERT INTO attack_actions (action_id, name, description, damage_multiplier, stamina_cost, cooldown, can_block, can_dodge) VALUES
('attack', 'Angriff', 'Normaler physischer Angriff', 1.0, 0, 0, false, false),
('strong-attack', 'Starker Angriff', 'Kräftiger Schlag mit erhöhtem Schaden', 1.5, 20, 3, false, false),
('block', 'Blocken', 'Reduziert eingehenden Schaden um 50%', 0.0, 0, 0, true, false),
('dodge', 'Ausweichen', 'Versuch einem Angriff auszuweichen', 0.0, 10, 1, false, true),
('critical-strike', 'Kritischer Schlag', 'Angriff mit Chance auf kritischen Schaden', 1.8, 30, 4, false, false),
('counter', 'Konter', 'Blockiert und schlägt zurück', 1.2, 15, 2, true, false);
