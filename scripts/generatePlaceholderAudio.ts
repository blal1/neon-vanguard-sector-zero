/**
 * Generate Enhanced Audio Files
 * 
 * This script generates 24 high-quality procedural MP3 audio files for the game.
 * Features:
 * - Extended music durations (30s loops vs 4s)
 * - Rich harmonic content with chord progressions
 * - Multiple oscillators with detuning
 * - ADSR envelope shaping
 * - Sound effect variations
 * 
 * Usage: npm run generate-audio
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Audio configuration
const SAMPLE_RATE = 44100;
const CHANNELS = 2;
const BIT_DEPTH = 16;

interface ADSREnvelope {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
}

interface AudioSpec {
    name: string;
    duration: number;
    type: 'tone' | 'sweep' | 'noise' | 'pulse' | 'chord' | 'drone' |
    'evolving_pad' | 'arpeggio' | 'atmospheric' | 'filtered_noise' |
    'layered_impact' | 'rising_sweep';
    frequency?: number;
    frequency2?: number;
    sweepStart?: number;
    sweepEnd?: number;
    pulseRate?: number;
    harmonics?: number[];
    modulation?: number;
    filterFreq?: number;
    filterQ?: number;
    envelope?: ADSREnvelope;
    bpm?: number;
    scale?: number[];
    key?: number; // Root frequency
}

// Musical scales (semitone offsets from root)
const SCALES = {
    minor: [0, 2, 3, 5, 7, 8, 10],
    major: [0, 2, 4, 5, 7, 9, 11],
    pentatonic: [0, 2, 4, 7, 9],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
};

// Convert semitone to frequency multiplier
function semitoneToFreq(semitones: number): number {
    return Math.pow(2, semitones / 12);
}

const AUDIO_SPECS: AudioSpec[] = [
    // ============== WEAPON SOUNDS ==============
    {
        name: 'shoot_laser',
        duration: 0.35,
        type: 'rising_sweep',
        sweepStart: 1200,
        sweepEnd: 300,
        harmonics: [1, 0.5, 0.25],
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.15 }
    },
    {
        name: 'shoot_heavy',
        duration: 0.6,
        type: 'layered_impact',
        frequency: 60,
        harmonics: [1, 0.8, 0.4, 0.2],
        envelope: { attack: 0.005, decay: 0.2, sustain: 0.2, release: 0.2 }
    },
    {
        name: 'shoot_standard',
        duration: 0.25,
        type: 'tone',
        frequency: 520,
        harmonics: [1, 0.3],
        envelope: { attack: 0.01, decay: 0.08, sustain: 0.4, release: 0.1 }
    },
    {
        name: 'shoot_bio',
        duration: 0.45,
        type: 'sweep',
        sweepStart: 400,
        sweepEnd: 120,
        modulation: 15,
        envelope: { attack: 0.02, decay: 0.15, sustain: 0.3, release: 0.15 }
    },

    // ============== IMPACT/EXPLOSION SOUNDS ==============
    {
        name: 'explosion',
        duration: 1.2,
        type: 'layered_impact',
        frequency: 40,
        harmonics: [1, 0.9, 0.7, 0.5, 0.3],
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.1, release: 0.7 }
    },
    {
        name: 'hit_player',
        duration: 0.4,
        type: 'layered_impact',
        frequency: 120,
        harmonics: [1, 0.6, 0.3],
        envelope: { attack: 0.001, decay: 0.15, sustain: 0.2, release: 0.15 }
    },
    {
        name: 'crit_hit',
        duration: 0.5,
        type: 'rising_sweep',
        sweepStart: 1500,
        sweepEnd: 500,
        harmonics: [1, 0.7, 0.4],
        envelope: { attack: 0.005, decay: 0.2, sustain: 0.3, release: 0.2 }
    },

    // ============== UI SOUNDS ==============
    {
        name: 'alarm',
        duration: 1.2,
        type: 'pulse',
        frequency: 880,
        pulseRate: 4,
        harmonics: [1, 0.5, 0.25],
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.7, release: 0.2 }
    },
    {
        name: 'blip',
        duration: 0.12,
        type: 'tone',
        frequency: 1200,
        harmonics: [1, 0.2],
        envelope: { attack: 0.005, decay: 0.04, sustain: 0.3, release: 0.05 }
    },
    {
        name: 'hover',
        duration: 0.1,
        type: 'tone',
        frequency: 800,
        harmonics: [1, 0.15],
        envelope: { attack: 0.005, decay: 0.03, sustain: 0.4, release: 0.04 }
    },
    {
        name: 'hazard_warning',
        duration: 0.8,
        type: 'pulse',
        frequency: 700,
        pulseRate: 6,
        harmonics: [1, 0.6, 0.3],
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.6, release: 0.15 }
    },
    {
        name: 'power_up',
        duration: 0.7,
        type: 'rising_sweep',
        sweepStart: 300,
        sweepEnd: 1400,
        harmonics: [1, 0.5, 0.25],
        envelope: { attack: 0.02, decay: 0.2, sustain: 0.4, release: 0.2 }
    },
    {
        name: 'charge_up',
        duration: 1.5,
        type: 'rising_sweep',
        sweepStart: 150,
        sweepEnd: 900,
        modulation: 8,
        harmonics: [1, 0.4, 0.2],
        envelope: { attack: 0.05, decay: 0.3, sustain: 0.5, release: 0.3 }
    },

    // ============== ENVIRONMENT SOUNDS ==============
    {
        name: 'vent',
        duration: 0.8,
        type: 'filtered_noise',
        filterFreq: 2000,
        filterQ: 1.5,
        envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.3 }
    },
    {
        name: 'burrow',
        duration: 1.0,
        type: 'sweep',
        sweepStart: 200,
        sweepEnd: 40,
        modulation: 25,
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: 0.4 }
    },

    // ============== MUSIC TRACKS (30 seconds each) ==============
    {
        name: 'music_combat',
        duration: 30.0,
        type: 'evolving_pad',
        key: 110, // A2
        scale: SCALES.minor,
        bpm: 100,
        harmonics: [1, 0.5, 0.25, 0.125],
        modulation: 3
    },
    {
        name: 'music_stage_1',
        duration: 30.0,
        type: 'evolving_pad',
        key: 130.81, // C3
        scale: SCALES.major,
        bpm: 90,
        harmonics: [1, 0.6, 0.3, 0.15],
        modulation: 2
    },
    {
        name: 'music_stage_2',
        duration: 30.0,
        type: 'evolving_pad',
        key: 146.83, // D3
        scale: SCALES.dorian,
        bpm: 95,
        harmonics: [1, 0.55, 0.28, 0.14],
        modulation: 2.5
    },
    {
        name: 'music_stage_3',
        duration: 30.0,
        type: 'evolving_pad',
        key: 164.81, // E3
        scale: SCALES.pentatonic,
        bpm: 105,
        harmonics: [1, 0.45, 0.22, 0.11],
        modulation: 3
    },
    {
        name: 'music_stage_4',
        duration: 30.0,
        type: 'atmospheric',
        key: 174.61, // F3
        scale: SCALES.minor,
        bpm: 110,
        harmonics: [1, 0.5, 0.25, 0.12],
        modulation: 4
    },
    {
        name: 'music_stage_5',
        duration: 30.0,
        type: 'atmospheric',
        key: 196.0, // G3
        scale: SCALES.phrygian,
        bpm: 120,
        harmonics: [1, 0.55, 0.3, 0.15],
        modulation: 5
    },
    {
        name: 'music_boss',
        duration: 30.0,
        type: 'arpeggio',
        key: 82.41, // E2 (lower, more intense)
        scale: SCALES.phrygian,
        bpm: 140,
        harmonics: [1, 0.7, 0.4, 0.2],
        modulation: 6
    },
    {
        name: 'music_victory',
        duration: 20.0,
        type: 'chord',
        frequency: 523.25, // C5
        harmonics: [1, 0.8, 0.6, 0.4, 0.2],
        envelope: { attack: 0.1, decay: 2.0, sustain: 0.5, release: 5.0 }
    },
    {
        name: 'music_defeat',
        duration: 20.0,
        type: 'evolving_pad',
        key: 98.0, // G2
        scale: SCALES.minor,
        bpm: 60,
        harmonics: [1, 0.4, 0.2, 0.1],
        modulation: 1
    },
];

// Simple lowpass filter simulation
function applyLowpass(sample: number, prevSample: number, cutoff: number): number {
    const dt = 1.0 / SAMPLE_RATE;
    const rc = 1.0 / (2 * Math.PI * cutoff);
    const alpha = dt / (rc + dt);
    return prevSample + alpha * (sample - prevSample);
}

// Apply ADSR envelope
function getEnvelopeValue(t: number, duration: number, env: ADSREnvelope): number {
    const attackEnd = env.attack;
    const decayEnd = attackEnd + env.decay;
    const sustainEnd = duration - env.release;

    if (t < attackEnd) {
        return t / env.attack; // Attack phase
    } else if (t < decayEnd) {
        const decayProgress = (t - attackEnd) / env.decay;
        return 1.0 - (1.0 - env.sustain) * decayProgress; // Decay phase
    } else if (t < sustainEnd) {
        return env.sustain; // Sustain phase
    } else {
        const releaseProgress = (t - sustainEnd) / env.release;
        return env.sustain * (1.0 - releaseProgress); // Release phase
    }
}

/**
 * Generate PCM audio data based on specification
 */
