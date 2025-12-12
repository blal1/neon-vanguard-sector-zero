import { PilotId } from '../types';

// Voice Line Categories - Expanded for more contextual triggers
export type VoiceLineCategory =
    | 'COMBAT_START'
    | 'LOW_HP'
    | 'NEAR_DEATH'
    | 'VICTORY'
    | 'DEFEAT'
    | 'BOSS_ENCOUNTER'
    | 'ABILITY_SHIELD'
    | 'ABILITY_EMP'
    | 'ABILITY_OVERCHARGE'
    | 'CRIT_HIT'
    | 'COMBO'
    | 'KILL_STREAK'
    | 'COUNTER_ATTACK'
    | 'DAMAGE_TAKEN'
    | 'SHIELD_BREAK'
    | 'ITEM_USE'
    | 'HAZARD'
    | 'STAGE_CLEAR'
    | 'TAUNT';

// Generic fallback voice lines (used when pilot-specific not available)
export const GENERIC_VOICE_LINES: Record<VoiceLineCategory, string[]> = {
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
    NEAR_DEATH: [
        "Critical failure imminent",
        "All systems failing",
        "Hull breach detected",
        "Emergency protocols active",
        "This is bad"
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
    ],
    CRIT_HIT: [
        "Critical hit",
        "Direct hit",
        "Precision strike",
        "Target down"
    ],
    COMBO: [
        "Combo building",
        "Keep it going",
        "Chain attack",
        "Multiple hits confirmed"
    ],
    KILL_STREAK: [
        "Multiple kills",
        "Enemies falling",
        "On a roll",
        "They can't stop us"
    ],
    COUNTER_ATTACK: [
        "Counter successful",
        "Got them",
        "Weak point hit",
        "Opening exploited"
    ],
    DAMAGE_TAKEN: [
        "Taking fire",
        "Hit confirmed",
        "Damage report",
        "We're hit"
    ],
    SHIELD_BREAK: [
        "Shield down",
        "Defenses broken",
        "They're exposed",
        "Now's our chance"
    ],
    ITEM_USE: [
        "Item deployed",
        "Using consumable",
        "Activating",
        "Online"
    ],
    HAZARD: [
        "Environmental hazard",
        "Watch the surroundings",
        "Hazard warning",
        "Stay alert"
    ],
    STAGE_CLEAR: [
        "Area secure",
        "Stage complete",
        "Moving forward",
        "Objectives complete"
    ],
    TAUNT: [
        "Is that all you've got",
        "Come on",
        "Too easy",
        "Next"
    ]
};

// Pilot-specific voice lines with personality
// VANGUARD: Professional, military, by-the-book
const VANGUARD_LINES: Partial<Record<VoiceLineCategory, string[]>> = {
    COMBAT_START: [
        "Vanguard engaging. Weapons free.",
        "Contact confirmed. Moving to intercept.",
        "Hostiles identified. Commencing attack run.",
        "All systems green. Engaging targets."
    ],
    LOW_HP: [
        "Hull integrity compromised. Continuing mission.",
        "Damage sustained. Still operational.",
        "Taking hits but holding steady.",
        "Systems yellow. Adjusting tactics."
    ],
    NEAR_DEATH: [
        "Critical damage. Recommend immediate extraction.",
        "Hull breach imminent. Rerouting power.",
        "All stations report critical. Standing by.",
        "This is Vanguard. Situation critical."
    ],
    VICTORY: [
        "Vanguard returning to base. Mission complete.",
        "Area secured. All hostiles neutralized.",
        "Objectives achieved. Good work, team.",
        "Sector cleared. Awaiting further orders."
    ],
    DEFEAT: [
        "Vanguard going down. Ejecting now.",
        "Systems critical. Mission failed.",
        "Hull breach. Initiating emergency protocols.",
        "This is Vanguard. I'm hit. I'm hit."
    ],
    BOSS_ENCOUNTER: [
        "Large signature on sensors. Capital class threat.",
        "High-value target detected. Engaging.",
        "Command, encountering heavy resistance.",
        "Boss-class enemy. Requesting backup."
    ],
    CRIT_HIT: [
        "Direct hit on target.",
        "Confirmed kill zone.",
        "Precision strike successful.",
        "Target neutralized."
    ],
    COMBO: [
        "Maintaining fire superiority.",
        "Sustained damage output.",
        "Keeping pressure on.",
        "Attack pattern holding."
    ],
    KILL_STREAK: [
        "Multiple hostiles down.",
        "Targets eliminated in sequence.",
        "Efficient engagement.",
        "Area denial effective."
    ],
    DAMAGE_TAKEN: [
        "Taking incoming fire.",
        "Damage to forward shields.",
        "Impact registered.",
        "Adjusting defensive posture."
    ],
    ITEM_USE: [
        "Deploying tactical asset.",
        "Consumable activated.",
        "Support systems online.",
        "Asset deployed."
    ],
    TAUNT: [
        "Standard protocols will suffice.",
        "Threat assessment: minimal.",
        "Training exercise difficulty.",
        "By the book."
    ]
};

