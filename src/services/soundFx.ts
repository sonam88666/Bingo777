/**
 * Web Audio API Sound Synthesizer & Background Music Engine for Bingo777
 * Provides immersive casino sound FX (Countdown Ticks, Win Chime, Bet Chip, Notification)
 * and ambient casino lounge background music (BGM) without external audio asset dependencies.
 * Audio preferences are persistently stored in browser localStorage.
 */

export interface AudioSettingsState {
  isMuted: boolean;
  sfxEnabled: boolean;
  bgmEnabled: boolean;
  sfxVolume: number;
  bgmVolume: number;
  pushNotificationsEnabled?: boolean;
}

class SoundFxService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private sfxEnabled: boolean = true;
  private bgmEnabled: boolean = false;
  private sfxVolume: number = 0.8;
  private bgmVolume: number = 0.3;
  private pushNotificationsEnabled: boolean = true;

  private listeners: Set<() => void> = new Set();
  private bgmIntervalId: NodeJS.Timeout | null = null;
  private bgmChordStep: number = 0;
  private activeBgmOscillators: OscillatorNode[] = [];
  private bgmMasterGain: GainNode | null = null;

  constructor() {
    this.loadFromStorage();

    // Listen for global user interaction to unlock Web Audio context if browser blocked autoplay
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        if (this.bgmEnabled && !this.isMuted && !this.bgmIntervalId) {
          this.startBgmLoop();
        }
      };
      window.addEventListener('click', unlockAudio, { once: true });
      window.addEventListener('touchstart', unlockAudio, { once: true });
    }
  }

  private loadFromStorage() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;

      const savedMute = localStorage.getItem('maanwin_sound_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }

      const savedSfx = localStorage.getItem('maanwin_sfx_enabled');
      if (savedSfx !== null) {
        this.sfxEnabled = savedSfx === 'true';
      }

      const savedBgm = localStorage.getItem('maanwin_bgm_enabled');
      if (savedBgm !== null) {
        this.bgmEnabled = savedBgm === 'true';
      }

      const savedSfxVol = localStorage.getItem('maanwin_sfx_volume');
      if (savedSfxVol !== null) {
        const v = parseFloat(savedSfxVol);
        if (!isNaN(v)) this.sfxVolume = Math.min(1, Math.max(0, v));
      }

      const savedBgmVol = localStorage.getItem('maanwin_bgm_volume');
      if (savedBgmVol !== null) {
        const v = parseFloat(savedBgmVol);
        if (!isNaN(v)) this.bgmVolume = Math.min(1, Math.max(0, v));
      }

      const savedPush = localStorage.getItem('maanwin_push_notifications');
      if (savedPush !== null) {
        this.pushNotificationsEnabled = savedPush === 'true';
      }
    } catch {
      // LocalStorage access fallback
    }
  }

  private saveToStorage() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      localStorage.setItem('maanwin_sound_muted', String(this.isMuted));
      localStorage.setItem('maanwin_sfx_enabled', String(this.sfxEnabled));
      localStorage.setItem('maanwin_bgm_enabled', String(this.bgmEnabled));
      localStorage.setItem('maanwin_sfx_volume', String(this.sfxVolume));
      localStorage.setItem('maanwin_bgm_volume', String(this.bgmVolume));
      localStorage.setItem('maanwin_push_notifications', String(this.pushNotificationsEnabled));
    } catch {
      // Ignore
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch {
        // Ignore subscriber errors
      }
    }
  }

  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // --- AUDIO STATE ACCESSORS & MUTATORS ---

  public getAudioSettings(): AudioSettingsState {
    return {
      isMuted: this.isMuted,
      sfxEnabled: this.sfxEnabled,
      bgmEnabled: this.bgmEnabled,
      sfxVolume: this.sfxVolume,
      bgmVolume: this.bgmVolume,
      pushNotificationsEnabled: this.pushNotificationsEnabled
    };
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public isSfxActive(): boolean {
    return !this.isMuted && this.sfxEnabled;
  }

  public isBgmActive(): boolean {
    return !this.isMuted && this.bgmEnabled;
  }

  public isPushActive(): boolean {
    return this.pushNotificationsEnabled;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.saveToStorage();
    if (this.isMuted) {
      this.stopBgmLoop();
    } else if (this.bgmEnabled) {
      this.startBgmLoop();
    }
    this.notify();
    return this.isMuted;
  }

  public setMasterMuted(muted: boolean) {
    if (this.isMuted === muted) return;
    this.isMuted = muted;
    this.saveToStorage();
    if (this.isMuted) {
      this.stopBgmLoop();
    } else if (this.bgmEnabled) {
      this.startBgmLoop();
    }
    this.notify();
  }

  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
    this.saveToStorage();
    if (enabled && !this.isMuted) {
      this.playChipSound();
    }
    this.notify();
  }

  public setBgmEnabled(enabled: boolean) {
    this.bgmEnabled = enabled;
    this.saveToStorage();
    if (enabled && !this.isMuted) {
      this.startBgmLoop();
    } else {
      this.stopBgmLoop();
    }
    this.notify();
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.min(1, Math.max(0, vol));
    this.saveToStorage();
    this.notify();
  }

  public setBgmVolume(vol: number) {
    this.bgmVolume = Math.min(1, Math.max(0, vol));
    this.saveToStorage();
    if (this.bgmMasterGain && this.ctx) {
      this.bgmMasterGain.gain.setValueAtTime(this.bgmVolume * 0.18, this.ctx.currentTime);
    }
    this.notify();
  }

  // --- BACKGROUND MUSIC (BGM) SYNTHESIZER ---

  private startBgmLoop() {
    if (typeof window === 'undefined') return;
    const ctx = this.initContext();
    if (!ctx) return;

    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }

    // Play immediately, then loop every 2.4s
    this.playNextBgmChord();
    this.bgmIntervalId = setInterval(() => {
      if (!this.bgmEnabled || this.isMuted) {
        this.stopBgmLoop();
        return;
      }
      this.playNextBgmChord();
    }, 2400);
  }

  private stopBgmLoop() {
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    for (const osc of this.activeBgmOscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    }
    this.activeBgmOscillators = [];
  }

  private playNextBgmChord() {
    const ctx = this.initContext();
    if (!ctx || this.isMuted || !this.bgmEnabled) return;

    // 4-chord gentle casino lounge progression: Am9 -> Fmaj7 -> Cmaj7 -> G6
    const chordProgression = [
      [220.0, 261.63, 329.63, 392.0, 493.88], // Am9 (A, C, E, G, B)
      [174.61, 220.0, 261.63, 329.63],       // Fmaj7 (F, A, C, E)
      [130.81, 196.0, 246.94, 329.63, 392.0], // Cmaj7 (C, G, B, E, G)
      [164.81, 196.0, 246.94, 293.66, 370.0]  // Em7/G (E, G, B, D, F#)
    ];

    const currentNotes = chordProgression[this.bgmChordStep % chordProgression.length];
    this.bgmChordStep++;

    const now = ctx.currentTime;
    const duration = 2.3;

    // Filter node for mellow, soft lo-fi casino ambience
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(580, now);

    const masterGain = ctx.createGain();
    const targetGain = Math.max(0.01, this.bgmVolume * 0.12);
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.exponentialRampToValueAtTime(targetGain, now + 0.4);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    this.bgmMasterGain = masterGain;

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    currentNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      noteGain.gain.setValueAtTime(1 / currentNotes.length, now);

      osc.connect(noteGain);
      noteGain.connect(filter);

      osc.start(now);
      osc.stop(now + duration);

      this.activeBgmOscillators.push(osc);
      setTimeout(() => {
        const i = this.activeBgmOscillators.indexOf(osc);
        if (i !== -1) this.activeBgmOscillators.splice(i, 1);
      }, duration * 1000 + 100);
    });
  }

  // --- SOUND EFFECTS (SFX) WITH DYNAMIC VOLUME & MUTING GUARDS ---

  // Countdown second tick (plays in final 5 seconds of round)
  public playCountdownTick(urgent: boolean = false) {
    if (this.isMuted || !this.sfxEnabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = urgent ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(urgent ? 880 : 520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(urgent ? 1100 : 440, ctx.currentTime + 0.08);

      const baseGain = (urgent ? 0.25 : 0.15) * this.sfxVolume;
      gain.gain.setValueAtTime(Math.max(0.0001, baseGain), ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  // Bet Placed Chip Sound
  public playChipSound() {
    if (this.isMuted || !this.sfxEnabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(950, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(Math.max(0.0001, 0.2 * this.sfxVolume), ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {}
  }

  // Big Win Fanfare (Expanded 3D Stereo Trumpet & Golden Coin Cascade)
  public playWinFanfare() {
    this.play3dVictoryTrumpet(false);
  }

  // Smooth Loss Sound (Expanded 3D Descending Trombone & Resolution)
  public playLossSound() {
    this.play3dDefeatTrombone(false);
  }

  // Bell Notification (for support chat or alert)
  public playNotification() {
    if (this.isMuted || !this.sfxEnabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(784, now); // G5
      osc.frequency.setValueAtTime(1046.5, now + 0.08); // C6

      gain.gain.setValueAtTime(Math.max(0.0001, 0.18 * this.sfxVolume), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(now + 0.35);
    } catch {}
  }

  // Card Flip Sound (for Dragon Tiger)
  public playCardFlip() {
    if (this.isMuted || !this.sfxEnabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);

      gain.gain.setValueAtTime(Math.max(0.0001, 0.15 * this.sfxVolume), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.06);
    } catch {}
  }

  // Dice Roll Shaker Sound
  public playDiceRoll() {
    if (this.isMuted || !this.sfxEnabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [0, 0.05, 0.1, 0.15].forEach((offset) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(250 + Math.random() * 300, now + offset);
        gain.gain.setValueAtTime(Math.max(0.0001, 0.12 * this.sfxVolume), now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.05);
      });
    } catch {}
  }

  // Wheel Tick (for Lucky Wheel spin)
  public playWheelTick() {
    if (this.isMuted || !this.sfxEnabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(950, now);
      gain.gain.setValueAtTime(Math.max(0.0001, 0.08 * this.sfxVolume), now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.035);
    } catch {}
  }

  // Test sound to preview current SFX settings
  public testSfx() {
    this.playPreviewSound();
  }

  // Preview sound effect for audio settings adjustment
  public playPreviewSound() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      const vol = this.sfxVolume || 0.8;

      notes.forEach((freq, idx) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(Math.max(0.0001, 0.2 * vol), now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    } catch {}
  }

  // --- PUSH NOTIFICATIONS & EXPANDED 3D WIN/LOSS SOUND ENGINE ---

  public async setPushNotificationsEnabled(enabled: boolean): Promise<boolean> {
    this.pushNotificationsEnabled = enabled;
    this.saveToStorage();
    if (enabled && typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      } catch {
        // Ignore browser notification permission restrictions in iframe
      }
      this.playPushNotificationChime();
    }
    this.notify();
    return this.pushNotificationsEnabled;
  }

  public sendPushNotification(title: string, body: string, tag?: string) {
    if (!this.pushNotificationsEnabled) return;
    this.playPushNotificationChime();
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          tag: tag || `bingo777_${Date.now()}`
        });
      } catch {
        // Fallback silently if iframe blocks system notification
      }
    }
  }

  // Crystal two-note spatial push notification chime
  public playPushNotificationChime() {
    if (this.isMuted || !this.sfxEnabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [659.25, 987.77, 1318.51]; // E5, B5, E6
      const vol = this.sfxVolume || 0.8;

      notes.forEach((freq, idx) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(Math.max(0.0001, 0.16 * vol), now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.32);
      });
    } catch {}
  }

  // Royal 3D Stereo Victory Trumpet & Golden Coin Cascade (for Ludo & Big Wins)
  public play3dVictoryTrumpet(forcePlay: boolean = false) {
    if (!forcePlay && (this.isMuted || !this.sfxEnabled)) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const vol = this.sfxVolume || 0.85;

      // Layer 1: Warm 3D Sub-Bass Impact Boom
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(95, now);
      subOsc.frequency.exponentialRampToValueAtTime(38, now + 0.45);
      subGain.gain.setValueAtTime(Math.max(0.0001, 0.28 * vol), now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.52);

      // Layer 2: Royal Brass Fanfare Chord Progression (C5 -> E5 -> G5 -> C6 -> E6 -> G6)
      const brassNotes = [
        { freq: 523.25, delay: 0.0, dur: 0.16, pan: -0.4 },
        { freq: 659.25, delay: 0.11, dur: 0.16, pan: 0.4 },
        { freq: 783.99, delay: 0.22, dur: 0.18, pan: -0.2 },
        { freq: 1046.5, delay: 0.34, dur: 0.45, pan: 0.0 },
        { freq: 1318.5, delay: 0.48, dur: 0.55, pan: 0.3 },
        { freq: 1567.98, delay: 0.6, dur: 0.7, pan: 0.0 }
      ];

      brassNotes.forEach((n) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const harmonic = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        harmonic.type = 'sawtooth';
        osc.frequency.setValueAtTime(n.freq, now + n.delay);
        harmonic.frequency.setValueAtTime(n.freq * 1.5, now + n.delay);

        gain.gain.setValueAtTime(Math.max(0.0001, 0.22 * vol), now + n.delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.delay + n.dur);

        if (typeof ctx.createStereoPanner === 'function') {
          const panner = ctx.createStereoPanner();
          panner.pan.setValueAtTime(n.pan, now + n.delay);
          osc.connect(gain);
          harmonic.connect(gain);
          gain.connect(panner);
          panner.connect(ctx.destination);
        } else {
          osc.connect(gain);
          harmonic.connect(gain);
          gain.connect(ctx.destination);
        }

        osc.start(now + n.delay);
        harmonic.start(now + n.delay);
        osc.stop(now + n.delay + n.dur + 0.05);
        harmonic.stop(now + n.delay + n.dur + 0.05);
      });

      // Layer 3: Sparkling Golden Coin Cascade Chimes
      [1760, 2093, 2349, 2637, 3135].forEach((coinFreq, idx) => {
        if (!ctx) return;
        const coinOsc = ctx.createOscillator();
        const coinGain = ctx.createGain();
        const startT = now + 0.55 + idx * 0.07;
        coinOsc.type = 'sine';
        coinOsc.frequency.setValueAtTime(coinFreq, startT);
        coinGain.gain.setValueAtTime(Math.max(0.0001, 0.12 * vol), startT);
        coinGain.gain.exponentialRampToValueAtTime(0.001, startT + 0.22);
        coinOsc.connect(coinGain);
        coinGain.connect(ctx.destination);
        coinOsc.start(startT);
        coinOsc.stop(startT + 0.25);
      });
    } catch {}
  }

  // Dramatic 3D Defeat / Loss Trombone & Sympathetic Resolution (for Ludo & Round Loss)
  public play3dDefeatTrombone(forcePlay: boolean = false) {
    if (!forcePlay && (this.isMuted || !this.sfxEnabled)) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const vol = this.sfxVolume || 0.85;

      const steps = [
        { freq: 392.0, endFreq: 380.0, delay: 0.0, dur: 0.24 },   // G4
        { freq: 369.99, endFreq: 358.0, delay: 0.25, dur: 0.24 }, // F#4
        { freq: 349.23, endFreq: 338.0, delay: 0.5, dur: 0.24 },  // F4
        { freq: 329.63, endFreq: 261.63, delay: 0.76, dur: 0.65 } // E4 sliding down to C4
      ];

      steps.forEach((s) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const sub = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        sub.type = 'triangle';

        osc.frequency.setValueAtTime(s.freq, now + s.delay);
        osc.frequency.exponentialRampToValueAtTime(s.endFreq, now + s.delay + s.dur);

        sub.frequency.setValueAtTime(s.freq * 0.5, now + s.delay);
        sub.frequency.exponentialRampToValueAtTime(s.endFreq * 0.5, now + s.delay + s.dur);

        gain.gain.setValueAtTime(Math.max(0.0001, 0.16 * vol), now + s.delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + s.delay + s.dur);

        osc.connect(gain);
        sub.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + s.delay);
        sub.start(now + s.delay);
        osc.stop(now + s.delay + s.dur + 0.04);
        sub.stop(now + s.delay + s.dur + 0.04);
      });
    } catch {}
  }

  // Cash Register Coin Clink when MLM Affiliate Commission is Earned or Claimed
  public playCommissionEarnedChime() {
    if (this.isMuted || !this.sfxEnabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const vol = this.sfxVolume || 0.8;
      [1174.66, 1567.98, 2093.0].forEach((freq, idx) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(Math.max(0.0001, 0.18 * vol), now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.28);
      });
    } catch {}
  }

  // Subtle ascending pitch cue played as the Aviator multiplier climbs
  public playAviatorClimbTick(multiplier: number) {
    if (this.isMuted || !this.sfxEnabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const vol = this.sfxVolume || 0.8;

      // Smooth logarithmic pitch rise from 240Hz (at 1.00x) up to ~920Hz
      const clampedMult = Math.max(1, Math.min(multiplier, 50));
      const progress = Math.log10(clampedMult) / Math.log10(50);
      const baseFreq = 240 + progress * 680;

      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.04, now + 0.09);

      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(baseFreq * 0.5, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      // Keep it subtle and non-fatiguing
      const peakGain = Math.max(0.0001, 0.045 * vol);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + 0.12);
      subOsc.stop(now + 0.12);
    } catch {}
  }

  // Distinct crash / fly-away sound when the Aviator plane disappears
  public playAviatorCrash() {
    if (this.isMuted || !this.sfxEnabled) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const vol = this.sfxVolume || 0.8;

      // Layer 1: Rapid descending turbine / Doppler fly-away sweep
      const sweepOsc = ctx.createOscillator();
      const sweepFilter = ctx.createBiquadFilter();
      const sweepGain = ctx.createGain();

      sweepOsc.type = 'sawtooth';
      sweepOsc.frequency.setValueAtTime(580, now);
      sweepOsc.frequency.exponentialRampToValueAtTime(75, now + 0.42);

      sweepFilter.type = 'lowpass';
      sweepFilter.frequency.setValueAtTime(1800, now);
      sweepFilter.frequency.exponentialRampToValueAtTime(180, now + 0.42);

      sweepGain.gain.setValueAtTime(Math.max(0.0001, 0.16 * vol), now);
      sweepGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      sweepOsc.connect(sweepFilter);
      sweepFilter.connect(sweepGain);
      sweepGain.connect(ctx.destination);

      sweepOsc.start(now);
      sweepOsc.stop(now + 0.46);

      // Layer 2: Filtered noise burst & sub-bass thud for distinct crash disappearance
      const bufferSize = Math.floor(ctx.sampleRate * 0.35);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.1));
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(520, now);
      noiseFilter.Q.setValueAtTime(1.2, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(Math.max(0.0001, 0.22 * vol), now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);

      noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noiseNode.start(now);
    } catch {}
  }
}

export const soundFx = new SoundFxService();

