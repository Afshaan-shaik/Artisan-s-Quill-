// ============================================================================
// BARD SYMPHONY ACOUSTIC & VOCAL SYNTHESIS ENGINE
// The Artisan's Quill — Generative ambient acoustic layers & verse recitation
// ============================================================================

export type BardVoiceStyle = 'ancient-bard' | 'ethereal-muse' | 'midnight-philosopher' | 'golden-quill';

export interface BardVoiceConfig {
  id: BardVoiceStyle;
  label: string;
  emoji: string;
  description: string;
  pitch: number;
  rate: number;
  preferredVoiceLang: string[];
  harpMood: 'dorian' | 'aeolian' | 'lydian';
  celloRoot: number; // Hz
}

export const BARD_VOICE_PRESETS: BardVoiceConfig[] = [
  {
    id: 'ancient-bard',
    label: 'Ancient Atelier Bard',
    emoji: '🧙‍♂️',
    description: 'Deep, resonant, measured cadence with warm acoustic cello resonance.',
    pitch: 0.88,
    rate: 0.88,
    preferredVoiceLang: ['en-GB', 'en-US', 'en'],
    harpMood: 'dorian',
    celloRoot: 65.41 // C2
  },
  {
    id: 'ethereal-muse',
    label: 'Ethereal Muse',
    emoji: '✨',
    description: 'Silken, harmonic tone accompanied by gentle crystalline harp arpeggios.',
    pitch: 1.15,
    rate: 0.92,
    preferredVoiceLang: ['en-IE', 'en-GB', 'en-US'],
    harpMood: 'lydian',
    celloRoot: 87.31 // F2
  },
  {
    id: 'midnight-philosopher',
    label: 'Midnight Philosopher',
    emoji: '🕯️',
    description: 'Slow, contemplative whisper surrounded by soft evening rain.',
    pitch: 0.8,
    rate: 0.82,
    preferredVoiceLang: ['en-US', 'en-GB'],
    harpMood: 'aeolian',
    celloRoot: 55.0 // A1
  },
  {
    id: 'golden-quill',
    label: 'Golden Quill Bard',
    emoji: '🪶',
    description: 'Lyrical, vibrant poetic rhythm with blooming acoustic warmth.',
    pitch: 1.0,
    rate: 0.95,
    preferredVoiceLang: ['en-US', 'en-GB', 'en-AU'],
    harpMood: 'dorian',
    celloRoot: 73.42 // D2
  }
];

class BardSymphonyEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Instrument Gains
  private harpGain: GainNode | null = null;
  private celloGain: GainNode | null = null;
  private rainGain: GainNode | null = null;

  // Sound nodes
  private isPlayingMusic = false;
  private harpInterval: number | null = null;
  private celloOscillators: OscillatorNode[] = [];
  private rainSource: AudioBufferSourceNode | null = null;

  // Speech State
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private currentLineIndex = -1;
  private lines: string[] = [];
  private onLineChangeCallback: ((lineIndex: number, text: string) => void) | null = null;
  private onFinishedCallback: (() => void) | null = null;

  // Volume settings (0 to 1)
  private volumes = {
    voice: 1.0,
    harp: 0.35,
    cello: 0.3,
    rain: 0.25
  };

  private currentPreset: BardVoiceConfig = BARD_VOICE_PRESETS[0];

  private initAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 1.0;

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);

      // Setup Sub-Gains
      this.harpGain = this.audioCtx.createGain();
      this.harpGain.gain.value = this.volumes.harp;
      this.harpGain.connect(this.masterGain);

      this.celloGain = this.audioCtx.createGain();
      this.celloGain.gain.value = this.volumes.cello;
      this.celloGain.connect(this.masterGain);

      this.rainGain = this.audioCtx.createGain();
      this.rainGain.gain.value = this.volumes.rain;
      this.rainGain.connect(this.masterGain);
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public setPreset(presetId: BardVoiceStyle) {
    const preset = BARD_VOICE_PRESETS.find((p) => p.id === presetId) || BARD_VOICE_PRESETS[0];
    this.currentPreset = preset;
    if (this.isPlayingMusic) {
      this.restartCelloDrone();
    }
  }

  public getPreset(): BardVoiceConfig {
    return this.currentPreset;
  }

  public setVolumes(volumes: Partial<typeof this.volumes>) {
    this.volumes = { ...this.volumes, ...volumes };
    if (this.harpGain) this.harpGain.gain.setTargetAtTime(this.volumes.harp, this.audioCtx?.currentTime || 0, 0.1);
    if (this.celloGain) this.celloGain.gain.setTargetAtTime(this.volumes.cello, this.audioCtx?.currentTime || 0, 0.1);
    if (this.rainGain) this.rainGain.gain.setTargetAtTime(this.volumes.rain, this.audioCtx?.currentTime || 0, 0.1);
  }

  public getVolumes() {
    return { ...this.volumes };
  }

  // --------------------------------------------------------------------------
  // GENERATIVE HARP SYNTHESIS (Pentatonic / Modal Plucks)
  // --------------------------------------------------------------------------
  private playHarpNote(freq: number) {
    if (!this.audioCtx || !this.harpGain) return;

    const osc = this.audioCtx.createOscillator();
    const noteGain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    // Warm pluck filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, this.audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 1.8);

    // Sine + Triangle harmonic blend
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

    const now = this.audioCtx.currentTime;
    noteGain.gain.setValueAtTime(0.001, now);
    noteGain.gain.linearRampToValueAtTime(0.28, now + 0.03); // Quick attack
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2); // Long resonant decay

    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.harpGain);

    osc.start(now);
    osc.stop(now + 3.3);
  }

  private startHarpArpeggiator() {
    if (this.harpInterval) clearInterval(this.harpInterval);

    // Pentatonic scale frequencies in Hz (D, E, F#, A, B, D)
    const scale = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33, 659.25, 739.99, 880.0];

    const triggerNextPluck = () => {
      if (!this.isPlayingMusic) return;
      const note = scale[Math.floor(Math.random() * scale.length)];
      this.playHarpNote(note);

      // Random poetic interval between 900ms and 2400ms
      const delay = Math.floor(Math.random() * 1500) + 900;
      this.harpInterval = window.setTimeout(triggerNextPluck, delay);
    };

    triggerNextPluck();
  }

  // --------------------------------------------------------------------------
  // GENERATIVE CELLO DRONE (Warm organic multi-oscillator chord)
  // --------------------------------------------------------------------------
  private startCelloDrone() {
    if (!this.audioCtx || !this.celloGain) return;
    this.stopCelloDrone();

    const rootFreq = this.currentPreset.celloRoot;
    const fifthFreq = rootFreq * 1.5;
    const octaveFreq = rootFreq * 2;

    const freqs = [rootFreq, fifthFreq, octaveFreq];

    freqs.forEach((f) => {
      if (!this.audioCtx || !this.celloGain) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, this.audioCtx.currentTime);

      // Subtle slow vibrato / pulse
      const lfo = this.audioCtx.createOscillator();
      const lfoGain = this.audioCtx.createGain();
      lfo.frequency.setValueAtTime(0.18 + Math.random() * 0.1, this.audioCtx.currentTime);
      lfoGain.gain.setValueAtTime(0.8, this.audioCtx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, this.audioCtx.currentTime + 3.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.celloGain);

      osc.start();
      this.celloOscillators.push(osc);
    });
  }

  private stopCelloDrone() {
    this.celloOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Ignored if already stopped
      }
    });
    this.celloOscillators = [];
  }

  private restartCelloDrone() {
    this.stopCelloDrone();
    this.startCelloDrone();
  }

  // --------------------------------------------------------------------------
  // GENERATIVE RAIN AMBIENCE (Pink/Brown noise filter)
  // --------------------------------------------------------------------------
  private startRainAmbience() {
    if (!this.audioCtx || !this.rainGain) return;
    this.stopRainAmbience();

    const bufferSize = this.audioCtx.sampleRate * 2;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.audioCtx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.rainGain);

    whiteNoise.start();
    this.rainSource = whiteNoise;
  }

  private stopRainAmbience() {
    if (this.rainSource) {
      try {
        this.rainSource.stop();
        this.rainSource.disconnect();
      } catch {
        // Ignored
      }
      this.rainSource = null;
    }
  }

  // --------------------------------------------------------------------------
  // START & STOP SYMPHONY MUSIC
  // --------------------------------------------------------------------------
  public startSymphony() {
    this.initAudioContext();
    this.isPlayingMusic = true;
    this.startCelloDrone();
    this.startHarpArpeggiator();
    this.startRainAmbience();
  }

  public stopSymphony() {
    this.isPlayingMusic = false;
    if (this.harpInterval) {
      clearTimeout(this.harpInterval);
      this.harpInterval = null;
    }
    this.stopCelloDrone();
    this.stopRainAmbience();
  }

  // --------------------------------------------------------------------------
  // SPOKEN-WORD VERSE RECITATION (Web Speech API with line tracking)
  // --------------------------------------------------------------------------
  public recitePoem(
    poemText: string,
    onLineChange?: (lineIndex: number, text: string) => void,
    onFinished?: () => void
  ) {
    this.initAudioContext();
    this.stopRecitation();

    this.onLineChangeCallback = onLineChange || null;
    this.onFinishedCallback = onFinished || null;

    // Split poem into non-empty spoken lines
    this.lines = poemText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (this.lines.length === 0) {
      if (this.onFinishedCallback) this.onFinishedCallback();
      return;
    }

    // Start background acoustic symphony
    this.startSymphony();

    this.currentLineIndex = 0;
    this.isSpeaking = true;
    this.speakCurrentLine();
  }

  private speakCurrentLine() {
    if (!this.isSpeaking || this.currentLineIndex >= this.lines.length) {
      this.isSpeaking = false;
      if (this.onFinishedCallback) this.onFinishedCallback();
      return;
    }

    const lineText = this.lines[this.currentLineIndex];
    if (this.onLineChangeCallback) {
      this.onLineChangeCallback(this.currentLineIndex, lineText);
    }

    if (!('speechSynthesis' in window)) {
      // Fallback if browser lacks speech synthesis
      setTimeout(() => {
        this.currentLineIndex++;
        this.speakCurrentLine();
      }, 2500);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(lineText);
    utterance.pitch = this.currentPreset.pitch;
    utterance.rate = this.currentPreset.rate;
    utterance.volume = this.volumes.voice;

    // Pick best matching natural voice
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) =>
      this.currentPreset.preferredVoiceLang.some((lang) => v.lang.startsWith(lang))
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onend = () => {
      // Natural human breathing pause between poetic stanzas (600ms - 900ms)
      const pauseDuration = lineText.endsWith('.') || lineText.endsWith('—') || lineText.endsWith('!') ? 950 : 650;
      setTimeout(() => {
        if (this.isSpeaking) {
          this.currentLineIndex++;
          this.speakCurrentLine();
        }
      }, pauseDuration);
    };

    utterance.onerror = () => {
      this.currentLineIndex++;
      this.speakCurrentLine();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public pauseRecitation() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }

  public resumeRecitation() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  }

  public stopRecitation() {
    this.isSpeaking = false;
    this.currentLineIndex = -1;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.stopSymphony();
  }

  public getIsPlaying(): boolean {
    return this.isSpeaking || this.isPlayingMusic;
  }

  public getCurrentLineIndex(): number {
    return this.currentLineIndex;
  }
}

export const bardSymphony = new BardSymphonyEngine();
