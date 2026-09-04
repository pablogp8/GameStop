import { InjectionToken } from '@angular/core';
import { GameResult } from './game-result.model';
export interface ResultsRepository { list(): Promise<GameResult[]>; add(result: GameResult): Promise<void>; clear(): Promise<void>; }
export const RESULTS_REPOSITORY = new InjectionToken<ResultsRepository>('RESULTS_REPOSITORY');