// SOLARIS: Energetic, confident, competitive
const SOLARIS_LINES: Partial<Record<VoiceLineCategory, string[]>> = {
    COMBAT_START: [
        "Let's light 'em up!",
        "Solaris is in the house!",
        "Time to show off!",
        "Ooh, new targets! Fun!"
    ],
    LOW_HP: [
        "Okay, that actually hurt.",
        "Hey, watch the paint job!",
        "Rude! Totally rude!",
        "Getting a little toasty in here."
    ],
    NEAR_DEATH: [
        "Okay okay okay, not good!",
        "Someone call my mechanic!",
        "This wasn't in the brochure!",
        "Fiiine, I'll take this seriously now!"
    ],
    VICTORY: [
        "And THAT'S how it's done!",
        "Too fast, too fabulous!",
        "Did you see that?! Amazing!",
        "Solaris wins again! Shocker!"
    ],
    DEFEAT: [
        "No way! This isn't happening!",
        "Ugh, so embarrassing!",
        "I demand a rematch!",
        "Tell them I looked cool..."
    ],
    BOSS_ENCOUNTER: [
        "Ooh, big scary! I'm shaking!",
        "Finally, a real challenge!",
        "Boss time! Let's dance!",
        "You versus me? Bad odds for you!"
    ],
    CRIT_HIT: [
        "YES! Nailed it!",
        "Did you SEE that?!",
        "Boom! Headshot!",
        "Too good! I'm too good!"
    ],
    COMBO: [
        "Keep it going keep it going!",
        "Combo city, baby!",
        "They can't touch me!",
        "I'm on FIRE! Literally!"
    ],
    KILL_STREAK: [
        "Who's counting? I'm counting!",
        "Can't stop won't stop!",
        "They're dropping like flies!",
        "High score incoming!"
    ],
    DAMAGE_TAKEN: [
        "Hey! Not the face!",
        "That's gonna leave a mark.",
        "Ow ow ow ow!",
        "Okay now I'm mad!"
    ],
    ITEM_USE: [
        "Power up!",
        "Let's spice things up!",
        "Ooh, shiny!",
        "Time for the good stuff!"
    ],
    TAUNT: [
        "Is this your first day?",
        "Yawn. Try harder.",
        "My grandma flies faster than you!",
        "Boooring!"
    ]
};

