/**
 * Web Audio API synthesizer for Pomodoro sound effects and ambient noise.
 * 100% client-side, zero latency, no external audio file dependencies.
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientType: string = 'none';
  private campfireTimer: number | null = null;
  private wavesInterval: number | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Pre-unlock Web Audio channel on mobile (iOS Safari / Android) upon first user interaction
  unlockMobileAudio() {
    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      // Play a tiny silent buffer to warm up the audio hardware
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch {
      // ignore
    }
  }

  // Play alarm sound when timer ends
  playAlarm(tone: 'bell' | 'marimba' | 'beep' | 'crystal', volumePercent: number = 75) {
    try {
      const ctx = this.getContext();
      const masterVol = (volumePercent / 100) * 0.8;
      const now = ctx.currentTime;

      if (tone === 'bell') {
        // Tibetan Singing Bowl / Zen Bell simulation (Rich harmonic partials with long exponential decay)
        const frequencies = [432, 864, 1296, 1728];
        const gains = [0.8, 0.4, 0.2, 0.1];
        const decay = 3.5;

        frequencies.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(gains[idx] * masterVol, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + decay);
        });
      } else if (tone === 'marimba') {
        // Warm 2-tone melodic chime (C5 -> E5 -> G5)
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + i * 0.14;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(masterVol * 0.7, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 1.25);
        });
      } else if (tone === 'beep') {
        // Clean pleasant double beep
        [0, 0.18, 0.36].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + offset;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, startTime);

          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.linearRampToValueAtTime(masterVol * 0.6, startTime + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.11);
        });
      } else if (tone === 'crystal') {
        // High crystalline shimmer
        const freqs = [1046.5, 1318.5, 1567.98, 2093.0];
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + i * 0.08;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.linearRampToValueAtTime(masterVol * 0.5, startTime + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 2.0);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 2.1);
        });
      }
    } catch (e) {
      console.warn('Audio playback not permitted or failed:', e);
    }
  }

  // Play tick sound on second tick
  playTick(type: 'clock' | 'wood' | 'drop', volumePercent: number = 50) {
    try {
      const ctx = this.getContext();
      const masterVol = (volumePercent / 100) * 0.25;
      const now = ctx.currentTime;

      if (type === 'clock') {
        // Subtle mechanical clock click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.015);

        gain.gain.setValueAtTime(masterVol * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.02);
      } else if (type === 'wood') {
        // Gentle woodblock
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

        gain.gain.setValueAtTime(masterVol * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'drop') {
        // Soft waterdrop ping
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 0.03);

        gain.gain.setValueAtTime(masterVol * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch {
      // Ignore background tick errors
    }
  }

  // Create loopable noise buffer (White, Pink, Brown)
  private createNoiseBuffer(type: 'white' | 'pink' | 'brown', durationSeconds: number = 5): AudioBuffer {
    const ctx = this.getContext();
    const bufferSize = ctx.sampleRate * durationSeconds;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const output = buffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      let lastBrown = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;

        if (type === 'white') {
          output[i] = white * 0.15;
        } else if (type === 'pink') {
          // Paul Kellet's refined method for pink noise (1/f)
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        } else if (type === 'brown') {
          // Brown noise (1/f^2)
          lastBrown = (lastBrown + 0.02 * white) / 1.02;
          output[i] = lastBrown * 0.35;
        }
      }
    }
    return buffer;
  }

  // Start continuous ambient noise
  startAmbient(type: 'none' | 'rain' | 'waves' | 'pink' | 'brown' | 'campfire', volumePercent: number = 50) {
    this.stopAmbient();
    if (type === 'none') return;

    try {
      const ctx = this.getContext();
      const targetVolume = (volumePercent / 100) * 0.35;
      this.ambientType = type;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(targetVolume, ctx.currentTime + 1.2);
      gainNode.connect(ctx.destination);
      this.ambientGain = gainNode;

      if (type === 'pink' || type === 'brown') {
        const buffer = this.createNoiseBuffer(type, 5);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(gainNode);
        source.start();
        this.ambientSource = source;
      } else if (type === 'rain') {
        // Rain: Pink noise through lowpass with a slight rumble
        const buffer = this.createNoiseBuffer('pink', 5);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(950, ctx.currentTime);

        source.connect(filter);
        filter.connect(gainNode);
        source.start();
        this.ambientSource = source;
      } else if (type === 'waves') {
        // Ocean waves: Brown/Pink noise modulated with slow wave cycles
        const buffer = this.createNoiseBuffer('brown', 6);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, ctx.currentTime);

        // LFO for wave swelling
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8s cycle
        lfoGain.gain.setValueAtTime(targetVolume * 0.7, ctx.currentTime);

        lfo.connect(lfoGain.gain);
        source.connect(filter);
        filter.connect(gainNode);

        source.start();
        lfo.start();
        this.ambientSource = source;
      } else if (type === 'campfire') {
        // Warm crackling fire: Low brown noise + random micro pops
        const buffer = this.createNoiseBuffer('brown', 5);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(550, ctx.currentTime);

        source.connect(filter);
        filter.connect(gainNode);
        source.start();
        this.ambientSource = source;

        // Periodic random crackle pops
        this.campfireTimer = window.setInterval(() => {
          if (!this.ctx || this.ambientType !== 'campfire') return;
          try {
            const popNow = this.ctx.currentTime;
            const popOsc = this.ctx.createOscillator();
            const popGain = this.ctx.createGain();
            popOsc.type = 'triangle';
            popOsc.frequency.setValueAtTime(150 + Math.random() * 800, popNow);

            const popVol = (targetVolume * (0.2 + Math.random() * 0.4));
            popGain.gain.setValueAtTime(popVol, popNow);
            popGain.gain.exponentialRampToValueAtTime(0.0001, popNow + 0.04);

            popOsc.connect(popGain);
            popGain.connect(this.ctx.destination);
            popOsc.start(popNow);
            popOsc.stop(popNow + 0.05);
          } catch {
            // ignore pop error
          }
        }, 180 + Math.random() * 250);
      }
    } catch (err) {
      console.warn('Ambient sound startup failed:', err);
    }
  }

  // Adjust volume dynamically while playing
  setAmbientVolume(volumePercent: number) {
    if (this.ambientGain && this.ctx) {
      const targetVolume = (volumePercent / 100) * 0.35;
      this.ambientGain.gain.linearRampToValueAtTime(targetVolume, this.ctx.currentTime + 0.1);
    }
  }

  // Stop ambient sound
  stopAmbient() {
    if (this.campfireTimer) {
      clearInterval(this.campfireTimer);
      this.campfireTimer = null;
    }
    if (this.wavesInterval) {
      clearInterval(this.wavesInterval);
      this.wavesInterval = null;
    }
    if (this.ambientSource) {
      try {
        (this.ambientSource as AudioBufferSourceNode).stop();
      } catch {
        // Already stopped
      }
      this.ambientSource.disconnect();
      this.ambientSource = null;
    }
    if (this.ambientGain) {
      this.ambientGain.disconnect();
      this.ambientGain = null;
    }
    this.ambientType = 'none';
  }

  getPlayingAmbient() {
    return this.ambientType;
  }
}

export const audioEngine = new AudioEngine();
