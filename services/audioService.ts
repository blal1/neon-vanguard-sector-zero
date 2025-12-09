const SOUND_ASSETS = [
  { name: 'shoot_laser', url: '/audio/shoot_laser.mp3' },
  { name: 'shoot_heavy', url: '/audio/shoot_heavy.mp3' },
  { name: 'shoot_standard', url: '/audio/shoot_standard.mp3' },
  { name: 'shoot_bio', url: '/audio/shoot_bio.mp3' },
  { name: 'explosion', url: '/audio/explosion.mp3' },
  { name: 'hit_player', url: '/audio/hit_player.mp3' },
  { name: 'crit_hit', url: '/audio/crit_hit.mp3' },
  { name: 'alarm', url: '/audio/alarm.mp3' },
  { name: 'blip', url: '/audio/blip.mp3' },
  { name: 'hover', url: '/audio/hover.mp3' },
  { name: 'hazard_warning', url: '/audio/hazard_warning.mp3' },
  { name: 'power_up', url: '/audio/power_up.mp3' },
  { name: 'charge_up', url: '/audio/charge_up.mp3' },
  { name: 'vent', url: '/audio/vent.mp3' },
  { name: 'burrow', url: '/audio/burrow.mp3' },
  { name: 'music_combat', url: '/audio/music_combat.mp3' },
  { name: 'music_stage_1', url: '/audio/music_stage_1.mp3' },
  { name: 'music_stage_2', url: '/audio/music_stage_2.mp3' },
  { name: 'music_stage_3', url: '/audio/music_stage_3.mp3' },
  { name: 'music_stage_4', url: '/audio/music_stage_4.mp3' },
  { name: 'music_stage_5', url: '/audio/music_stage_5.mp3' },
  { name: 'music_boss', url: '/audio/music_boss.mp3' },
  { name: 'music_victory', url: '/audio/music_victory.mp3' },
  { name: 'music_defeat', url: '/audio/music_defeat.mp3' },
];