// HYDRA: Calm, analytical, observant
const HYDRA_LINES: Partial<Record<VoiceLineCategory, string[]>> = {
    COMBAT_START: [
        "Analyzing threat vectors.",
        "Combat scenario initiated.",
        "Processing tactical data.",
        "Engaging calculated response."
    ],
    LOW_HP: [
        "Structural integrity below optimal.",
        "Damage assessment in progress.",
        "Efficiency reduced. Compensating.",
        "Hull stress detected."
    ],
    NEAR_DEATH: [
        "Critical threshold exceeded.",
        "Failure probability: high.",
        "Systems approaching cascade failure.",
        "Recommend strategic withdrawal."
    ],
    VICTORY: [
        "Outcome: as predicted.",
        "Combat data archived.",
        "Threat eliminated. Efficient.",
        "Analysis complete. Victory confirmed."
    ],
    DEFEAT: [
        "Unexpected variable encountered.",
        "Recalculating was insufficient.",
        "Data suggests... error.",
        "Logging failure for analysis."
    ],
    BOSS_ENCOUNTER: [
        "High-priority target. Fascinating.",
        "Complex threat detected. Analyzing.",
        "Significant hostile presence.",
        "Adjusting algorithms for heavy engagement."
    ],
    CRIT_HIT: [
        "Vulnerability exploited.",
        "Optimal strike achieved.",
        "Critical damage confirmed.",
        "Weak point penetrated."
    ],
    COMBO: [
        "Sequential damage accumulating.",
        "Pattern recognition optimal.",
        "Sustained engagement effective.",
        "Damage multiplication active."
    ],
    KILL_STREAK: [
        "Elimination efficiency rising.",
        "Multiple terminations logged.",
        "Combat performance optimal.",
        "Sequential neutralization complete."
    ],
    DAMAGE_TAKEN: [
        "Impact registered.",
        "Damage logged for analysis.",
        "Structural stress noted.",
        "Adjusting defensive protocols."
    ],
    ITEM_USE: [
        "Resource deployment initiated.",
        "Tactical asset activated.",
        "Optimal usage timing.",
        "Consumable engaged."
    ],
    TAUNT: [
        "Your tactics are... elementary.",
        "Predictable behavior noted.",
        "Insufficient threat level.",
        "This data is uninteresting."
    ]
};

// WYRM: Gruff, intimidating, veteran
const WYRM_LINES: Partial<Record<VoiceLineCategory, string[]>> = {
    COMBAT_START: [
        "Let's get this over with.",
        "Time to work.",
        "Wyrm inbound. Clear the area.",
        "Hostile contact. Engaging."
    ],
    LOW_HP: [
        "Just a scratch.",
        "I've had worse.",
        "Armor holding... mostly.",
        "They'll pay for that."
    ],
    NEAR_DEATH: [
        "Not going down easy.",
        "Come on... hold together.",
        "This old bird's seen worse.",
        "I don't quit."
    ],
    VICTORY: [
        "That's done.",
        "Hostiles eliminated.",
        "Another day, another fight.",
        "Moving on."
    ],
    DEFEAT: [
        "So this is how it ends...",
        "Should've seen that coming.",
        "Tell 'em Wyrm went down fighting.",
        "No regrets."
    ],
    BOSS_ENCOUNTER: [
        "Big target. Big mistake.",
        "Finally, something worth my time.",
        "You want a fight? You got one.",
        "Heavy contact. Bring it."
    ],
    CRIT_HIT: [
        "That one hurt.",
        "Feel that?",
        "Right where it counts.",
        "Down you go."
    ],
    COMBO: [
        "Keep 'em coming.",
        "Not done yet.",
        "One after another.",
        "Like old times."
    ],
    KILL_STREAK: [
        "Lost count. Don't care.",
        "They keep coming, I keep shooting.",
        "Bodies stacking up.",
        "Who's next?"
    ],
    DAMAGE_TAKEN: [
        "That tickled.",
        "Is that all?",
        "Hit me again. I dare you.",
        "Hmph."
    ],
    ITEM_USE: [
        "Using this.",
        "Field repair.",
        "Getting the job done.",
        "Tools of the trade."
    ],
    TAUNT: [
        "Pathetic.",
        "Back in my day, enemies were tougher.",
        "Not impressed.",
        "Waste of ammo."
    ]
};

