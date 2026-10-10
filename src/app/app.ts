import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameTimerService } from './core/game-timer.service';
import { GameResult } from './core/game-result.model';
import { ResultsService } from './core/results.service';
import { createId } from './core/id.util';
import { GameSettingsService } from './core/game-settings.service';

@Component({
  imports: [FormsModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly timer = inject(GameTimerService);
  private readonly resultsService = inject(ResultsService);
  protected readonly gameSettings = inject(GameSettingsService);
  protected readonly settings = this.gameSettings.settings;
  protected readonly playerName = signal('');
  protected readonly screen = signal<'game' | 'ranking' | 'admin'>('game');
  protected readonly phase = signal<'ready' | 'running' | 'result'>('ready');
  protected readonly elapsedMs = this.timer.elapsedMs;
  protected readonly lastResult = signal<GameResult | null>(null);
  protected readonly results = this.resultsService.results;
  protected readonly topResults = computed(() => this.results().slice(0, 10));
  protected readonly winnersToday = computed(() => this.resultsService.winnersOn());
  protected readonly prizesRemaining = computed(() => Math.max(0, this.settings().maxWinnersPerDay - this.winnersToday()));
  protected readonly timerHidden = computed(() =>
    this.phase() === 'running' &&
    this.settings().hideTimerEnabled &&
    this.elapsedMs() >= this.settings().hideTimerAfterMs,
  );

  protected readonly adminUnlocked = signal(false);
  protected readonly pinInput = signal('');
  protected readonly pinError = signal(false);

  protected startGame(): void {
    if (this.phase() !== 'ready') return;
    this.lastResult.set(null);
    this.phase.set('running');
    this.timer.start();
  }

  protected async stopGame(): Promise<void> {
    if (this.phase() !== 'running') return;
    const elapsedMs = this.timer.stop();
    const rules = this.settings();
    const differenceMs = elapsedMs - rules.targetMs;
    const withinTolerance = Math.abs(differenceMs) <= rules.toleranceMs;
    const hasPrizeSlot = this.resultsService.winnersOn() < rules.maxWinnersPerDay;
    const isWinner = withinTolerance && hasPrizeSlot;
    const result: GameResult = {
      id: createId(), playerName: this.playerName().trim() || 'Anónimo', elapsedMs,
      differenceMs, isWinner, withinTolerance,
      prizeStatus: isWinner ? 'winner' : withinTolerance ? 'daily-limit-reached' : 'outside-tolerance',
      targetMs: rules.targetMs, toleranceMs: rules.toleranceMs,
      deviceId: this.resultsService.deviceId, playedAt: new Date().toISOString(), syncStatus: 'local',
    };
    this.lastResult.set(result);
    this.phase.set('result');
    await this.resultsService.add(result);
  }

  protected resetGame(): void { this.timer.reset(); this.phase.set('ready'); this.lastResult.set(null); }
  protected formatTime(ms: number): string { return (ms / 1000).toFixed(3); }
  protected formatDifference(ms: number): string { return `${ms > 0 ? '+' : ''}${(ms / 1000).toFixed(3)} s`; }
  protected async clearResults(): Promise<void> {
    if (confirm('¿Deseas borrar todo el ranking de este dispositivo?')) await this.resultsService.clear();
  }
  protected unlockAdmin(): void {
    const valid = this.pinInput() === this.settings().adminPin;
    this.adminUnlocked.set(valid); this.pinError.set(!valid);
    if (valid) this.pinInput.set('');
  }
  protected saveSettings(
    toleranceMs: number,
    maxWinnersPerDay: number,
    adminPin: string,
    hideTimerEnabled: boolean,
    hideTimerAfterSeconds: number,
  ): void {
    this.gameSettings.update({
      toleranceMs,
      maxWinnersPerDay,
      adminPin,
      hideTimerEnabled,
      hideTimerAfterMs: hideTimerAfterSeconds * 1_000,
    });
  }
  protected lockAdmin(): void { this.adminUnlocked.set(false); this.screen.set('game'); }

  @HostListener('window:keydown.space', ['$event'])
  protected handleSpace(event: Event): void {
    if ((event.target as HTMLElement | null)?.tagName === 'INPUT') return;
    event.preventDefault();
    if (this.screen() !== 'game') return;
    if (this.phase() === 'ready') this.startGame();
    else if (this.phase() === 'running') void this.stopGame();
  }
}
