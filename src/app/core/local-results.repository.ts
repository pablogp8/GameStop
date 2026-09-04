import { Injectable } from '@angular/core';
import { GameResult } from './game-result.model';
import { ResultsRepository } from './results.repository';

@Injectable()
export class LocalResultsRepository implements ResultsRepository {
  private readonly storageKey = 'boton-stop.results.v1';
  async list(): Promise<GameResult[]> {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return [];
    try { return JSON.parse(stored) as GameResult[]; } catch { return []; }
  }
  async add(result: GameResult): Promise<void> {
    const results = await this.list(); results.push(result);
    localStorage.setItem(this.storageKey, JSON.stringify(results));
  }
  async clear(): Promise<void> { localStorage.removeItem(this.storageKey); }
}