// GHOST: Mysterious, minimal, cryptic
const GHOST_LINES: Partial<Record<VoiceLineCategory, string[]>> = {
    COMBAT_START: [
        "Engaging.",
        "Contact.",
        "...",
        "Beginning."
    ],
    LOW_HP: [
        "Damaged.",
        "Continuing.",
        "Minor setback.",
        "..."
    ],
    NEAR_DEATH: [
        "...",
        "Fading.",
        "Almost... there.",
        "Not yet."
    ],
    VICTORY: [
        "Done.",
        "Cleared.",
        "Moving on.",
        "..."
    ],
    DEFEAT: [
        "...",
        "Vanishing.",
        "Into the void.",
        "..."
    ],
    BOSS_ENCOUNTER: [
        "Interesting.",
        "A challenge.",
        "...",
        "Finally."
    ],
    CRIT_HIT: [
        "Precise.",
        "Clean.",
        "...",
        "Yes."
    ],
    COMBO: [
        "Flow.",
        "Rhythm.",
        "...",
        "Continue."
    ],
    KILL_STREAK: [
        "One by one.",
        "Shadows fall.",
        "...",
        "Efficient."
    ],
    DAMAGE_TAKEN: [
        "...",
        "Felt that.",
        "Hmm.",
        "Noted."
    ],
    ITEM_USE: [
        "Activating.",
        "Using.",
        "...",
        "Ready."
    ],
    TAUNT: [
        "...",
        "Disappointing.",
        "Is that it?",
        "..."
    ]
};

// Compiled pilot voice lines database
export const PILOT_VOICE_LINES: Record<PilotId, Partial<Record<VoiceLineCategory, string[]>>> = {
    [PilotId.VANGUARD]: VANGUARD_LINES,
    [PilotId.SOLARIS]: SOLARIS_LINES,
    [PilotId.HYDRA]: HYDRA_LINES,
    [PilotId.WYRM]: WYRM_LINES,
    [PilotId.GHOST]: GHOST_LINES
};

// Pilot Voice Profiles (unchanged from original)
interface VoiceProfile {
    pitch: number;
    rate: number;
    voicePreference?: string;
    talkFrequency: number; // 0-1, chance to actually speak
}

export const PILOT_VOICE_PROFILES: Record<PilotId, VoiceProfile> = {
    [PilotId.VANGUARD]: {
        pitch: 0.9,
        rate: 0.9,
        voicePreference: 'Male',
        talkFrequency: 0.7
    },
    [PilotId.SOLARIS]: {
        pitch: 1.2,
        rate: 1.1,
        voicePreference: 'Female',
        talkFrequency: 0.9
    },
    [PilotId.HYDRA]: {
        pitch: 1.0,
        rate: 0.95,
        talkFrequency: 0.5
    },
    [PilotId.WYRM]: {
        pitch: 0.75,
        rate: 0.85,
        voicePreference: 'Male',
        talkFrequency: 0.65
    },
    [PilotId.GHOST]: {
        pitch: 1.05,
        rate: 0.9,
        talkFrequency: 0.3 // Very rarely speaks
    }
};

// Category cooldowns in milliseconds (prevents spam)
const CATEGORY_COOLDOWNS: Partial<Record<VoiceLineCategory, number>> = {
    CRIT_HIT: 5000,
    COMBO: 8000,
    KILL_STREAK: 6000,
    DAMAGE_TAKEN: 4000,
    TAUNT: 15000,
    HAZARD: 10000,
    ITEM_USE: 3000
};

// Priority levels for voice lines (higher = can interrupt)
const CATEGORY_PRIORITY: Record<VoiceLineCategory, number> = {
    COMBAT_START: 5,
    LOW_HP: 7,
    NEAR_DEATH: 10, // Highest priority
    VICTORY: 9,
    DEFEAT: 9,
    BOSS_ENCOUNTER: 8,
    ABILITY_SHIELD: 4,
    ABILITY_EMP: 4,
    ABILITY_OVERCHARGE: 4,
    CRIT_HIT: 3,
    COMBO: 2,
    KILL_STREAK: 3,
    COUNTER_ATTACK: 4,
    DAMAGE_TAKEN: 2,
    SHIELD_BREAK: 5,
    ITEM_USE: 3,
    HAZARD: 6,
    STAGE_CLEAR: 8,
    TAUNT: 1
};

// Voice Line System with cooldowns and priorities
class VoiceLineSystem {
    private synth: SpeechSynthesis | null = null;
    private voices: SpeechSynthesisVoice[] = [];
    private enabled = true;
    private supported: boolean;
    private queue: number = 0;
    private maxQueue: number = 3;
    private lastSpokenCategory: Map<VoiceLineCategory, number> = new Map();
    private currentPriority: number = 0;
    private volume: number = 0.8;