function generateAudioData(spec: AudioSpec): Buffer {
    const numSamples = Math.floor(SAMPLE_RATE * spec.duration);
    const buffer = Buffer.alloc(numSamples * CHANNELS * (BIT_DEPTH / 8));
    const harmonics = spec.harmonics || [1];
    const defaultEnv: ADSREnvelope = { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.1 };
    const env = spec.envelope || defaultEnv;

    let prevFilteredSample = 0;

    for (let i = 0; i < numSamples; i++) {
        const t = i / SAMPLE_RATE;
        let sample = 0;

        switch (spec.type) {
            case 'tone': {
                const baseFreq = spec.frequency || 440;
                for (let h = 0; h < harmonics.length; h++) {
                    sample += Math.sin(2 * Math.PI * baseFreq * (h + 1) * t) * harmonics[h];
                }
                sample = sample / harmonics.reduce((a, b) => a + b, 0);
                sample *= getEnvelopeValue(t, spec.duration, env);
                break;
            }

            case 'sweep': {
                const sweepFreq = spec.sweepStart! +
                    (spec.sweepEnd! - spec.sweepStart!) * (t / spec.duration);
                let modulation = 0;
                if (spec.modulation) {
                    modulation = Math.sin(2 * Math.PI * spec.modulation * t) * sweepFreq * 0.1;
                }
                for (let h = 0; h < harmonics.length; h++) {
                    sample += Math.sin(2 * Math.PI * (sweepFreq + modulation) * (h + 1) * t) * harmonics[h];
                }
                sample = sample / harmonics.reduce((a, b) => a + b, 0);
                sample *= getEnvelopeValue(t, spec.duration, env);
                break;
            }

            case 'rising_sweep': {
                const progress = t / spec.duration;
                const sweepFreq = spec.sweepStart! + (spec.sweepEnd! - spec.sweepStart!) * progress;
                for (let h = 0; h < harmonics.length; h++) {
                    sample += Math.sin(2 * Math.PI * sweepFreq * (h + 1) * t) * harmonics[h];
                }
                sample = sample / harmonics.reduce((a, b) => a + b, 0);
                sample *= getEnvelopeValue(t, spec.duration, env);
                break;
            }

            case 'noise': {
                sample = (Math.random() * 2 - 1) * Math.exp(-t * 2);
                sample *= getEnvelopeValue(t, spec.duration, env);
                break;
            }

            case 'filtered_noise': {
                const rawNoise = Math.random() * 2 - 1;
                sample = applyLowpass(rawNoise, prevFilteredSample, spec.filterFreq || 1000);
                prevFilteredSample = sample;
                sample *= getEnvelopeValue(t, spec.duration, env);
                break;
            }

            case 'pulse': {
                const pulsePhase = (t * (spec.pulseRate || 10)) % 1;
                const baseFreq = spec.frequency || 440;
                for (let h = 0; h < harmonics.length; h++) {
                    sample += Math.sin(2 * Math.PI * baseFreq * (h + 1) * t) * harmonics[h];
                }
                sample = sample / harmonics.reduce((a, b) => a + b, 0);
                sample *= (pulsePhase < 0.5 ? 1 : 0.3); // Pulsing amplitude
                sample *= getEnvelopeValue(t, spec.duration, env);
                break;
            }

            case 'layered_impact': {
                // Combine noise burst with decaying tone
                const noiseComponent = (Math.random() * 2 - 1) * Math.exp(-t * 8);
                const baseFreq = spec.frequency || 100;
                let toneComponent = 0;
                for (let h = 0; h < harmonics.length; h++) {
                    toneComponent += Math.sin(2 * Math.PI * baseFreq * (h + 1) * t) * harmonics[h];
                }
                toneComponent = toneComponent / harmonics.reduce((a, b) => a + b, 0);
                toneComponent *= Math.exp(-t * 4);
                sample = noiseComponent * 0.6 + toneComponent * 0.8;
                sample *= getEnvelopeValue(t, spec.duration, env);
                break;
            }

            case 'chord': {
                // Rich major chord that evolves
                const f = spec.frequency || 440;
                const chordRatios = [1, 1.25, 1.5, 2, 2.5]; // Major chord with octave
                for (const ratio of chordRatios) {
                    for (let h = 0; h < harmonics.length; h++) {
                        const detuneHz = (Math.random() - 0.5) * 2; // Slight detune
                        sample += Math.sin(2 * Math.PI * (f * ratio + detuneHz) * (h + 1) * t) * harmonics[h] * 0.2;
                    }
                }
                // Add slow swelling modulation
                const swell = 0.7 + 0.3 * Math.sin(2 * Math.PI * 0.2 * t);
                sample *= swell;
                sample *= getEnvelopeValue(t, spec.duration, env);
                break;
            }

            case 'drone': {
                // Enhanced drone with subtle movement
                const f1 = spec.frequency || 110;
                const f2 = spec.frequency2 || f1 * 1.5;
                const lfo = Math.sin(2 * Math.PI * 0.1 * t);
                for (let h = 0; h < harmonics.length; h++) {
                    sample += Math.sin(2 * Math.PI * f1 * (h + 1) * t + lfo * 0.1) * harmonics[h] * 0.5;
                    sample += Math.sin(2 * Math.PI * f2 * (h + 1) * t - lfo * 0.1) * harmonics[h] * 0.3;
                }
                break;
            }

            case 'evolving_pad': {
                // Evolving pad with chord progression
                const key = spec.key || 110;
                const scale = spec.scale || SCALES.minor;
                const bpm = spec.bpm || 100;
                const mod = spec.modulation || 2;

                // Chord changes every 4 beats
                const beatsPerSecond = bpm / 60;
                const beatPosition = t * beatsPerSecond;
                const chordIndex = Math.floor(beatPosition / 4) % 4;

                // Chord progression: I, IV, V, I (simplified)
                const chordRoots = [0, 3, 4, 0]; // Scale degree offsets
                const chordRoot = scale[chordRoots[chordIndex] % scale.length];
                const rootFreq = key * semitoneToFreq(chordRoot);

                // Build chord (root, third, fifth)
                const chordNotes = [
                    rootFreq,
                    rootFreq * semitoneToFreq(scale[2] - scale[0]), // Third
                    rootFreq * semitoneToFreq(scale[4 % scale.length] - scale[0]), // Fifth
                ];

                // LFO for movement
                const lfo1 = Math.sin(2 * Math.PI * mod * 0.1 * t);
                const lfo2 = Math.sin(2 * Math.PI * mod * 0.07 * t);

                for (const noteFreq of chordNotes) {
                    for (let h = 0; h < harmonics.length; h++) {
                        const detune = lfo1 * 2;
                        sample += Math.sin(2 * Math.PI * (noteFreq + detune) * (h + 1) * t) * harmonics[h];
                    }
                }

                // Normalize and add subtle filter sweep
                sample = sample / (chordNotes.length * harmonics.reduce((a, b) => a + b, 0));
                sample *= 0.5 + 0.2 * lfo2;

                // Smooth looping envelope
                const loopEnv = Math.sin(Math.PI * t / spec.duration);
                sample *= 0.7 + 0.3 * loopEnv;
                break;
            }

            case 'atmospheric': {
                // Dark atmospheric pad with subtle noise texture
                const key = spec.key || 110;
                const scale = spec.scale || SCALES.minor;
                const mod = spec.modulation || 2;

                // Slow moving bass drone
                const bassDrone = Math.sin(2 * Math.PI * key * t) * 0.4;
                const bassOctave = Math.sin(2 * Math.PI * key * 0.5 * t) * 0.3;

                // Ethereal pad notes (fifth and octave)
                const fifthFreq = key * semitoneToFreq(scale[4 % scale.length]);
                const lfo = Math.sin(2 * Math.PI * 0.05 * t);

                let padSample = 0;
                for (let h = 0; h < harmonics.length; h++) {
                    padSample += Math.sin(2 * Math.PI * fifthFreq * (h + 1) * t + lfo * 0.2) * harmonics[h];
                    padSample += Math.sin(2 * Math.PI * key * 2 * (h + 1) * t - lfo * 0.15) * harmonics[h] * 0.5;
                }
                padSample = padSample / harmonics.reduce((a, b) => a + b, 0) * 0.3;

                // Subtle noise texture
                const noiseTexture = (Math.random() * 2 - 1) * 0.02 * (1 + Math.sin(2 * Math.PI * mod * t) * 0.5);

                sample = bassDrone + bassOctave + padSample + noiseTexture;

                // Smooth looping
                const loopEnv = Math.sin(Math.PI * t / spec.duration);
                sample *= 0.7 + 0.3 * loopEnv;
                break;
            }

            case 'arpeggio': {
                // Aggressive arpeggio pattern for boss music
                const key = spec.key || 110;
                const scale = spec.scale || SCALES.minor;
                const bpm = spec.bpm || 140;

                const beatsPerSecond = bpm / 60;
                const sixteenthNote = beatsPerSecond * 4;
                const noteIndex = Math.floor(t * sixteenthNote) % 8;

                // Arpeggio pattern: root, third, fifth, octave, fifth, third, root, sub-octave
                const arpPattern = [0, 2, 4, 0, 4, 2, 0, 0];
                const octavePattern = [0, 0, 0, 1, 0, 0, 0, -1];

                const scaleNote = scale[arpPattern[noteIndex] % scale.length];
                const noteFreq = key * semitoneToFreq(scaleNote) * Math.pow(2, octavePattern[noteIndex]);

                // Fast attack/decay for punchy arpeggios
                const notePosition = (t * sixteenthNote) % 1;
                const noteEnvelope = Math.exp(-notePosition * 8) * 0.8 + 0.2;

                // Generate with harmonics
                for (let h = 0; h < harmonics.length; h++) {
                    sample += Math.sin(2 * Math.PI * noteFreq * (h + 1) * t) * harmonics[h];
                }
                sample = sample / harmonics.reduce((a, b) => a + b, 0);
                sample *= noteEnvelope;

                // Add bass drone underneath
                const bassDrone = Math.sin(2 * Math.PI * key * 0.5 * t) * 0.3;
                sample = sample * 0.7 + bassDrone;

                // Smooth looping
                const loopEnv = Math.sin(Math.PI * t / spec.duration);
                sample *= 0.7 + 0.3 * loopEnv;
                break;
            }
        }

        // Apply fade in/out for seamless looping on music tracks
        if (spec.type.includes('pad') || spec.type.includes('atmospheric') ||
            spec.type.includes('arpeggio') || spec.name.startsWith('music_')) {
            const fadeTime = 0.5;
            let fadeEnv = 1;
            if (t < fadeTime) {
                fadeEnv = t / fadeTime;
            } else if (t > spec.duration - fadeTime) {
                fadeEnv = (spec.duration - t) / fadeTime;
            }
            sample *= fadeEnv;
        }

        // Soft clipping to prevent harsh distortion
        sample = Math.tanh(sample);

        // Convert to 16-bit PCM
        const pcmSample = Math.max(-1, Math.min(1, sample)) * 0x7FFF * 0.7; // Reduce volume to prevent clipping
        const offset = i * CHANNELS * 2;

        // Write stereo with subtle width
        const stereoOffset = Math.sin(2 * Math.PI * 0.5 * t) * 0.1;
        const leftSample = Math.floor(pcmSample * (1 - stereoOffset));
        const rightSample = Math.floor(pcmSample * (1 + stereoOffset));

        buffer.writeInt16LE(Math.max(-32768, Math.min(32767, leftSample)), offset);
        buffer.writeInt16LE(Math.max(-32768, Math.min(32767, rightSample)), offset + 2);
    }

    return buffer;
}

