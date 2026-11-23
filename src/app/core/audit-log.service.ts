import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { GameResult } from './game-result.model';
import { GameSettings } from './game-settings.service';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly storageKey = 'boton-stop.audit-log.v1';
  private readonly maximumEntries = 20_000;

  recordGame(result: GameResult): void {
    this.append(
      'PARTIDA',
      [
        `jugador="${this.clean(result.playerName)}"`,
        `tiempo=${(result.elapsedMs / 1_000).toFixed(3)}s`,
        `diferencia=${(result.differenceMs / 1_000).toFixed(3)}s`,
        `ganador=${result.isWinner ? 'sí' : 'no'}`,
        `dentro_tolerancia=${result.withinTolerance ? 'sí' : 'no'}`,
        `descuento=${result.discountPercent ? `${result.discountPercent}%` : 'ninguno'}`,
        `dispositivo=${result.deviceId}`,
      ].join(' | '),
    );
  }

  recordSettings(settings: GameSettings): void {
    this.append(
      'CONFIGURACIÓN',
      [
        `tolerancia=${settings.toleranceMs}ms`,
        `máximo_ganadores=${settings.maxWinnersPerDay}`,
        `ocultar_cronómetro=${this.yesNo(settings.hideTimerEnabled)}`,
        `ocultar_desde=${(settings.hideTimerAfterMs / 1_000).toFixed(1)}s`,
        `ocultar_resultado=${this.yesNo(settings.hideResultDetailsEnabled)}`,
        `sonido_vibración=${this.yesNo(settings.soundEnabled)}`,
        `descuento_aleatorio=${this.yesNo(settings.randomDiscountEnabled)}`,
      ].join(' | '),
    );
  }

  async openTextFile(): Promise<void> {
    const contents = this.asText();
    if (Capacitor.isNativePlatform()) {
      const file = await Filesystem.writeFile({
        path: 'game-stop-log.txt',
        data: contents,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });
      await Share.share({
        title: 'Registro Game Stop',
        text: 'Registro de partidas y cambios de configuración.',
        files: [file.uri],
        dialogTitle: 'Abrir o exportar el registro',
      });
      return;
    }

    const blob = new Blob([contents], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  private append(type: string, details: string): void {
    const entries = this.read();
    entries.push(`[${new Date().toISOString()}] ${type} | ${details}`);
    if (entries.length > this.maximumEntries) entries.splice(0, entries.length - this.maximumEntries);
    localStorage.setItem(this.storageKey, JSON.stringify(entries));
  }

  private asText(): string {
    const lines = this.read();
    return [
      'GAME STOP - REGISTRO DE ACTIVIDAD',
      `Generado: ${new Date().toLocaleString()}`,
      `Total de eventos: ${lines.length}`,
      '------------------------------------------------------------',
      ...lines,
      '',
    ].join('\r\n');
  }

  private read(): string[] {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return [];
    try {
      const value = JSON.parse(stored);
      return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
    } catch {
      return [];
    }
  }

  private clean(value: string): string {
    return value.replace(/[\r\n|]/g, ' ').trim();
  }

  private yesNo(value: boolean): string {
    return value ? 'sí' : 'no';
  }
}
