// TTS Service using Web Speech API
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

    // Speak immediately (cancels current text)
    speak(text: string, interrupt: boolean = false) {
        if (!this.enabled || !text) return;

        if (interrupt) {
            this.stop();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
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

    // Add to queue
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

    // Stop speech
    stop() {
        this.synth.cancel();
        this.messageQueue = [];
        this.isSpeaking = false;
        this.currentUtterance = null;
    }

    // Enable/Disable
    setEnabled(enabled: boolean) {
        this.enabled = enabled;
        if (!enabled) {
            this.stop();
        }
    }

    // Set speed (0.1 to 10)
    setRate(rate: number) {
        this.rate = Math.max(0.1, Math.min(10, rate));
    }

    // Set volume (0 to 1)
    setVolume(volume: number) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    // Check if available
    isAvailable(): boolean {
        return 'speechSynthesis' in window;
    }

    // Announce element on focus
    announceFocus(element: HTMLElement) {
        const label = element.getAttribute('aria-label') ||
            element.getAttribute('title') ||
            element.textContent ||
            'Unlabeled element';

        const role = element.getAttribute('role') || element.tagName.toLowerCase();

        this.speak(`${label}. ${this.getRoleDescription(role)}`, true);
    }

    private getRoleDescription(role: string): string {
        const descriptions: Record<string, string> = {
            'button': 'Button',
            'link': 'Link',
            'checkbox': 'Checkbox',
            'radio': 'Radio button',
            'textbox': 'Text field',
            'heading': 'Heading',
            'menuitem': 'Menu item',
            'tab': 'Tab',
        };
        return descriptions[role] || '';
    }
}

// Export singleton
export const tts = new TTSService();

// Shortcuts for game events
export const gameTTS = {
    // Combat
    damage: (amount: number, target: string) => {
        tts.addToQueue(`${amount} damage dealt to ${target}`);
    },

    playerDamage: (amount: number) => {
        tts.speak(`Warning! You lose ${amount} health points`, true);
    },

    enemyDefeated: (enemy: string) => {
        tts.addToQueue(`${enemy} defeated!`);
    },

    abilityUsed: (ability: string) => {
        tts.addToQueue(`Ability ${ability} used`);
    },

    // UI
    screenChange: (screenName: string) => {
        tts.speak(`Screen: ${screenName}`, true);
    },

    notification: (message: string) => {
        tts.speak(message, true);
    },

    achievement: (name: string) => {
        tts.speak(`Achievement unlocked: ${name}!`, true);
    },

    // Combat log
    combatLog: (message: string) => {
        tts.addToQueue(message);
    },

    // Status
    status: (message: string) => {
        tts.addToQueue(message);
    },
};
