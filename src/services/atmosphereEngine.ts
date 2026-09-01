import { AtmosphereMode } from '../types';

export interface AtmosphereConfig {
  id: AtmosphereMode;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  ambientTrackTitle: string;
  colorToken: string;
  accentHex: string;
  cssClass: string;
}

export const ATMOSPHERE_MODES: Record<AtmosphereMode, AtmosphereConfig> = {
  dawn: {
    id: 'dawn',
    name: 'Dawn Mist',
    subtitle: 'Solitary Awakening • 528 Hz Solfeggio',
    description: 'Soft morning stone palette with gentle drifting fog and soothing morning breeze harmonics.',
    icon: '🌅',
    ambientTrackTitle: 'Morning Petrichor & Wind Harps',
    colorToken: 'from-[#141b24] via-[#0f141c] to-[#0a0d13]',
    accentHex: '#9cb6db',
    cssClass: 'theme-dawn'
  },
  'golden-hour': {
    id: 'golden-hour',
    name: 'Golden Hour',
    subtitle: 'Sunlit Atelier • Lute & Cello Harmonics',
    description: 'Warm amber glow, radiant specular bloom, and acoustic chamber strings resonance.',
    icon: '🌇',
    ambientTrackTitle: 'Atelier Sunlight & Classical Resonance',
    colorToken: 'from-[#241a10] via-[#1a1209] to-[#0f0b06]',
    accentHex: '#e8be78',
    cssClass: 'theme-golden-hour'
  },
  'midnight-rain': {
    id: 'midnight-rain',
    name: 'Midnight Rain',
    subtitle: 'Obsidian Nocturne • Rain on Window',
    description: 'Deep midnight obsidian canvas, rain-on-glass particle physics, and soothing thunder rumbles.',
    icon: '🌧️',
    ambientTrackTitle: 'Rain on Glass & Distant Nocturne',
    colorToken: 'from-[#080b12] via-[#06080e] to-[#030408]',
    accentHex: '#7fa6db',
    cssClass: 'theme-midnight-rain'
  },
  candlelight: {
    id: 'candlelight',
    name: 'Gilded Candlelight',
    subtitle: 'Vellum Manuscripts • Vinyl Crackle & Cello',
    description: 'Flickering warm flame vignette, antique parchment warmth, and vintage vinyl crackle.',
    icon: '🕯️',
    ambientTrackTitle: 'Tallow Candlelight & Vinyl Warmth',
    colorToken: 'from-[#1f1309] via-[#140b05] to-[#0a0502]',
    accentHex: '#df9c53',
    cssClass: 'theme-candlelight'
  }
};

class AtmosphereEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentMode: AtmosphereMode = 'golden-hour';
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private volume: number = 0.55;
  private activeNodes: { stop: () => void }[] = [];
  private listeners: Set<() => void> = new Set();
  private initialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('sanctuary_atmosphere_mode') as AtmosphereMode;
      if (savedMode && ATMOSPHERE_MODES[savedMode]) {
        this.currentMode = savedMode;
      }
      const savedMuted = localStorage.getItem('sanctuary_atmosphere_muted');
      if (savedMuted !== null) {
        this.isMuted = savedMuted === 'true';
      }
      const savedVol = localStorage.getItem('sanctuary_atmosphere_volume');
      if (savedVol !== null) {
        const v = parseFloat(savedVol);
        if (!isNaN(v) && v >= 0 && v <= 1) {
          this.volume = v;
        }
      }
      this.applyCssTheme(this.currentMode);
    }
  }

  private initAudio() {
    if (this.initialized && this.audioCtx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);
      this.initialized = true;
    } catch {
      // Web Audio unsupported
    }
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch {
        // ignore
      }
    });
  }

  public getMode(): AtmosphereMode {
    return this.currentMode;
  }

  public getConfig(): AtmosphereConfig {
    return ATMOSPHERE_MODES[this.currentMode];
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem('sanctuary_atmosphere_volume', this.volume.toString());
    }
    if (this.masterGain && this.audioCtx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.audioCtx.currentTime, 0.05);
    }
    this.notify();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('sanctuary_atmosphere_muted', this.isMuted.toString());
    }
    if (this.masterGain && this.audioCtx) {
      const targetGain = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.setTargetAtTime(targetGain, this.audioCtx.currentTime, 0.08);
    }
    this.notify();
  }

  public async setMode(mode: AtmosphereMode) {
    if (!ATMOSPHERE_MODES[mode]) return;
    this.currentMode = mode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('sanctuary_atmosphere_mode', mode);
    }
    this.applyCssTheme(mode);

    if (this.isPlaying) {
      this.stopAtmosphereSound();
      this.startAtmosphereSound();
    }

    this.notify();
  }

  private applyCssTheme(mode: AtmosphereMode) {
    if (typeof document === 'undefined') return;
    const body = document.body;
    Object.values(ATMOSPHERE_MODES).forEach((m) => {
      body.classList.remove(m.cssClass);
    });
    body.classList.add(ATMOSPHERE_MODES[mode].cssClass);
    body.setAttribute('data-sanctuary-atmosphere', mode);
  }

  public async togglePlayback(): Promise<boolean> {
    this.initAudio();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    if (this.isPlaying) {
      this.stopAtmosphereSound();
      this.isPlaying = false;
    } else {
      this.isPlaying = true;
      this.startAtmosphereSound();
    }
    this.notify();
    return this.isPlaying;
  }

  private stopAtmosphereSound() {
    this.activeNodes.forEach((node) => {
      try {
        node.stop();
      } catch {
        // ignore
      }
    });
    this.activeNodes = [];
  }

  private startAtmosphereSound() {
    if (!this.audioCtx || !this.masterGain) return;
    this.stopAtmosphereSound();

    const ctx = this.audioCtx;
    const master = this.masterGain;

    switch (this.currentMode) {
      case 'dawn':
        this.synthesizeDawnBreeze(ctx, master);
        break;
      case 'golden-hour':
        this.synthesizeGoldenStrings(ctx, master);
        break;
      case 'midnight-rain':
        this.synthesizeMidnightRain(ctx, master);
        break;
      case 'candlelight':
        this.synthesizeCandleVinyl(ctx, master);
        break;
    }
  }

  // 1. Dawn Mist: Ambient wind noise + 528Hz Solfeggio chime pad
  private synthesizeDawnBreeze(ctx: AudioContext, dest: GainNode) {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.95 * b1 + white * 0.08;
      b2 = 0.90 * b2 + white * 0.12;
      output[i] = (b0 + b1 + b2) * 0.15;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);

    // LFO for slow wind swells
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
    lfoGain.gain.setValueAtTime(140, ctx.currentTime);
    lfo.connect(filter.frequency);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.4, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(windGain);
    windGain.connect(dest);

    // 528Hz & 639Hz Pure Chime Tones
    const osc1 = ctx.createOscillator();
    const osc1Gain = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(528, ctx.currentTime);
    osc1Gain.gain.setValueAtTime(0.04, ctx.currentTime);

    const osc2 = ctx.createOscillator();
    const osc2Gain = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(264, ctx.currentTime);
    osc2Gain.gain.setValueAtTime(0.06, ctx.currentTime);

    osc1.connect(osc1Gain);
    osc1Gain.connect(dest);
    osc2.connect(osc2Gain);
    osc2Gain.connect(dest);

    whiteNoise.start();
    lfo.start();
    osc1.start();
    osc2.start();

    this.activeNodes.push({
      stop: () => {
        try {
          whiteNoise.stop();
          lfo.stop();
          osc1.stop();
          osc2.stop();
        } catch {
          // ignore
        }
      }
    });
  }

  // 2. Golden Hour: Warm acoustic lute chords & cello drones
  private synthesizeGoldenStrings(ctx: AudioContext, dest: GainNode) {
    // Warm rich pad chord (D minor / G major 9th warm blend)
    const freqs = [146.83, 220.0, 293.66, 369.99, 440.0]; // D3, A3, D4, F#4, A4
    const oscillators: OscillatorNode[] = [];
    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.07, ctx.currentTime);

    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, ctx.currentTime);

      osc.connect(filter);
      filter.connect(padGain);
      osc.start();
      oscillators.push(osc);
    });

    padGain.connect(dest);

    this.activeNodes.push({
      stop: () => {
        oscillators.forEach((o) => {
          try {
            o.stop();
          } catch {
            // ignore
          }
        });
      }
    });
  }

  // 3. Midnight Rain: Rain on glass + distant low thunder intervals
  private synthesizeMidnightRain(ctx: AudioContext, dest: GainNode) {
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.35;
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.setValueAtTime(1200, ctx.currentTime);
    rainFilter.Q.setValueAtTime(0.6, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.45, ctx.currentTime);

    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(dest);

    // Deep low frequency rumble (distant thunder simulation)
    const rumbleOsc = ctx.createOscillator();
    const rumbleFilter = ctx.createBiquadFilter();
    const rumbleGain = ctx.createGain();
    rumbleOsc.type = 'sawtooth';
    rumbleOsc.frequency.setValueAtTime(48, ctx.currentTime);
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(90, ctx.currentTime);
    rumbleGain.gain.setValueAtTime(0.08, ctx.currentTime);

    rumbleOsc.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(dest);

    rainSource.start();
    rumbleOsc.start();

    this.activeNodes.push({
      stop: () => {
        try {
          rainSource.stop();
          rumbleOsc.stop();
        } catch {
          // ignore
        }
      }
    });
  }

  // 4. Gilded Candlelight: Vinyl crackle + cello sustain
  private synthesizeCandleVinyl(ctx: AudioContext, dest: GainNode) {
    // Vinyl crackle simulation
    const bufferSize = ctx.sampleRate * 2;
    const crackleBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = crackleBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      if (Math.random() < 0.0035) {
        data[i] = (Math.random() * 2 - 1) * 0.6;
      } else {
        data[i] = (Math.random() * 2 - 1) * 0.015;
      }
    }

    const vinylSource = ctx.createBufferSource();
    vinylSource.buffer = crackleBuffer;
    vinylSource.loop = true;

    const vinylGain = ctx.createGain();
    vinylGain.gain.setValueAtTime(0.22, ctx.currentTime);

    vinylSource.connect(vinylGain);
    vinylGain.connect(dest);

    // Warm deep cello C2/G2 drone
    const cello1 = ctx.createOscillator();
    const cello2 = ctx.createOscillator();
    const celloGain = ctx.createGain();
    const celloFilter = ctx.createBiquadFilter();

    cello1.type = 'sawtooth';
    cello1.frequency.setValueAtTime(65.41, ctx.currentTime); // C2
    cello2.type = 'sawtooth';
    cello2.frequency.setValueAtTime(98.0, ctx.currentTime); // G2

    celloFilter.type = 'lowpass';
    celloFilter.frequency.setValueAtTime(220, ctx.currentTime);
    celloGain.gain.setValueAtTime(0.06, ctx.currentTime);

    cello1.connect(celloFilter);
    cello2.connect(celloFilter);
    celloFilter.connect(celloGain);
    celloGain.connect(dest);

    vinylSource.start();
    cello1.start();
    cello2.start();

    this.activeNodes.push({
      stop: () => {
        try {
          vinylSource.stop();
          cello1.stop();
          cello2.stop();
        } catch {
          // ignore
        }
      }
    });
  }
}

export const sanctuaryAtmosphere = new AtmosphereEngine();
