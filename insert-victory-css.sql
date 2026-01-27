-- Victory Popup CSS Standard-Design speichern
INSERT INTO victory_builder_settings (setting_name, css_code, settings_json) 
VALUES (
    'default',
    '/* Victory Popup Styles - Standard Design */
.victory-popup {
    width: 520px;
    height: 700px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 16px;
    position: relative;
    border: 3px solid #d4af37;
    box-shadow: 0 0 40px rgba(212, 175, 55, 0.3);
}

.victory-title {
    position: absolute;
    top: 40px;
    left: 50%;
    transform: translateX(-50%);
    font-family: ''Impact'', sans-serif;
    font-size: 64px;
    color: #ffffff;
    text-align: center;
    z-index: 10;
    margin: 0;
    letter-spacing: 14px;
    text-shadow: 0 0 20px rgba(255,255,255,0.5), -3px -3px 0 #d4af37, 3px -3px 0 #d4af37, -3px 3px 0 #d4af37, 3px 3px 0 #d4af37;
}

.victory-subtitle {
    position: absolute;
    top: 120px;
    left: 50%;
    transform: translateX(-50%);
    font-family: ''Arial'', sans-serif;
    font-size: 18px;
    color: #d4af37;
    text-align: center;
    z-index: 10;
    margin: 0;
}

.victory-buttons {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 12px;
    z-index: 10;
}

.victory-btn {
    padding: 12px 32px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: bold;
    color: white;
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.3s;
}

.victory-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.victory-btn.primary {
    background: rgba(59, 130, 246, 0.8);
}

.victory-btn.secondary {
    background: rgba(107, 114, 128, 0.8);
}',
    '{"popupWidth":520,"popupHeight":700,"titleFont":"''Impact'', sans-serif","titleText":"SIEG!","titleSize":64,"titleColor":"#ffffff","titleTop":40,"subtitleText":"Alle Gegner besiegt","subtitleSize":18,"subtitleColor":"#d4af37","subtitleTop":120,"btnPrimary":"#3b82f6","btnSecondary":"#6b7280","buttonsBottom":40}'
)
ON DUPLICATE KEY UPDATE 
    css_code = VALUES(css_code),
    settings_json = VALUES(settings_json),
    updated_at = CURRENT_TIMESTAMP;
