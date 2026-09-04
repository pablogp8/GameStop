export interface GameResult {
  id: string; playerName: string; elapsedMs: number; differenceMs: number; isWinner: boolean;
  withinTolerance: boolean; prizeStatus: 'winner' | 'outside-tolerance' | 'daily-limit-reached';
  targetMs: number; toleranceMs: number; deviceId: string; playedAt: string;
  syncStatus: 'local' | 'pending' | 'synced';
}
