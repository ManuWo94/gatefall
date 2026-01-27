-- Migration: Update Gates System für Global Spawn
-- Änderungen:
-- 1. player_id kann NULL sein (für globale Gates)
-- 2. Foreign Key verweist auf city_spawn_zones statt city_zones
-- 3. gate_rank erweitert um E und SSS
-- 4. gate_type angepasst (normal, elite, boss, raid, dungeon)

-- player_id kann NULL sein
ALTER TABLE gates MODIFY player_id INT NULL;

-- Foreign Key Update: city_zones -> city_spawn_zones
ALTER TABLE gates DROP FOREIGN KEY gates_ibfk_2;
ALTER TABLE gates ADD CONSTRAINT gates_ibfk_2 
    FOREIGN KEY (zone_id) REFERENCES city_spawn_zones(id) ON DELETE SET NULL;

-- gate_rank erweitern (E-SSS)
ALTER TABLE gates MODIFY gate_rank 
    ENUM('E','D','C','B','A','S','SS','SSS') NOT NULL;

-- gate_type anpassen
ALTER TABLE gates MODIFY gate_type 
    ENUM('normal','elite','boss','raid','dungeon') DEFAULT 'normal';

-- closed_at Feld hinzufügen (für Boss-Defeat)
ALTER TABLE gates ADD COLUMN closed_at TIMESTAMP NULL DEFAULT NULL AFTER completed_at;

-- Status erweitern
ALTER TABLE gates MODIFY status 
    ENUM('active','in_progress','completed','expired','cleared') DEFAULT 'active';
