-- Migration: Fügt fehlende Gegner und Bosse für B, A, S, SS, SSS Ränge hinzu
-- Level-Ranges:
-- B-Rang: 31-45
-- A-Rang: 46-60
-- S-Rang: 61-80
-- SS-Rang: 81-95
-- SSS-Rang: 96-100

-- ==================== B-RANG (Level 31-45) ====================

-- Normale Gegner
INSERT INTO enemies (id, name, description, level, is_boss, hp, attack, defense, speed, element, gold_reward, exp_reward)
VALUES
('b_rank_1', 'Schattenkrieger', 'Ein dunkler Krieger aus dem Schattenreich', 32, 0, 1800, 95, 70, 55, 'dunkel', 180, 320),
('b_rank_2', 'Frostgigant', 'Riesiger Gigant aus den Eiswüsten', 34, 0, 2000, 100, 80, 45, 'eis', 200, 340),
('b_rank_3', 'Blitzwolf', 'Mit Blitzen umhüllter Wolf', 36, 0, 1600, 110, 60, 75, 'blitz', 190, 360),
('b_rank_4', 'Magma-Elementar', 'Lebende Lava-Kreatur', 38, 0, 2200, 105, 85, 40, 'feuer', 210, 380),
('b_rank_5', 'Gifthydra', 'Dreiköpfige Giftschlange', 40, 0, 1900, 115, 65, 60, 'gift', 220, 400),
('b_rank_6', 'Eisenschrecke', 'Riesige gepanzerte Heuschrecke', 42, 0, 2100, 108, 90, 65, 'neutral', 230, 420),
('b_rank_7', 'Nebelgeist', 'Geist aus dichtem Nebel', 44, 0, 1700, 120, 55, 80, 'geist', 240, 440);

-- Bosse
INSERT INTO enemies (id, name, description, level, is_boss, hp, attack, defense, speed, element, gold_reward, exp_reward)
VALUES
('b_boss_1', 'Frostdrache', 'Mächtiger Drache der Eiswüsten', 35, 1, 6000, 120, 90, 50, 'eis', 800, 1200),
('b_boss_2', 'Schattenlord', 'Herrscher der Schattendimension', 40, 1, 7000, 130, 95, 55, 'dunkel', 900, 1400),
('b_boss_3', 'Giftkönig', 'König der Giftkreaturen', 45, 1, 7500, 135, 100, 60, 'gift', 1000, 1600);

-- ==================== A-RANG (Level 46-60) ====================

-- Normale Gegner
INSERT INTO enemies (id, name, description, level, is_boss, hp, attack, defense, speed, element, gold_reward, exp_reward)
VALUES
('a_rank_1', 'Himmelswächter', 'Engel der himmlischen Garde', 46, 0, 2400, 125, 95, 70, 'licht', 260, 460),
('a_rank_2', 'Abyssritter', 'Ritter aus der Tiefe', 48, 0, 2600, 130, 100, 65, 'dunkel', 270, 480),
('a_rank_3', 'Sturmbestie', 'Kreatur aus purem Sturm', 50, 0, 2300, 140, 85, 85, 'blitz', 280, 500),
('a_rank_4', 'Lavagolem', 'Gigantischer Golem aus Lava', 52, 0, 3000, 135, 110, 50, 'feuer', 290, 520),
('a_rank_5', 'Kristallwächter', 'Wächter aus lebenden Kristallen', 54, 0, 2800, 145, 105, 60, 'neutral', 300, 540),
('a_rank_6', 'Seelenfresser', 'Dämon der Seelen verschlingt', 56, 0, 2500, 150, 90, 75, 'geist', 310, 560),
('a_rank_7', 'Todesklaue', 'Riesige Klaue des Todes', 58, 0, 2700, 155, 95, 70, 'dunkel', 320, 580);

-- Bosse (Level 60 bereits vorhanden)
INSERT INTO enemies (id, name, description, level, is_boss, hp, attack, defense, speed, element, gold_reward, exp_reward)
VALUES
('a_boss_1', 'Höllenfeuer-Dämon', 'Dämon aus den tiefsten Flammen', 50, 1, 9000, 150, 110, 65, 'feuer', 1200, 1800),
('a_boss_2', 'Sturmkönig', 'Herrscher aller Stürme', 55, 1, 10000, 160, 115, 70, 'blitz', 1400, 2000);

-- ==================== S-RANG (Level 61-80) ====================

-- Normale Gegner
INSERT INTO enemies (id, name, description, level, is_boss, hp, attack, defense, speed, element, gold_reward, exp_reward)
VALUES
('s_rank_1', 'Chaos-Ritter', 'Ritter des puren Chaos', 62, 0, 3200, 165, 115, 75, 'chaos', 350, 620),
('s_rank_2', 'Zeitwächter', 'Wächter der Zeit selbst', 64, 0, 3000, 170, 110, 90, 'zeit', 360, 640),
('s_rank_3', 'Netherwurm', 'Gigantischer Wurm aus dem Nether', 66, 0, 3500, 175, 120, 65, 'dunkel', 370, 660),
('s_rank_4', 'Sonnenkrieger', 'Krieger des Sonnenlichts', 68, 0, 3300, 180, 115, 80, 'licht', 380, 680),
('s_rank_5', 'Voidbestie', 'Kreatur aus der Leere', 70, 0, 3600, 185, 125, 70, 'void', 390, 700),
('s_rank_6', 'Dimensionswandler', 'Wesen zwischen Dimensionen', 72, 0, 3400, 190, 120, 85, 'neutral', 400, 720),
('s_rank_7', 'Apokalypse-Reiter', 'Einer der vier Reiter', 74, 0, 3700, 195, 130, 75, 'dunkel', 410, 740),
('s_rank_8', 'Sternenbestie', 'Kreatur aus den Sternen', 76, 0, 3500, 200, 125, 80, 'kosmisch', 420, 760),
('s_rank_9', 'Realitätsbrecher', 'Bricht die Realität selbst', 78, 0, 3800, 205, 135, 70, 'chaos', 430, 780);

