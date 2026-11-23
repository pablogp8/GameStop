import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AudioFeedbackService {
  private context?: AudioContext;
  private clockTimer?: number;
  private clockGeneration = 0;
  private tickCount = 0;

  startClock(enabled: boolean): void {
    this.stopClock();
    if (!enabled) return;
    const generation = ++this.clockGeneration;

    void this.ensureContext().then(() => {
      if (generation !== this.clockGeneration) return;
      this.playTick();
      this.clockTimer = window.setInterval(() => this.playTick(), 500);
    }).catch(() => undefined);
  }

  stopClock(): void {
    if (this.clockTimer !== undefined) window.clearInterval(this.clockTimer);
    this.clockTimer = undefined;
    this.clockGeneration++;
  }

  playResult(isWinner: boolean, enabled: boolean): void {
    if (!enabled) return;
    void this.ensureContext().then(() => {
      if (isWinner) {
        this.playVictoryFanfare();
      } else {
        this.playTone(260, 0, 0.13);
        this.playTone(196, 150, 0.2);
      }
    }).catch(() => undefined);
  }

  playSaveConfirmation(enabled: boolean): void {
    if (!enabled) return;
    void this.ensureContext().then(() => {
      this.playTone(660, 0, 0.1, 0.05);
      this.playTone(880, 110, 0.18, 0.055);
    }).catch(() => undefined);
  }

  private async ensureContext(): Promise<AudioContext> {
    this.context ??= new AudioContext();
    if (this.context.state === 'suspended') await this.context.resume();
    return this.context;
  }

  private playTick(): void {
    this.tickCount++;
    this.playTone(this.tickCount % 2 === 0 ? 820 : 1_050, 0, 0.045, 0.045, 'square');
    navigator.vibrate?.(8);
  }

  private playVictoryFanfare(): void {
    // Llamada ascendente con timbre brillante de metales.
    this.playTone(392, 0, 0.22, 0.045, 'sawtooth');
    this.playTone(523, 240, 0.22, 0.045, 'sawtooth');
    this.playTone(659, 480, 0.26, 0.045, 'sawtooth');
    this.playTone(784, 760, 0.32, 0.05, 'sawtooth');

    // Acorde victorioso sostenido con tres voces de trompeta.
    this.playTone(523, 1_100, 1.15, 0.032, 'sawtooth');
    this.playTone(659, 1_100, 1.15, 0.03, 'sawtooth');
    this.playTone(784, 1_100, 1.15, 0.028, 'sawtooth');
    this.playTone(1_047, 1_100, 1.15, 0.022, 'sawtooth');
  }

  private playTone(
    frequency: number,
    delayMs: number,
    duration: number,
    volume = 0.08,
    type: OscillatorType = 'sine',
  ): void {
    if (!this.context) return;
    const startsAt = this.context.currentTime + delayMs / 1_000;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startsAt);
    gain.gain.setValueAtTime(0.0001, startsAt);
    gain.gain.exponentialRampToValueAtTime(volume, startsAt + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + duration);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start(startsAt);
    oscillator.stop(startsAt + duration + 0.01);
  }
}
