/**
 * TAG MATCHING SYSTEM
 * Bestimmt wie verschiedene Action-Tags miteinander interagieren
 */
import { ActionTag, TAG_INTERACTIONS } from './combat-types.js';
export class TagMatcher {
    /**
     * Prüft ob eine Aktion eine andere kontern/blockieren kann
     */
    static checkInteraction(attackTags, defenseTags) {
        let bestModifier = 1.0;
        let bestMessage;
        let isCountered = false;
        // Prüfe alle Tag-Kombinationen
        for (const atkTag of attackTags) {
            for (const defTag of defenseTags) {
                const interaction = TAG_INTERACTIONS.find(i => i.attackTag === atkTag && i.defenseTag === defTag);
                if (interaction) {
                    if (interaction.modifier < bestModifier) {
                        bestModifier = interaction.modifier;
                        bestMessage = interaction.message;
                        if (interaction.modifier === 0) {
                            isCountered = true;
                        }
                    }
                }
                // Umgekehrte Richtung auch prüfen
                const reverseInteraction = TAG_INTERACTIONS.find(i => i.defenseTag === atkTag && i.attackTag === defTag);
                if (reverseInteraction) {
                    if (reverseInteraction.modifier < bestModifier) {
                        bestModifier = reverseInteraction.modifier;
                        bestMessage = reverseInteraction.message;
                        if (reverseInteraction.modifier === 0) {
                            isCountered = true;
                        }
                    }
                }
            }
        }
        return {
            isCountered,
            modifier: bestModifier,
            message: bestMessage
        };
    }
    /**
     * Kann eine Aktion unterbrochen werden?
     */
    static canInterrupt(attackTags, defenseAction) {
        // UNTERBRECHEN kann KANALISIERUNG und RITUAL stoppen
        if (attackTags.includes(ActionTag.UNTERBRECHEN)) {
            return defenseAction.tags.includes(ActionTag.KANALISIERUNG) ||
                defenseAction.tags.includes(ActionTag.RITUAL);
        }
        return false;
    }
    /**
     * Kann eine Aktion geblockt werden?
     */
    static canBlock(attackTags, defenseTags) {
        // Block funktioniert gegen SCHLAG, weniger gut gegen STICH
        // Nicht gegen MAGIE oder DURCHDRINGEND
        if (defenseTags.includes(ActionTag.BLOCK)) {
            return (attackTags.includes(ActionTag.SCHLAG) || attackTags.includes(ActionTag.STICH)) &&
                !attackTags.includes(ActionTag.DURCHDRINGEND);
        }
        return false;
    }
    /**
     * Kann man ausweichen?
     */
    static canDodge(attackTags, defenseTags) {
        // Ausweichen funktioniert gegen PROJEKTIL und SCHLAG/STICH
        // Schlecht gegen FLAECHE
        if (defenseTags.includes(ActionTag.AUSWEICHEN)) {
            return !attackTags.includes(ActionTag.FLAECHE);
        }
        return false;
    }
    /**
     * Beschreibung einer Tag-Kombination für UI
     */
    static describeAction(tags) {
        const descriptions = {
            [ActionTag.SCHLAG]: 'Schlag-Angriff',
            [ActionTag.STICH]: 'Stich-Angriff',
            [ActionTag.MAGIE]: 'Magischer Angriff',
            [ActionTag.SCHATTEN]: 'Schatten-Angriff',
            [ActionTag.KANALISIERUNG]: 'Kanalisierte Aktion',
            [ActionTag.PROJEKTIL]: 'Projektil',
            [ActionTag.FLAECHE]: 'Flächenangriff',
            [ActionTag.DURCHDRINGEND]: 'Durchdringend',
            [ActionTag.EXEKUTION]: 'Exekution',
            [ActionTag.RITUAL]: 'Ritual',
            [ActionTag.BLOCK]: 'Block',
            [ActionTag.AUSWEICHEN]: 'Ausweichen',
            [ActionTag.UNTERBRECHEN]: 'Unterbrechen',
            [ActionTag.SCHILD]: 'Schild'
        };
        return tags.map(tag => descriptions[tag]).join(', ');
    }
}
//# sourceMappingURL=tag-matcher.js.map