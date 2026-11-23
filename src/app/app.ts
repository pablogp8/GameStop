import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { GameTimerService } from './core/game-timer.service';
import { GameResult } from './core/game-result.model';
import { ResultsService } from './core/results.service';
import { createId } from './core/id.util';
import { GameSettingsService } from './core/game-settings.service';
import { AudioFeedbackService } from './core/audio-feedback.service';
import { AuditLogService } from './core/audit-log.service';

@Component({
  imports: [FormsModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly timer = inject(GameTimerService);
  private readonly resultsService = inject(ResultsService);
  private readonly audioFeedback = inject(AudioFeedbackService);
  private readonly auditLog = inject(AuditLogService);
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
  protected readonly confettiPieces = Array.from({ length: 150 }, (_, index) => {
    const angle = (index / 150) * Math.PI * 2 + ((index % 7) - 3) * 0.028;
    const distance = 130 + ((index * 47) % 230);
    return {
      delay: (index * 13) % 320,
      duration: 2_200 + ((index * 61) % 1_050),
      x: `${Math.cos(angle) * distance}px`,
      y: `${Math.sin(angle) * distance}px`,
      rotation: `${420 + ((index * 97) % 720)}deg`,
    };
  });
  protected readonly timerHidden = computed(() =>
    this.phase() === 'running' &&
    this.settings().hideTimerEnabled &&
    this.elapsedMs() >= this.settings().hideTimerAfterMs,
  );

  protected readonly adminUnlocked = signal(false);
  protected readonly pinInput = signal('');
  protected readonly pinError = signal(false);
  protected readonly settingsSaved = signal(false);
  protected readonly logMessage = signal('');
  private settingsSavedTimer: number | undefined;

  constructor() {
    if (Capacitor.isNativePlatform()) void this.initializeNativeApp();
  }

  protected startGame(): void {
    if (this.phase() !== 'ready') return;
    this.lastResult.set(null);
    this.phase.set('running');
    this.timer.start();
    this.audioFeedback.startClock(this.settings().soundEnabled);
    void this.nativeImpact(ImpactStyle.Light);
    this.webVibrate(35);
  }

  protected async stopGame(): Promise<void> {
    if (this.phase() !== 'running') return;
    const elapsedMs = this.timer.stop();
    this.audioFeedback.stopClock();
    const rules = this.settings();
    const differenceMs = elapsedMs - rules.targetMs;
    const withinTolerance = Math.abs(differenceMs) <= rules.toleranceMs;
    const hasPrizeSlot = this.resultsService.winnersOn() < rules.maxWinnersPerDay;
    const isWinner = withinTolerance && hasPrizeSlot;
    const discountPercent = isWinner && rules.randomDiscountEnabled ? this.drawDiscount() : undefined;
    const result: GameResult = {
      id: createId(), playerName: this.playerName().trim() || 'Anónimo', elapsedMs,
      differenceMs, isWinner, withinTolerance,
      prizeStatus: isWinner ? 'winner' : withinTolerance ? 'daily-limit-reached' : 'outside-tolerance',
      discountPercent,
      targetMs: rules.targetMs, toleranceMs: rules.toleranceMs,
      deviceId: this.resultsService.deviceId, playedAt: new Date().toISOString(), syncStatus: 'local',
    };
    this.lastResult.set(result);
    this.phase.set('result');
    await this.resultsService.add(result);
    this.auditLog.recordGame(result);
    this.audioFeedback.playResult(isWinner, rules.soundEnabled);
    void this.nativeResultFeedback(isWinner);
    this.webVibrate(isWinner ? [80, 45, 120, 55, 220] : [130, 70, 130]);
  }

  protected resetGame(): void { this.timer.reset(); this.audioFeedback.stopClock(); this.phase.set('ready'); this.lastResult.set(null); }
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
    hideResultDetailsEnabled: boolean,
    soundEnabled: boolean,
    randomDiscountEnabled: boolean,
  ): void {
    this.gameSettings.update({
      toleranceMs,
      maxWinnersPerDay,
      adminPin,
      hideTimerEnabled,
      hideTimerAfterMs: hideTimerAfterSeconds * 1_000,
      hideResultDetailsEnabled,
      soundEnabled,
      randomDiscountEnabled,
    });
    this.auditLog.recordSettings(this.settings());
    this.audioFeedback.playSaveConfirmation(soundEnabled);
    if (soundEnabled) {
      void this.nativeImpact(ImpactStyle.Medium);
      this.webVibrate([35, 35, 75]);
    }
    this.settingsSaved.set(true);
    if (this.settingsSavedTimer !== undefined) window.clearTimeout(this.settingsSavedTimer);
    this.settingsSavedTimer = window.setTimeout(() => this.settingsSaved.set(false), 3_500);

  }
  private drawDiscount(): 5 | 10 {
    const randomByte = new Uint8Array(1);
    if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(randomByte);
    else randomByte[0] = Math.floor(Math.random() * 256);
    return randomByte[0] % 2 === 0 ? 5 : 10;
  }

  protected async openAuditLog(): Promise<void> {
    try {
      await this.auditLog.openTextFile();
      this.logMessage.set('Registro abierto correctamente.');
    } catch {
      this.logMessage.set('No fue posible abrir el registro.');
    }
    window.setTimeout(() => this.logMessage.set(''), 3_500);
  }

  private async initializeNativeApp(): Promise<void> {
    await Promise.allSettled([
      ScreenOrientation.lock({ orientation: 'portrait' }),
      StatusBar.hide(),
    ]);
    await SplashScreen.hide({ fadeOutDuration: 250 });
  }

  private async nativeImpact(style: ImpactStyle): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    await Haptics.impact({ style });
  }

  private async nativeResultFeedback(isWinner: boolean): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    if (isWinner) await Haptics.notification({ type: NotificationType.Success });
    else await Haptics.impact({ style: ImpactStyle.Medium });
  }

  private webVibrate(pattern: number | number[]): void {
    if (Capacitor.isNativePlatform()) return;
    navigator.vibrate?.(pattern);
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
