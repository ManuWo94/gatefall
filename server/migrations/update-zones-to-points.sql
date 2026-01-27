-- Update city_spawn_zones für Point-basierte Gate-Spawns mit Rang-System
-- Migriert von Polygon zu einzelnen Punkten und fügt min_rank/max_rank hinzu

-- 1. Neue Spalten hinzufügen
ALTER TABLE city_spawn_zones 
    ADD COLUMN IF NOT EXISTS map_x INT DEFAULT NULL AFTER spawn_chance,
    ADD COLUMN IF NOT EXISTS map_y INT DEFAULT NULL AFTER map_x,
    ADD COLUMN IF NOT EXISTS min_rank VARCHAR(10) DEFAULT 'E' AFTER max_level,
    ADD COLUMN IF NOT EXISTS max_rank VARCHAR(10) DEFAULT 'S' AFTER min_rank;

-- 2. polygon_points optional machen (für Rückwärtskompatibilität)
ALTER TABLE city_spawn_zones 
    MODIFY COLUMN polygon_points JSON DEFAULT NULL;

-- 3. min_level/max_level entfernen (werden nicht mehr gebraucht - wir nutzen Ränge)
-- Behalten wir erstmal für Migration

-- 4. gate_type wird jetzt zufällig gewählt, aber Spalte behalten für spätere Features
-- spawn_chance bleibt wie es ist

-- Rang-Typen: E, D, C, B, A, S, SS, SSS
