-- Victory Builder Settings Tabelle
CREATE TABLE IF NOT EXISTS victory_builder_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_name VARCHAR(100) UNIQUE NOT NULL,
    css_code TEXT,
    settings_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_name (setting_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default Entry einfügen
INSERT INTO victory_builder_settings (setting_name, css_code, settings_json) 
VALUES ('default', '', '{}')
ON DUPLICATE KEY UPDATE setting_name = setting_name;