-- Bosse
INSERT INTO enemies (id, name, description, level, is_boss, hp, attack, defense, speed, element, gold_reward, exp_reward)
VALUES
('s_boss_1', 'Chaosdrache', 'Drache des puren Chaos', 65, 1, 12000, 180, 130, 75, 'chaos', 1600, 2400),
('s_boss_2', 'Dämonenkönig', 'König aller Dämonen', 72, 1, 14000, 195, 140, 80, 'dunkel', 1800, 2800),
('s_boss_3', 'Voidlord', 'Herrscher der Leere', 78, 1, 15000, 210, 145, 75, 'void', 2000, 3200);

-- ==================== SS-RANG (Level 81-95) ====================

-- Normale Gegner
INSERT INTO enemies (id, name, description, level, is_boss, hp, attack, defense, speed, element, gold_reward, exp_reward)
VALUES
('ss_rank_1', 'Götterkrieger', 'Krieger der alten Götter', 82, 0, 4000, 215, 145, 85, 'göttlich', 450, 820),
('ss_rank_2', 'Ewigkeitsgeist', 'Geist aus der Ewigkeit', 84, 0, 3800, 220, 140, 95, 'zeit', 460, 840),
('ss_rank_3', 'Realitätswächter', 'Wächter der Realität', 86, 0, 4200, 225, 150, 80, 'kosmisch', 470, 860),
('ss_rank_4', 'Schöpfungsdrache', 'Drache der Schöpfung', 88, 0, 4400, 230, 155, 75, 'neutral', 480, 880),
('ss_rank_5', 'Vernichtungsengel', 'Engel der Vernichtung', 90, 0, 4100, 235, 145, 90, 'licht', 490, 900),
('ss_rank_6', 'Urzeitkoloss', 'Koloss aus der Urzeit', 92, 0, 4600, 240, 160, 70, 'erde', 500, 920),
('ss_rank_7', 'Dimensionslord', 'Herr über Dimensionen', 94, 0, 4300, 245, 150, 85, 'void', 510, 940);

-- Bosse
INSERT INTO enemies (id, name, description, level, is_boss, hp, attack, defense, speed, element, gold_reward, exp_reward)
VALUES
('ss_boss_1', 'Göttlicher Drache', 'Drache göttlichen Ursprungs', 85, 1, 18000, 230, 160, 80, 'göttlich', 2500, 4000),
('ss_boss_2', 'Urzeit-Titan', 'Titan aus der Urzeit', 90, 1, 20000, 245, 170, 75, 'erde', 3000, 4500),
('ss_boss_3', 'Schöpfer der Dunkelheit', 'Ursprung aller Dunkelheit', 95, 1, 22000, 260, 175, 85, 'dunkel', 3500, 5000);

-- ==================== SSS-RANG (Level 96-100) ====================

-- Normale Gegner
INSERT INTO enemies (id, name, description, level, is_boss, hp, attack, defense, speed, element, gold_reward, exp_reward)
VALUES
('sss_rank_1', 'Weltenvernichter', 'Zerstörer ganzer Welten', 96, 0, 5000, 260, 170, 90, 'chaos', 550, 960),
('sss_rank_2', 'Kosmischer Drache', 'Drache aus dem Kosmos', 97, 0, 5200, 265, 175, 85, 'kosmisch', 560, 970),
('sss_rank_3', 'Urschöpfer-Bestie', 'Bestie der Urschöpfung', 98, 0, 5400, 270, 180, 80, 'neutral', 570, 980),
('sss_rank_4', 'Allmachtswächter', 'Wächter der Allmacht', 99, 0, 5600, 275, 185, 95, 'göttlich', 580, 990);

-- Bosse
INSERT INTO enemies (id, name, description, level, is_boss, hp, attack, defense, speed, element, gold_reward, exp_reward)
VALUES
('sss_boss_1', 'Gott der Zerstörung', 'Gott der alles vernichtet', 98, 1, 25000, 280, 190, 90, 'chaos', 5000, 6000),
('sss_boss_2', 'Urdrache', 'Der erste aller Drachen', 100, 1, 30000, 300, 200, 85, 'kosmisch', 8000, 8000);

-- Zusammenfassung:
-- B-Rang: 7 normale + 3 Bosse
-- A-Rang: 7 normale + 2 Bosse (+ 1 bereits vorhanden bei 60)
-- S-Rang: 9 normale + 3 Bosse
-- SS-Rang: 7 normale + 3 Bosse
-- SSS-Rang: 4 normale + 2 Bosse
-- TOTAL: 34 normale Gegner + 13 Bosse = 47 neue Einträge
