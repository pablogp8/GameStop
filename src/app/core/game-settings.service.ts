import { Injectable, signal } from '@angular/core';

export interface GameSettings {
  targetMs: number;
  toleranceMs: number;
  maxWinnersPerDay: number;
  hideTimerEnabled: boolean;
  hideTimerAfterMs: number;
  hideResultDetailsEnabled: boolean;
  soundEnabled: boolean;
  randomDiscountEnabled: boolean;
  deviceName: string;
  adminPin: string;
}

const DEFAULT_SETTINGS: GameSettings = {
  targetMs: 10_000,
  toleranceMs: 50,
  maxWinnersPerDay: 10,
  hideTimerEnabled: false,
  hideTimerAfterMs: 5_000,
  hideResultDetailsEnabled: false,
  soundEnabled: true,
  randomDiscountEnabled: false,
  deviceName: 'Tablet 01',
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
      hideTimerEnabled: changes.hideTimerEnabled ?? current.hideTimerEnabled,
      hideTimerAfterMs: Math.max(0, Math.round(changes.hideTimerAfterMs ?? current.hideTimerAfterMs)),
      hideResultDetailsEnabled: changes.hideResultDetailsEnabled ?? current.hideResultDetailsEnabled,
      soundEnabled: changes.soundEnabled ?? current.soundEnabled,
      randomDiscountEnabled: changes.randomDiscountEnabled ?? current.randomDiscountEnabled,
      deviceName: (changes.deviceName ?? current.deviceName).trim().slice(0, 40) || current.deviceName,
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