    constructor() {
        this.supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

        if (this.supported) {
            this.synth = window.speechSynthesis;
            this.voices = this.synth?.getVoices() || [];
            if (this.voices.length === 0 && this.synth) {
                this.synth.addEventListener('voiceschanged', () => {
                    this.voices = this.synth?.getVoices() || [];
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

    setVolume(vol: number) {
        this.volume = Math.max(0, Math.min(1, vol));
    }

    private canSpeak(category: VoiceLineCategory, pilotId: PilotId): boolean {
        // Check if on cooldown
        const cooldown = CATEGORY_COOLDOWNS[category] || 0;
        const lastSpoken = this.lastSpokenCategory.get(category) || 0;
        if (Date.now() - lastSpoken < cooldown) {
            return false;
        }

        // Check talk frequency (personality-based chance to speak)
        const profile = PILOT_VOICE_PROFILES[pilotId];
        if (Math.random() > profile.talkFrequency) {
            // Some categories always speak regardless of frequency
            const alwaysSpeak: VoiceLineCategory[] = ['COMBAT_START', 'VICTORY', 'DEFEAT', 'BOSS_ENCOUNTER', 'NEAR_DEATH'];
            if (!alwaysSpeak.includes(category)) {
                return false;
            }
        }

        return true;
    }

    speak(text: string, pilotId: PilotId, category?: VoiceLineCategory) {
        if (!this.enabled || !this.synth || !this.supported || !text) return;

        // Priority check
        const priority = category ? CATEGORY_PRIORITY[category] : 5;

        // Queue management
        if (this.queue >= this.maxQueue && priority <= this.currentPriority) {
            return;
        }

        // If higher priority, cancel current speech
        if (priority > this.currentPriority && this.queue > 0) {
            this.synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const profile = PILOT_VOICE_PROFILES[pilotId] || PILOT_VOICE_PROFILES[PilotId.VANGUARD];

        // Try to find a suitable voice
        if (this.voices.length > 0 && profile.voicePreference) {
            const preferredVoice = this.voices.find(v =>
                v.name.toLowerCase().includes(profile.voicePreference!.toLowerCase())
            );
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
        }

        utterance.pitch = profile.pitch;
        utterance.rate = profile.rate;
        utterance.volume = this.volume;

        this.queue++;
        this.currentPriority = priority;

        if (category) {
            this.lastSpokenCategory.set(category, Date.now());
        }

        utterance.onend = () => {
            this.queue--;
            if (this.queue === 0) {
                this.currentPriority = 0;
            }
        };
        utterance.onerror = () => {
            this.queue--;
            if (this.queue === 0) {
                this.currentPriority = 0;
            }
        };

        this.synth.speak(utterance);
    }

    speakRandom(category: VoiceLineCategory, pilotId: PilotId) {
        if (!this.canSpeak(category, pilotId)) {
            return;
        }

        // Try pilot-specific lines first
        const pilotLines = PILOT_VOICE_LINES[pilotId]?.[category];
        const genericLines = GENERIC_VOICE_LINES[category];

        const lines = (pilotLines && pilotLines.length > 0) ? pilotLines : genericLines;

        if (lines && lines.length > 0) {
            const randomLine = lines[Math.floor(Math.random() * lines.length)];
            this.speak(randomLine, pilotId, category);
        }
    }

    // Alias for speakRandom for backward compatibility
    speakLine(category: VoiceLineCategory, pilotId: PilotId) {
        this.speakRandom(category, pilotId);
    }

    stop() {
        if (this.synth) {
            this.synth.cancel();
            this.queue = 0;
            this.currentPriority = 0;
        }
    }

    // Alias for stop for backward compatibility
    cancel() {
        this.stop();
    }
}

export const voiceLines = new VoiceLineSystem();

// Backward compatibility: export VOICE_LINES for any existing imports
export const VOICE_LINES = GENERIC_VOICE_LINES;
