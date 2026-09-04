import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class GameTimerService {
  readonly elapsedMs = signal(0);
  private startedAt: number | null = null;
  private animationFrame: number | null = null;
  start(): void { this.cancelFrame(); this.elapsedMs.set(0); this.startedAt = performance.now(); this.updateDisplay(); }
  stop(): number {
    if (this.startedAt === null) return this.elapsedMs();
    const elapsed = performance.now() - this.startedAt;
    this.elapsedMs.set(elapsed); this.startedAt = null; this.cancelFrame(); return elapsed;
  }
  reset(): void { this.startedAt = null; this.cancelFrame(); this.elapsedMs.set(0); }
  private updateDisplay = (): void => {
    if (this.startedAt === null) return;
    this.elapsedMs.set(performance.now() - this.startedAt);
    this.animationFrame = requestAnimationFrame(this.updateDisplay);
  };
  private cancelFrame(): void { if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame); this.animationFrame = null; }
}
