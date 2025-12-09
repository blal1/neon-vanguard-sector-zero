import { PilotId } from '../types';

// Voice Lines Database
export const VOICE_LINES = {
    COMBAT_START: [
        "Engaging hostiles",
        "Target locked",
        "Moving to intercept",
        "Weapons hot",
        "Contact confirmed"
    ],
    LOW_HP: [
        "Hull integrity failing",
        "Systems critical",
        "Taking heavy damage",
        "Shields down",
        "Emergency power"
    ],
    VICTORY: [
        "Targets eliminated",
        "Sector cleared",
        "Mission accomplished",
        "All clear",
        "Returning to base"
    ],
    DEFEAT: [
        "Hull breach detected",
        "Systems failing",
        "Critical damage",
        "Ejecting",
        "Mayday mayday"
    ],
    BOSS_ENCOUNTER: [
        "Large signature detected",
        "Warning: capital class threat",
        "Engaging heavy target",
        "Command, we have a problem"
    ],
    ABILITY_SHIELD: [
        "Shield online",
        "Defensive systems active",
        "Barrier deployed"
    ],
    ABILITY_EMP: [
        "Firing EMP",
        "Disabling targets",
        "Electronic warfare active"
    ],
    ABILITY_OVERCHARGE: [
        "Systems overcharged",
        "Full power",
        "Maximum output"
    ]
};

// Pilot Voice Profiles
interface VoiceProfile {
    pitch: number;
    rate: number;
    voicePreference?: string;
}

export const PILOT_VOICE_PROFILES: Record<PilotId, VoiceProfile> = {
    [PilotId.VANGUARD]: {
        pitch: 0.9,  // Deep, steady
        rate: 0.9,
        voicePreference: 'Male'
    },
    [PilotId.SOLARIS]: {
        pitch: 1.2,  // Higher, faster
        rate: 1.1,
        voicePreference: 'Female'
    },
    [PilotId.HYDRA]: {
        pitch: 1.0,  // Neutral
        rate: 1.0
    },
    [PilotId.WYRM]: {
        pitch: 0.8,  // Very deep, slow
        rate: 0.85,
        voicePreference: 'Male'
    },
    [PilotId.GHOST]: {
        pitch: 1.1,  // Slightly higher, mysterious
        rate: 1.0
    }
};

// Voice Line System
class VoiceLineSystem {
    private synth = window.speechSynthesis;
    private voices: SpeechSynthesisVoice[] = [];
    private enabled = true;
    private supported: boolean;
    private queue: number = 0;
    private maxQueue: number = 3;

    constructor() {
        // Check if Speech Synthesis is supported
        this.supported = 'speechSynthesis' in window;

        if (this.synth && this.supported) {
            this.voices = this.synth.getVoices();
            if (this.voices.length === 0) {
                this.synth.addEventListener('voiceschanged', () => {
                    this.voices = this.synth.getVoices();
                });
            }
        } else {
            console.warn('Web Speech API not supported in this browser');
        }
    }

    isSupported(): boolean {
        return this.supported;
    }

    setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    speak(text: string, pilotId: PilotId) {
        if (!this.enabled || !this.synth || !this.supported || !text) return;

        // Queue management: prevent spam
        if (this.queue >= this.maxQueue) {
            console.log('Voice line queue full, skipping');
            return;
        }

        // Cancel any ongoing speech
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const profile = PILOT_VOICE_PROFILES[pilotId] || PILOT_VOICE_PROFILES[PilotId.VANGUARD];

        // Try to find a suitable voice
        if (this.voices.length > 0) {
            if (profile.voicePreference) {
                const preferredVoice = this.voices.find(v =>
                    v.name.toLowerCase().includes(profile.voicePreference!.toLowerCase())
                );
                if (preferredVoice) {
                    utterance.voice = preferredVoice;
                }
            }
        }

        utterance.pitch = profile.pitch;
        utterance.rate = profile.rate;
        utterance.volume = 0.8;

        // Track queue
        this.queue++;
        utterance.onend = () => {
            this.queue--;
        };
        utterance.onerror = () => {
            this.queue--;
        };

        this.synth.speak(utterance);
    }

    speakRandom(category: keyof typeof VOICE_LINES, pilotId: PilotId) {
        const lines = VOICE_LINES[category];
        if (lines && lines.length > 0) {
            const randomLine = lines[Math.floor(Math.random() * lines.length)];
            this.speak(randomLine, pilotId);
        }
    }

    cancel() {
        if (this.synth) {
            this.synth.cancel();
        }
    }
}

export const voiceLines = new VoiceLineSystem();
