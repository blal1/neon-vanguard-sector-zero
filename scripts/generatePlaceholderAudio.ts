/**
 * Generate Placeholder Audio Files
 * 
 * This script generates 24 placeholder MP3 audio files for the game.
 * These are simple procedural tones and should be replaced with professional audio assets.
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

interface AudioSpec {
    name: string;
    duration: number; // seconds
    type: 'tone' | 'sweep' | 'noise' | 'pulse' | 'chord' | 'drone';
    frequency?: number;
    frequency2?: number;
    sweepStart?: number;
    sweepEnd?: number;
    pulseRate?: number;
}

const AUDIO_SPECS: AudioSpec[] = [
    // Weapon sounds
    { name: 'shoot_laser', duration: 0.3, type: 'sweep', sweepStart: 800, sweepEnd: 200 },
    { name: 'shoot_heavy', duration: 0.5, type: 'pulse', frequency: 80, pulseRate: 30 },
    { name: 'shoot_standard', duration: 0.2, type: 'tone', frequency: 440 },
    { name: 'shoot_bio', duration: 0.4, type: 'sweep', sweepStart: 300, sweepEnd: 150 },

    // Impact/explosion sounds
    { name: 'explosion', duration: 0.8, type: 'noise' },
    { name: 'hit_player', duration: 0.3, type: 'pulse', frequency: 100, pulseRate: 20 },
    { name: 'crit_hit', duration: 0.4, type: 'sweep', sweepStart: 1200, sweepEnd: 400 },

    // UI sounds
    { name: 'alarm', duration: 1.0, type: 'pulse', frequency: 880, pulseRate: 4 },
    { name: 'blip', duration: 0.1, type: 'tone', frequency: 1000 },
    { name: 'hover', duration: 0.08, type: 'tone', frequency: 600 },
    { name: 'hazard_warning', duration: 0.6, type: 'pulse', frequency: 660, pulseRate: 8 },
    { name: 'power_up', duration: 0.5, type: 'sweep', sweepStart: 400, sweepEnd: 1200 },
    { name: 'charge_up', duration: 1.2, type: 'sweep', sweepStart: 200, sweepEnd: 800 },

    // Environment sounds
    { name: 'vent', duration: 0.6, type: 'noise' },
    { name: 'burrow', duration: 0.8, type: 'sweep', sweepStart: 150, sweepEnd: 50 },

    // Music tracks (longer, loopable drones)
    { name: 'music_combat', duration: 4.0, type: 'drone', frequency: 110, frequency2: 165 },
    { name: 'music_stage_1', duration: 4.0, type: 'drone', frequency: 110, frequency2: 165 },
    { name: 'music_stage_2', duration: 4.0, type: 'drone', frequency: 123, frequency2: 185 },
    { name: 'music_stage_3', duration: 4.0, type: 'drone', frequency: 131, frequency2: 196 },
    { name: 'music_stage_4', duration: 4.0, type: 'drone', frequency: 147, frequency2: 220 },
    { name: 'music_stage_5', duration: 4.0, type: 'drone', frequency: 165, frequency2: 247 },
    { name: 'music_boss', duration: 4.0, type: 'drone', frequency: 87, frequency2: 131 },
    { name: 'music_victory', duration: 3.0, type: 'chord', frequency: 523 },
    { name: 'music_defeat', duration: 3.0, type: 'sweep', sweepStart: 440, sweepEnd: 110 },
];

/**
 * Generate PCM audio data based on specification
 */
