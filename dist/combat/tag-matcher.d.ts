/**
 * TAG MATCHING SYSTEM
 * Bestimmt wie verschiedene Action-Tags miteinander interagieren
 */
import { ActionTag } from './combat-types.js';
export declare class TagMatcher {
    /**
     * Prüft ob eine Aktion eine andere kontern/blockieren kann
     */
    static checkInteraction(attackTags: ActionTag[], defenseTags: ActionTag[]): {
        isCountered: boolean;
        modifier: number;
        message?: string;
    };
    /**
     * Kann eine Aktion unterbrochen werden?
     */
    static canInterrupt(attackTags: ActionTag[], defenseAction: {
        tags: ActionTag[];
    }): boolean;
    /**
     * Kann eine Aktion geblockt werden?
     */
    static canBlock(attackTags: ActionTag[], defenseTags: ActionTag[]): boolean;
    /**
     * Kann man ausweichen?
     */
    static canDodge(attackTags: ActionTag[], defenseTags: ActionTag[]): boolean;
    /**
     * Beschreibung einer Tag-Kombination für UI
     */
    static describeAction(tags: ActionTag[]): string;
}
//# sourceMappingURL=tag-matcher.d.ts.map