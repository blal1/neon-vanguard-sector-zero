// Service TTS utilisant Web Speech API
class TTSService {
    private synth: SpeechSynthesis;
    private isSpeaking: boolean = false;
    private messageQueue: string[] = [];
    private enabled: boolean = true;
    private rate: number = 1.0;
    private volume: number = 1.0;
    private currentUtterance: SpeechSynthesisUtterance | null = null;

    constructor() {
        this.synth = window.speechSynthesis;
    }

    // Parler immédiatement (annule le texte en cours)
    speak(text: string, interrupt: boolean = false) {
        if (!this.enabled || !text) return;

        if (interrupt) {
            this.stop();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.rate = this.rate;
        utterance.volume = this.volume;

        utterance.onstart = () => {
            this.isSpeaking = true;
            this.currentUtterance = utterance;
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this.currentUtterance = null;
            this.processQueueInternal();
        };

        utterance.onerror = (event) => {
            console.error('TTS Error:', event);
            this.isSpeaking = false;
            this.currentUtterance = null;
        };

        this.synth.speak(utterance);
    }

    // Ajouter à la file d'attente
    addToQueue(text: string) {
        if (!this.enabled || !text) return;

        this.messageQueue.push(text);

        if (!this.isSpeaking) {
            this.processQueueInternal();
        }
    }

    private processQueueInternal() {
        if (this.messageQueue.length === 0) return;

        const text = this.messageQueue.shift()!;
        this.speak(text, false);
    }

    // Arrêter la parole
    stop() {
        this.synth.cancel();
        this.messageQueue = [];
        this.isSpeaking = false;
        this.currentUtterance = null;
    }

    // Activer/Désactiver
    setEnabled(enabled: boolean) {
        this.enabled = enabled;
        if (!enabled) {
            this.stop();
        }
    }

    // Régler la vitesse (0.1 à 10)
    setRate(rate: number) {
        this.rate = Math.max(0.1, Math.min(10, rate));
    }

    // Régler le volume (0 à 1)
    setVolume(volume: number) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    // Check si disponible
    isAvailable(): boolean {
        return 'speechSynthesis' in window;
    }

    // Annoncer un élément au focus
    announceFocus(element: HTMLElement) {
        const label = element.getAttribute('aria-label') ||
            element.getAttribute('title') ||
            element.textContent ||
            'Élément sans label';

        const role = element.getAttribute('role') || element.tagName.toLowerCase();

        this.speak(`${label}. ${this.getRoleDescription(role)}`, true);
    }

    private getRoleDescription(role: string): string {
        const descriptions: Record<string, string> = {
            'button': 'Bouton',
            'link': 'Lien',
            'checkbox': 'Case à cocher',
            'radio': 'Bouton radio',
            'textbox': 'Zone de texte',
            'heading': 'Titre',
            'menuitem': 'Élément de menu',
            'tab': 'Onglet',
        };
        return descriptions[role] || '';
    }
}

// Export singleton
export const tts = new TTSService();

// Raccourcis pour événements de jeu
export const gameTTS = {
    // Combat
    damage: (amount: number, target: string) => {
        tts.addToQueue(`${amount} points de dégâts infligés à ${target}`);
    },

    playerDamage: (amount: number) => {
        tts.speak(`Attention! Vous perdez ${amount} points de vie`, true);
    },

    enemyDefeated: (enemy: string) => {
        tts.addToQueue(`${enemy} vaincu!`);
    },

    abilityUsed: (ability: string) => {
        tts.addToQueue(`Capacité ${ability} utilisée`);
    },

    // UI
    screenChange: (screenName: string) => {
        tts.speak(`Écran ${screenName}`, true);
    },

    notification: (message: string) => {
        tts.speak(message, true);
    },

    achievement: (name: string) => {
        tts.speak(`Succès débloqué: ${name}!`, true);
    },

    // Combat log
    combatLog: (message: string) => {
        tts.addToQueue(message);
    },

    // Statut
    status: (message: string) => {
        tts.addToQueue(message);
    },
};
