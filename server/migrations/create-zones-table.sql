-- Create zones table for gate spawning
CREATE TABLE IF NOT EXISTS zones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    city_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    map_x INT NOT NULL,
    map_y INT NOT NULL,
    min_rank VARCHAR(10) NOT NULL DEFAULT 'E',
    max_rank VARCHAR(10) NOT NULL DEFAULT 'D',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
);

-- Add zones for New Port (ID: 19)
INSERT INTO zones (city_id, name, map_x, map_y, min_rank, max_rank) VALUES
(19, 'Hafenviertel', 150, 100, 'E', 'D'),
(19, 'Marktplatz', 400, 200, 'D', 'C'),
(19, 'Industriegebiet', 650, 300, 'C', 'B'),
(19, 'Nordwald', 300, 450, 'B', 'A');

-- Add zones for Kyato (ID: 20)
INSERT INTO zones (city_id, name, map_x, map_y, min_rank, max_rank) VALUES
(20, 'Tempeldistrikt', 200, 150, 'E', 'D'),
(20, 'Samurai-Viertel', 450, 250, 'D', 'C'),
(20, 'Kaiserpalast', 600, 350, 'C', 'B'),
(20, 'Bambuswald', 350, 480, 'B', 'A');
