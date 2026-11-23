import { Injectable, computed, signal } from '@angular/core';
import { DEMO_CONFIG } from '../../environments/demo-config';

export type DemoEvent = 'activated' | 'expired' | 'clock-rollback' | null;

@Injectable({ providedIn: 'root' })
export class DemoLicenseService {
  private readonly activationKey = 'stop-ten.demo.activation.v1';
  private readonly lastSeenKey = 'stop-ten.demo.last-seen.v1';
  private readonly now = signal(Date.now());
  readonly enabled = DEMO_CONFIG.enabled;
  readonly event = signal<DemoEvent>(null);
  readonly expiresAt = signal<number | null>(null);
  readonly expired = computed(() => this.enabled && (this.expiresAt() ?? 0) <= this.now());
  readonly daysRemaining = computed(() => {
    if (!this.enabled || this.expired()) return 0;
    return Math.min(
      DEMO_CONFIG.durationDays,
      Math.max(1, Math.ceil(((this.expiresAt() ?? this.now()) - this.now()) / 86_400_000)),
    );
  });

  constructor() {
    if (!this.enabled) return;
    const current = Date.now();
    const storedActivation = Number(localStorage.getItem(this.activationKey));
    const storedLastSeen = Number(localStorage.getItem(this.lastSeenKey));
    const activatedAt = Number.isFinite(storedActivation) && storedActivation > 0 ? storedActivation : current;
    if (activatedAt === current) {
      localStorage.setItem(this.activationKey, String(activatedAt));
      this.event.set('activated');
    }
    const expiresAt = activatedAt + DEMO_CONFIG.durationDays * 86_400_000;
    this.expiresAt.set(expiresAt);
    if (Number.isFinite(storedLastSeen) && current + 300_000 < storedLastSeen) {
      this.expiresAt.set(current);
      this.event.set('clock-rollback');
    } else if (current >= expiresAt) {
      this.event.set('expired');
    }
    localStorage.setItem(this.lastSeenKey, String(Math.max(current, storedLastSeen || 0)));
    window.setInterval(() => this.refresh(), 60_000);
  }

  private refresh(): void {
    const current = Date.now();
    const lastSeen = Number(localStorage.getItem(this.lastSeenKey));
    if (Number.isFinite(lastSeen) && current + 300_000 < lastSeen) {
      this.expiresAt.set(current);
      this.event.set('clock-rollback');
    }
    this.now.set(current);
    localStorage.setItem(this.lastSeenKey, String(Math.max(current, lastSeen || 0)));
    if (this.expired() && this.event() === null) this.event.set('expired');
  }
}