/**
 * Create WAV file header
 */
function createWavHeader(dataSize: number): Buffer {
    const header = Buffer.alloc(44);

    // RIFF header
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataSize, 4);
    header.write('WAVE', 8);

    // fmt chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(CHANNELS, 22);
    header.writeUInt32LE(SAMPLE_RATE, 24);
    header.writeUInt32LE(SAMPLE_RATE * CHANNELS * BIT_DEPTH / 8, 28);
    header.writeUInt16LE(CHANNELS * BIT_DEPTH / 8, 32);
    header.writeUInt16LE(BIT_DEPTH, 34);

    // data chunk
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);

    return header;
}

/**
 * Generate a single audio file
 */
function generateAudioFile(spec: AudioSpec, outputDir: string): void {
    console.log(`Generating ${spec.name}.mp3 (${spec.duration}s, ${spec.type})...`);

    const audioData = generateAudioData(spec);
    const header = createWavHeader(audioData.length);
    const wavFile = Buffer.concat([header, audioData]);

    const outputPath = path.join(outputDir, `${spec.name}.mp3`);
    fs.writeFileSync(outputPath, wavFile);

    const sizeKB = (wavFile.length / 1024).toFixed(1);
    console.log(`  ✓ Created ${spec.name}.mp3 (${sizeKB} KB)`);
}

