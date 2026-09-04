import { Injectable, inject, signal } from '@angular/core';
import { GameResult } from './game-result.model';
import { RESULTS_REPOSITORY } from './results.repository';
import { createId } from './id.util';
@Injectable({ providedIn: 'root' })
export class ResultsService {
  private readonly repository = inject(RESULTS_REPOSITORY);
  readonly results = signal<GameResult[]>([]);
  readonly deviceId = this.getDeviceId();
  constructor() { void this.refresh(); }
  async add(result: GameResult): Promise<void> { await this.repository.add(result); await this.refresh(); }
  async clear(): Promise<void> { await this.repository.clear(); this.results.set([]); }
  winnersOn(date: Date = new Date()): number {
    const day = this.localDay(date);
    return this.results().filter((result) => result.isWinner && this.localDay(new Date(result.playedAt)) === day).length;
  }
  private async refresh(): Promise<void> {
    const results = await this.repository.list();
    this.results.set(results.sort((a, b) => Math.abs(a.differenceMs) - Math.abs(b.differenceMs)));
  }
  private getDeviceId(): string {
    const key = 'boton-stop.device-id'; const existing = localStorage.getItem(key); if (existing) return existing;
    const id = createId(); localStorage.setItem(key, id); return id;
  }
  private localDay(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
