# Player Sprite Setup

## Schritt 1: Bild hochladen

Das Player-Sprite-Bild muss manuell hochgeladen werden:

1. Speichere das bereitgestellte Charakter-Bild
2. Lade es hoch nach: `/workspaces/gatefall/public/assets/sprites/player.png`
3. Hard-Reload im Browser (Strg+Shift+R)

## Technische Details

- **Pfad:** `/workspaces/gatefall/public/assets/sprites/player.png`
- **URL im Browser:** `http://localhost:3000/public/assets/sprites/player.png`
- **Format:** PNG mit transparentem Hintergrund
- **Empfohlene Größe:** 400-600px Höhe

## Verwendung

Das Bild wird automatisch für alle Player-Sprites verwendet:
- Wächter (Tank)
- Jäger (DPS)
- Magier (Caster)

Jedes bekommt einen subtilen bläulichen Glow-Effekt überlagert.

## Fallback

Wenn das Bild nicht gefunden wird, wird ein CSS-basierter Placeholder mit blauem Glow angezeigt.
