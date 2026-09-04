import { Injectable, signal } from '@angular/core';

export interface GameSettings {
  targetMs: number;
  toleranceMs: number;
  maxWinnersPerDay: number;
  adminPin: string;
}

const DEFAULT_SETTINGS: GameSettings = {
  targetMs: 10_000,
  toleranceMs: 50,
  maxWinnersPerDay: 10,
  adminPin: '1234',
};

@Injectable({ providedIn: 'root' })
export class GameSettingsService {
  private readonly storageKey = 'boton-stop.settings.v1';
  readonly settings = signal<GameSettings>(this.load());

  update(changes: Partial<GameSettings>): void {
    const current = this.settings();
    const updated: GameSettings = {
      targetMs: Math.max(100, Math.round(changes.targetMs ?? current.targetMs)),
      toleranceMs: Math.max(0, Math.round(changes.toleranceMs ?? current.toleranceMs)),
      maxWinnersPerDay: Math.max(0, Math.round(changes.maxWinnersPerDay ?? current.maxWinnersPerDay)),
      adminPin: (changes.adminPin ?? current.adminPin).trim() || current.adminPin,
    };
    this.settings.set(updated);
    localStorage.setItem(this.storageKey, JSON.stringify(updated));
  }

  private load(): GameSettings {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return DEFAULT_SETTINGS;
    try { return { ...DEFAULT_SETTINGS, ...(JSON.parse(stored) as Partial<GameSettings>) }; }
    catch { return DEFAULT_SETTINGS; }
  }
}
