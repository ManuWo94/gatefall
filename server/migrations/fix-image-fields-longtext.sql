-- Fix: Ändere icon und sprite Felder zu LONGTEXT für große Base64-Bilder
-- Base64-codierte PNG-Bilder können größer als 64KB (TEXT-Limit) sein

-- Skills: icon zu LONGTEXT ändern
ALTER TABLE skills 
MODIFY COLUMN icon LONGTEXT;

-- Enemies: sprite zu LONGTEXT ändern
ALTER TABLE enemies 
MODIFY COLUMN sprite LONGTEXT;

-- Attack Actions: icon zu LONGTEXT ändern (falls vorhanden)
ALTER TABLE attack_actions 
MODIFY COLUMN icon LONGTEXT;

SELECT '✅ Image fields upgraded to LONGTEXT - kann jetzt große PNG-Bilder speichern!' as message;
