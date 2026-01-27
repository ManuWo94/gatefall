-- Erweitere skills Tabelle um Rollen, Module und Spezialisierungen
-- Neues System: C-Rang: 1. Spezialisierung | B-Rang: Vertiefung + 2. Spezialisierung | A-Rang: Vertiefung 2

USE gatefall_db;

-- Füge neue Felder hinzu
ALTER TABLE skills
ADD COLUMN roles JSON DEFAULT NULL COMMENT 'Array von Rollen: ["waechter", "assassine", etc.]',
ADD COLUMN module_index INT DEFAULT NULL COMMENT '0=Modul 1 (E-Rang+), 1=Modul 2 (D-Rang+), 2=Modul 3 (C-Rang+)',
ADD COLUMN requires_specialization VARCHAR(100) DEFAULT NULL COMMENT 'Spezialisierung erforderlich (ab C-Rang)',
ADD COLUMN specialization_tier INT DEFAULT 0 COMMENT '0=Basis, 1=C-Rang, 2=B-Rang Vertiefung, 3=A-Rang Vertiefung',
ADD COLUMN is_cross_class BOOLEAN DEFAULT FALSE COMMENT 'Rollenfremde Spezialisierung (ab B-Rang)',
ADD COLUMN role_type ENUM('tank', 'dps', 'support') DEFAULT NULL COMMENT 'Rollentyp für Mechaniken';

-- Index für schnellere Abfragen
CREATE INDEX idx_specialization ON skills(requires_specialization);
CREATE INDEX idx_module ON skills(module_index);