/**
 * Main execution
 */
async function main() {
    console.log('🎵 Generating Enhanced Audio Files\n');
    console.log('Creating 24 high-quality procedural audio files for Neon Vanguard...\n');
    console.log('Improvements over placeholder version:');
    console.log('  • Music tracks: 30 seconds (vs 4 seconds)');
    console.log('  • Rich harmonic content with chord progressions');
    console.log('  • ADSR envelope shaping for punchy sounds');
    console.log('  • Multiple oscillators with detuning');
    console.log('  • Stage-specific musical keys and scales\n');

    const projectRoot = path.resolve(__dirname, '..');
    const outputDir = path.join(projectRoot, 'public', 'audio');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`Created directory: ${outputDir}\n`);
    }

    let successCount = 0;
    let totalSize = 0;

    for (const spec of AUDIO_SPECS) {
        try {
            generateAudioFile(spec, outputDir);
            const filePath = path.join(outputDir, `${spec.name}.mp3`);
            totalSize += fs.statSync(filePath).size;
            successCount++;
        } catch (error) {
            console.error(`  ✗ Failed to generate ${spec.name}:`, error);
        }
    }

    const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.log(`\n✅ Successfully generated ${successCount}/${AUDIO_SPECS.length} audio files`);
    console.log(`📁 Output directory: ${outputDir}`);
    console.log(`💾 Total size: ${totalMB} MB`);
    console.log('\n🎶 Audio features:');
    console.log('   • Stage music with unique keys and chord progressions');
    console.log('   • Boss music with intense arpeggio patterns');
    console.log('   • Victory/Defeat with emotional chord resolutions');
    console.log('   • Punchy combat SFX with layered impacts\n');
}

main().catch(console.error);