class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;    // NEW: Separate music channel
  private sfxGain: GainNode | null = null;      // NEW: Separate SFX channel
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private currentMusicSource: AudioBufferSourceNode | null = null;
  private failedAssets: Set<string> = new Set(); // Track failed audio loads

  // Drone oscillators
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Volume settings (0-1)
  private volumes = {
    master: 0.7,
    music: 0.5,
    sfx: 0.8
  };
  private muted = false;

  constructor() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Create gain node hierarchy: master -> music/sfx -> destination
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      // Set initial volumes
      this.masterGain.gain.value = this.volumes.master;
      this.musicGain.gain.value = this.volumes.music;
      this.sfxGain.gain.value = this.volumes.sfx;

      // Connect hierarchy
      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  private ensureContext() {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // ============================================
  // AUDIO LOADING AND CACHING
  // ============================================

  /**
   * Generate a procedural fallback sound when actual audio file fails to load
   */
  private generateProceduralSound(name: string): AudioBuffer | null {
    if (!this.ctx) return null;

    // Determine frequency based on sound name
    let frequency = 440;
    let duration = 0.2;

    if (name.includes('shoot')) frequency = 600;
    else if (name.includes('explosion')) frequency = 150;
    else if (name.includes('hit')) frequency = 300;
    else if (name.includes('blip')) frequency = 1000;
    else if (name.includes('hover')) frequency = 800;
    else if (name.includes('alarm')) { frequency = 880; duration = 0.5; }
    else if (name.includes('music')) { frequency = 110; duration = 2.0; }

    const sampleRate = this.ctx.sampleRate;
    const numSamples = Math.floor(sampleRate * duration);
    const audioBuffer = this.ctx.createBuffer(1, numSamples, sampleRate);
    const channelData = audioBuffer.getChannelData(0);

    // Generate simple sine wave with envelope
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 3); // Decay envelope
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }

    return audioBuffer;
  }

  async loadSound(url: string, name: string) {
    if (!this.ctx) return;
    if (this.audioBuffers.has(name)) {
      console.log(`Audio "${name}" already loaded.`);
      return;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.audioBuffers.set(name, audioBuffer);
      console.log(`Audio "${name}" loaded and cached.`);
    } catch (e) {
      console.warn(`Failed to load audio "${name}", using procedural fallback`, e);
      this.failedAssets.add(name);

      // Generate procedural fallback
      const fallbackBuffer = this.generateProceduralSound(name);
      if (fallbackBuffer) {
        this.audioBuffers.set(name, fallbackBuffer);
      }
    }
  }

  /**
   * Get loading status for all audio assets
   */
  getLoadStatus() {
    return {
      totalAssets: SOUND_ASSETS.length,
      loaded: this.audioBuffers.size,
      failed: this.failedAssets.size,
      failedAssets: Array.from(this.failedAssets)
    };
  }

  // ============================================
  // VOLUME CONTROL METHODS
  // ============================================

  setMasterVolume(vol: number) {
    this.volumes.master = Math.max(0, Math.min(1, vol));
    this.updateVolumes();
  }

  setMusicVolume(vol: number) {
    this.volumes.music = Math.max(0, Math.min(1, vol));
    this.updateVolumes();
  }

  setSfxVolume(vol: number) {
    this.volumes.sfx = Math.max(0, Math.min(1, vol));
    this.updateVolumes();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.updateVolumes();
  }

  private updateVolumes() {
    if (!this.masterGain || !this.musicGain || !this.sfxGain) return;

    const actualMaster = this.muted ? 0 : this.volumes.master;

    if (this.ctx) {
      const now = this.ctx.currentTime;
      // Smooth transitions to avoid clicks
      this.masterGain.gain.linearRampToValueAtTime(actualMaster, now + 0.05);
      this.musicGain.gain.linearRampToValueAtTime(this.volumes.music, now + 0.05);
      this.sfxGain.gain.linearRampToValueAtTime(this.volumes.sfx, now + 0.05);
    }
  }

  // ============================================
  // AMBIENT DRONE (now connects to musicGain)
  // ============================================

  updateDroneTension(hpPercent: number, enemyCount: number) {
    if (!this.droneOsc1 || !this.droneOsc2 || !this.droneGain) return;

    const tension = 1 - hpPercent;
    const baseFreq = 55;
    const freqSpread = 30 * tension;

    this.droneOsc1.frequency.value = baseFreq + freqSpread;
    this.droneOsc2.frequency.value = (baseFreq + 2) + freqSpread;

    const volumeBoost = Math.min(0.1, 0.05 + (enemyCount * 0.01));
    this.droneGain.gain.value = volumeBoost;
  }

  startAmbientDrone() {
    if (!this.ctx || !this.musicGain || this.droneOsc1) return;
    this.ensureContext();
    this.playMusic('music_combat', true); // Start combat music, looped

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = 0.05;
    this.droneGain.connect(this.musicGain);  // Connect to music channel

    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.value = 55;

    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'triangle';
    this.droneOsc2.frequency.value = 57;

    this.lfo = this.ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = 0.1;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.02;
    this.lfo.connect(lfoGain);
    lfoGain.connect(this.droneGain.gain);

    this.droneOsc1.connect(this.droneGain);
    this.droneOsc2.connect(this.droneGain);

    this.droneOsc1.start();
    this.droneOsc2.start();
    this.lfo.start();
  }

  stopAmbientDrone() {
    if (this.droneOsc1) {
      try {
        const t = this.ctx?.currentTime || 0;
        this.droneGain?.gain.exponentialRampToValueAtTime(0.001, t + 2);
        this.droneOsc1.stop(t + 2);
        this.droneOsc2?.stop(t + 2);
        this.lfo?.stop(t + 2);
        this.stopMusic(); // Stop music when drone stops
      } catch (e) { }
      this.droneOsc1 = null;
    }
  }

  updateDroneIntensity(intensity: number) {
    if (this.droneGain && this.ctx) {
      if (this.droneOsc1) this.droneOsc1.frequency.linearRampToValueAtTime(55 + (intensity * 20), this.ctx.currentTime + 1);
      this.droneGain.gain.linearRampToValueAtTime(0.05 + (intensity * 0.05), this.ctx.currentTime + 1);
    }
  }

  // ============================================
  // SFX (now connect to sfxGain)
  // ============================================

  playSound(name: string, volume: number = 1.0) {
    if (!this.ctx || !this.sfxGain || this.muted) return;
    this.ensureContext();

    const audioBuffer = this.audioBuffers.get(name);
    if (!audioBuffer) {
      // console.warn(`Attempted to play un-cached sound: ${name}`);
      return;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = audioBuffer;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.sfxGain);

    source.start(0);
  }

  playBlip() {
    this.playSound('blip', 0.8);
  }

  playHover() {
    this.playSound('hover', 0.6);
  }

  playShoot(type: 'laser' | 'heavy' | 'standard' | 'bio') {
    switch (type) {
      case 'laser':
        this.playSound('shoot_laser');
        break;
      case 'heavy':
        this.playSound('shoot_heavy');
        break;
      case 'bio':
        this.playSound('shoot_bio');
        break;
      case 'standard':
        this.playSound('shoot_standard');
        break;
    }
  }

  playEnemyHit() {
    this.playSound('explosion', 0.7); // Use explosion for enemy hit/death
  }

  playAlarm() {
    this.playSound('alarm', 0.5);
  }

  playHazardWarning() {
    this.playSound('hazard_warning', 0.7);
  }

  getAnalyser(): AnalyserNode | null {
    if (!this.ctx) return null;

    if (!this.analyser) {
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;

      if (this.masterGain) {
        this.masterGain.disconnect();
        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
      }
    }

    return this.analyser;
  }

  playStageMusic(stage: number, isBoss: boolean) {
    this.stopMusic();
    if (isBoss) {
      this.playMusic('music_boss', true);
    } else {
      const stageMusic = `music_stage_${stage}`;
      if (this.audioBuffers.has(stageMusic)) {
        this.playMusic(stageMusic, true);
      } else {
        this.playMusic('music_combat', true); // Fallback
      }
    }
  }

  playVictoryMusic() {
    this.stopMusic();
    this.playSound('music_victory', 1.0);
  }

  playDefeatMusic() {
    this.stopMusic();
    this.playSound('music_defeat', 1.0);
  }

  playMusic(name: string, loop: boolean = true) {
    if (!this.ctx || !this.musicGain || this.muted) return;
    this.ensureContext();
    this.stopMusic(); // Stop any currently playing music

    const audioBuffer = this.audioBuffers.get(name);
    if (!audioBuffer) {
      console.warn(`Attempted to play un-cached music: ${name}`);
      return;
    }

    this.currentMusicSource = this.ctx.createBufferSource();
    this.currentMusicSource.buffer = audioBuffer;
    this.currentMusicSource.loop = loop;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = this.volumes.music;
    this.currentMusicSource.connect(gainNode);
    gainNode.connect(this.musicGain);

    this.currentMusicSource.start(0);
  }

  stopMusic() {
    if (this.currentMusicSource) {
      this.currentMusicSource.stop();
      this.currentMusicSource.disconnect();
      this.currentMusicSource = null;
    }
  }

  async preloadAssets() {
    const loadPromises = SOUND_ASSETS.map(asset => this.loadSound(asset.url, asset.name));
    await Promise.all(loadPromises);
    console.log("All audio assets preloaded.");
  }
}

export const audio = new AudioService();