function generateAudioData(spec: AudioSpec): Buffer {
    const numSamples = Math.floor(SAMPLE_RATE * spec.duration);
    const buffer = Buffer.alloc(numSamples * CHANNELS * (BIT_DEPTH / 8));

    for (let i = 0; i < numSamples; i++) {
        const t = i / SAMPLE_RATE;
        let sample = 0;

        switch (spec.type) {
            case 'tone':
                sample = Math.sin(2 * Math.PI * (spec.frequency || 440) * t);
                break;

            case 'sweep':
                const sweepFreq = spec.sweepStart! +
                    (spec.sweepEnd! - spec.sweepStart!) * (t / spec.duration);
                sample = Math.sin(2 * Math.PI * sweepFreq * t);
                break;

            case 'noise':
                sample = (Math.random() * 2 - 1) * Math.exp(-t * 2); // Decaying noise
                break;

            case 'pulse':
                const pulsePhase = (t * (spec.pulseRate || 10)) % 1;
                const carrier = Math.sin(2 * Math.PI * (spec.frequency || 440) * t);
                sample = carrier * (pulsePhase < 0.5 ? 1 : 0);
                break;

            case 'chord':
                // Major chord (1, 5/4, 3/2)
                const f = spec.frequency || 440;
                sample = (
                    Math.sin(2 * Math.PI * f * t) +
                    Math.sin(2 * Math.PI * f * 1.25 * t) * 0.7 +
                    Math.sin(2 * Math.PI * f * 1.5 * t) * 0.5
                ) / 2.2;
                break;

            case 'drone':
                // Two detuned oscillators for richness
                const f1 = spec.frequency || 110;
                const f2 = spec.frequency2 || f1 * 1.5;
                sample = (
                    Math.sin(2 * Math.PI * f1 * t) * 0.5 +
                    Math.sin(2 * Math.PI * f2 * t) * 0.3 +
                    Math.sin(2 * Math.PI * (f1 * 2) * t) * 0.1 // Overtone
                );
                break;
        }

        // Apply envelope (fade in/out)
        const fadeTime = Math.min(0.01, spec.duration / 10);
        let envelope = 1;
        if (t < fadeTime) {
            envelope = t / fadeTime;
        } else if (t > spec.duration - fadeTime) {
            envelope = (spec.duration - t) / fadeTime;
        }

        sample *= envelope;

        // Convert to 16-bit PCM
        const pcmSample = Math.max(-1, Math.min(1, sample)) * 0x7FFF;
        const offset = i * CHANNELS * 2;

        // Write stereo (same value for both channels)
        buffer.writeInt16LE(pcmSample, offset);
        buffer.writeInt16LE(pcmSample, offset + 2);
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
    header.writeUInt32LE(16, 16); // fmt chunk size
    header.writeUInt16LE(1, 20); // PCM format
    header.writeUInt16LE(CHANNELS, 22);
    header.writeUInt32LE(SAMPLE_RATE, 24);
    header.writeUInt32LE(SAMPLE_RATE * CHANNELS * BIT_DEPTH / 8, 28); // byte rate
    header.writeUInt16LE(CHANNELS * BIT_DEPTH / 8, 32); // block align
    header.writeUInt16LE(BIT_DEPTH, 34);

    // data chunk
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);

    return header;
}

/**
 * Generate a single audio file
 * Note: Outputs WAV format with .mp3 extension. Modern browsers can play WAV format
 * regardless of file extension. For true MP3 encoding, use a library like lame or ffmpeg.
 */
function generateAudioFile(spec: AudioSpec, outputDir: string): void {
    console.log(`Generating ${spec.name}.mp3...`);

    const audioData = generateAudioData(spec);
    const header = createWavHeader(audioData.length);
    const wavFile = Buffer.concat([header, audioData]);

    // Output as .mp3 (actually WAV format, but browsers will play it)
    const outputPath = path.join(outputDir, `${spec.name}.mp3`);
    fs.writeFileSync(outputPath, wavFile);

    console.log(`  ✓ Created ${spec.name}.mp3 (${spec.duration}s, ${spec.type})`);
}

/**
 * Main execution
 */
async function main() {
    console.log('🎵 Generating Placeholder Audio Files\n');
    console.log('Creating 24 procedural audio files for Neon Vanguard...\n');

    // Determine output directory
    const projectRoot = path.resolve(__dirname, '..');
    const outputDir = path.join(projectRoot, 'public', 'audio');

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`Created directory: ${outputDir}\n`);
    }

    // Generate all audio files
    let successCount = 0;
    for (const spec of AUDIO_SPECS) {
        try {
            generateAudioFile(spec, outputDir);
            successCount++;
        } catch (error) {
            console.error(`  ✗ Failed to generate ${spec.name}:`, error);
        }
    }

    console.log(`\n✅ Successfully generated ${successCount}/${AUDIO_SPECS.length} audio files`);
    console.log(`📁 Output directory: ${outputDir}`);
    console.log('\n⚠️  NOTE: These are placeholder procedural audio files.');
    console.log('   Replace them with professional audio assets for production.\n');
}

// Run the script
main().catch(console.error);
