/**
 * The Artisan's Quill — Interactive Micro-Sound Engine
 * Synthesizes delicate, crisp, tactile and warm micro-sounds via Web Audio API.
 * Pure programmatic synthesis: zero external audio assets, zero latency, zero network overhead.
 * Completely decoupled from music streaming and artwork audio players.
 */

export type MicroSoundType =
  | 'button-hover'
  | 'category-hover'
  | 'category-select'
  | 'island-open'
  | 'island-close'
  | 'menu-open'
  | 'menu-close'
  | 'upload-open'
  | 'profile-open'
  | 'view-masterpiece'
  | 'like-action'
  | 'save-action'
  | 'share-action'
  | 'carousel-nav'
  | 'quill-chime';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private isUnlocked: boolean = false;
  private lastSoundTime: Map<string, number> = new Map();
  private subscribers: Set<(enabled: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('artisans_quill_sound_enabled');
        this.isEnabled = saved === null ? true : saved === 'true';
      } catch {
        this.isEnabled = true;
      }

      // Unlock AudioContext on first user gesture
      const unlock = () => {
        this.initContext();
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        this.isUnlocked = true;
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
        window.removeEventListener('click', unlock);
      };

      window.addEventListener('pointerdown', unlock, { once: true, passive: true });
      window.addEventListener('keydown', unlock, { once: true, passive: true });
      window.addEventListener('click', unlock, { once: true, passive: true });
    }
  }

  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
        } catch {
          this.ctx = null;
        }
      }
    }
    return this.ctx;
  }

  public getSoundEnabled(): boolean {
    return this.isEnabled;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    try {
      localStorage.setItem('artisans_quill_sound_enabled', String(enabled));
    } catch {
      // Storage unavailable fallback
    }
    this.subscribers.forEach((cb) => cb(enabled));
  }

  public toggleSound(): boolean {
    const next = !this.isEnabled;
    this.setSoundEnabled(next);
    if (next) {
      this.play('category-select');
    }
    return next;
  }

  public subscribe(callback: (enabled: boolean) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  public play(type: MicroSoundType, throttleMs = 50): void {
    if (!this.isEnabled) return;

    // Check throttle to prevent audio spam on rapid mouse movements
    const now = Date.now();
    const last = this.lastSoundTime.get(type) || 0;
    if (now - last < throttleMs) return;
    this.lastSoundTime.set(type, now);

    const ctx = this.initContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      switch (type) {
        case 'button-hover':
          this.synthesizeTactileTick(ctx);
          break;
        case 'category-hover':
          this.synthesizeGlassMicroChime(ctx);
          break;
        case 'category-select':
          this.synthesizeTonalConfirmation(ctx);
          break;
        case 'island-open':
          this.synthesizeAscendingChime(ctx);
          break;
        case 'island-close':
          this.synthesizeDescendingChime(ctx);
          break;
        case 'menu-open':
          this.synthesizeCrystallineClick(ctx);
          break;
        case 'menu-close':
          this.synthesizeMutedClosingTick(ctx);
          break;
        case 'upload-open':
          this.synthesizeGoldenBell(ctx);
          break;
        case 'profile-open':
          this.synthesizePearlClick(ctx);
          break;
        case 'view-masterpiece':
          this.synthesizeRevealChime(ctx);
          break;
        case 'like-action':
          this.synthesizePositiveHeartbeat(ctx);
          break;
        case 'save-action':
          this.synthesizeWarmConfirmationBell(ctx);
          break;
        case 'share-action':
          this.synthesizeAiryShimmer(ctx);
          break;
        case 'carousel-nav':
          this.synthesizeSoftTransitionTick(ctx);
          break;
        case 'quill-chime':
          this.synthesizeSignatureQuillChime(ctx);
          break;
      }
    } catch {
      // Graceful degradation if audio generation fails
    }
  }

  // ─── Programmatic Sound Synthesis Recipes ───────────────────────────

  /** Extremely soft tactile tick: 8ms micro-pulse with gentle decay */
  private synthesizeTactileTick(ctx: AudioContext) {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.008);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.setValueAtTime(3.0, t);

    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.009);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.01);
  }

  /** Delicate glass-like micro-chime: pristine high sine ~1350Hz, 38ms */
  private synthesizeGlassMicroChime(ctx: AudioContext) {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1380, t);
    osc.frequency.exponentialRampToValueAtTime(1320, t + 0.038);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.042);
  }

  /** Gentle tonal confirmation: harmonic two-tone (587Hz -> 880Hz) */
  private synthesizeTonalConfirmation(ctx: AudioContext) {
    const t = ctx.currentTime;
    [
      { freq: 587.33, start: 0, dur: 0.07, vol: 0.08 },
      { freq: 880.0, start: 0.025, dur: 0.085, vol: 0.1 },
    ].forEach(({ freq, start, dur, vol }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + start);
      gain.gain.setValueAtTime(vol, t + start);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + start);
      osc.stop(t + start + dur);
    });
  }

  /** Dynamic Island opening: warm ascending micro-arpeggio (440Hz -> 659Hz -> 880Hz) */
  private synthesizeAscendingChime(ctx: AudioContext) {
    const t = ctx.currentTime;
    const notes = [
      { freq: 440.0, delay: 0 },
      { freq: 659.25, delay: 0.035 },
      { freq: 880.0, delay: 0.07 },
    ];

    notes.forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);
      gain.gain.setValueAtTime(0.08, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.085);
    });
  }

  /** Dynamic Island closing: soft descending chime (880Hz -> 587Hz) */
  private synthesizeDescendingChime(ctx: AudioContext) {
    const t = ctx.currentTime;
    const notes = [
      { freq: 880.0, delay: 0 },
      { freq: 587.33, delay: 0.04 },
    ];

    notes.forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);
      gain.gain.setValueAtTime(0.07, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.075);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.08);
    });
  }

  /** Menu opening: crystalline click (2200Hz tick + 880Hz warmth) */
  private synthesizeCrystallineClick(ctx: AudioContext) {
    const t = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(2200, t);
    osc1.frequency.exponentialRampToValueAtTime(1400, t + 0.02);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, t);

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.027);
    osc2.stop(t + 0.027);
  }

  /** Menu closing: muted dampened pulse */
  private synthesizeMutedClosingTick(ctx: AudioContext) {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, t);
    osc.frequency.exponentialRampToValueAtTime(380, t + 0.02);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.022);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.024);
  }

  /** Upload activation: warm golden two-tone chime */
  private synthesizeGoldenBell(ctx: AudioContext) {
    const t = ctx.currentTime;
    [
      { freq: 523.25, delay: 0 },
      { freq: 783.99, delay: 0.03 },
    ].forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);
      gain.gain.setValueAtTime(0.09, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.095);
    });
  }

  /** Profile menu opening: soft pearl-like click */
  private synthesizePearlClick(ctx: AudioContext) {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1450, t);
    osc.frequency.exponentialRampToValueAtTime(950, t + 0.028);

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.032);
  }

  /** View Masterpiece: elegant two-note reveal chime (480Hz -> 720Hz) */
  private synthesizeRevealChime(ctx: AudioContext) {
    const t = ctx.currentTime;
    [
      { freq: 480.0, delay: 0, dur: 0.12, vol: 0.1 },
      { freq: 720.0, delay: 0.045, dur: 0.16, vol: 0.12 },
    ].forEach(({ freq, delay, dur, vol }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);
      gain.gain.setValueAtTime(vol, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + dur + 0.01);
    });
  }

  /** Like activation: tiny positive tonal response (heartbeat pulse + 640Hz) */
  private synthesizePositiveHeartbeat(ctx: AudioContext) {
    const t = ctx.currentTime;
    // Low warm pulse
    const oscSub = ctx.createOscillator();
    const gainSub = ctx.createGain();
    oscSub.type = 'sine';
    oscSub.frequency.setValueAtTime(220, t);
    gainSub.gain.setValueAtTime(0.12, t);
    gainSub.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    oscSub.connect(gainSub);
    gainSub.connect(ctx.destination);
    oscSub.start(t);
    oscSub.stop(t + 0.075);

    // High sweet chime
    const oscChime = ctx.createOscillator();
    const gainChime = ctx.createGain();
    oscChime.type = 'sine';
    oscChime.frequency.setValueAtTime(659.25, t + 0.02);
    gainChime.gain.setValueAtTime(0.1, t + 0.02);
    gainChime.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
    oscChime.connect(gainChime);
    gainChime.connect(ctx.destination);
    oscChime.start(t + 0.02);
    oscChime.stop(t + 0.115);
  }

  /** Save activation: gentle warm 550Hz confirmation bell */
  private synthesizeWarmConfirmationBell(ctx: AudioContext) {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(554.37, t);
    osc.frequency.exponentialRampToValueAtTime(540, t + 0.1);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.115);
  }

  /** Share activation: crystalline airy shimmer */
  private synthesizeAiryShimmer(ctx: AudioContext) {
    const t = ctx.currentTime;
    [
      { freq: 1400, delay: 0 },
      { freq: 1760, delay: 0.025 },
    ].forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);
      gain.gain.setValueAtTime(0.07, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.065);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.07);
    });
  }

  /** Carousel navigation: quiet, delicate transition tick */
  private synthesizeSoftTransitionTick(ctx: AudioContext) {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1100, t);
    osc.frequency.exponentialRampToValueAtTime(700, t + 0.015);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.018);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.02);
  }

  /** Floating quill activation: signature soft literary chime */
  private synthesizeSignatureQuillChime(ctx: AudioContext) {
    const t = ctx.currentTime;
    [
      { freq: 1046.5, delay: 0, dur: 0.16, vol: 0.09 },
      { freq: 1567.98, delay: 0.035, dur: 0.2, vol: 0.11 },
    ].forEach(({ freq, delay, dur, vol }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);
      gain.gain.setValueAtTime(vol, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + dur + 0.01);
    });
  }
}

export const soundEngine = new SoundEngine();

