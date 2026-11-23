import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { GameResult } from './game-result.model';
import { GameSettings } from './game-settings.service';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly storagePrefix = 'boton-stop.audit-log.v2.';
  private readonly legacyStorageKey = 'boton-stop.audit-log.v1';
  private readonly maximumEntriesPerDay = 5_000;

  constructor() { this.migrateLegacyLog(); }

  recordGame(result: GameResult): void {
    this.append('PARTIDA', [
      `jugador="${this.clean(result.playerName)}"`,
      `tiempo=${(result.elapsedMs / 1_000).toFixed(3)}s`,
      `diferencia=${(result.differenceMs / 1_000).toFixed(3)}s`,
      `ganador=${result.isWinner ? 'sí' : 'no'}`,
      `estado_premio=${result.prizeStatus}`,
      `dentro_tolerancia=${result.withinTolerance ? 'sí' : 'no'}`,
      `descuento=${result.discountPercent ? `${result.discountPercent}%` : 'ninguno'}`,
      `dispositivo="${this.clean(result.deviceName)}"`,
      `id_dispositivo=${result.deviceId}`,
    ].join(' | '), new Date(result.playedAt), result.deviceName, result.deviceId);
  }

  recordSettings(settings: GameSettings, deviceId: string): void {
    this.append('CONFIGURACIÓN', [
      `dispositivo="${this.clean(settings.deviceName)}"`,
      `id_dispositivo=${deviceId}`,
      `tolerancia=${settings.toleranceMs}ms`,
      `máximo_ganadores=${settings.maxWinnersPerDay}`,
      `ocultar_cronómetro=${this.yesNo(settings.hideTimerEnabled)}`,
      `ocultar_desde=${(settings.hideTimerAfterMs / 1_000).toFixed(1)}s`,
      `ocultar_resultado=${this.yesNo(settings.hideResultDetailsEnabled)}`,
      `sonido_vibración=${this.yesNo(settings.soundEnabled)}`,
      `descuento_aleatorio=${this.yesNo(settings.randomDiscountEnabled)}`,
    ].join(' | '), new Date(), settings.deviceName, deviceId);
  }

  recordSystem(event: string, details: string, deviceName: string, deviceId: string): void {
    this.append('SISTEMA', `evento=${event} | ${details}`, new Date(), deviceName, deviceId);
  }

  availableDates(): string[] {
    const dates: string[] = [];
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (key?.startsWith(this.storagePrefix)) dates.push(key.slice(this.storagePrefix.length));
    }
    return dates.sort((a, b) => b.localeCompare(a));
  }

  today(): string { return this.localDay(new Date()); }

  async openTextFile(date: string, deviceName: string, deviceId: string): Promise<void> {
    const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : this.today();
    const filename = this.filename(safeDate, deviceName);
    const contents = this.asText(safeDate, deviceName, deviceId);
    if (Capacitor.isNativePlatform()) {
      const file = await Filesystem.writeFile({ path: filename, data: contents, directory: Directory.Cache, encoding: Encoding.UTF8 });
      await Share.share({
        title: `Registro STOP TEN ${safeDate}`,
        text: `Registro diario de ${deviceName} correspondiente al ${safeDate}.`,
        files: [file.uri],
        dialogTitle: 'Abrir o exportar el registro diario',
      });
      return;
    }
    const blob = new Blob([contents], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  private append(type: string, details: string, occurredAt: Date, deviceName: string, deviceId: string): void {
    const date = this.localDay(occurredAt);
    const entries = this.read(date);
    entries.push(`[${occurredAt.toISOString()}] ${type} | ${details}`);
    if (entries.length > this.maximumEntriesPerDay) entries.splice(0, entries.length - this.maximumEntriesPerDay);
    localStorage.setItem(this.storageKey(date), JSON.stringify(entries));
    if (Capacitor.isNativePlatform()) void this.persistNativeFile(date, deviceName, deviceId).catch(() => undefined);
  }

  private async persistNativeFile(date: string, deviceName: string, deviceId: string): Promise<void> {
    await Filesystem.writeFile({
      path: `logs/${this.filename(date, deviceName)}`,
      data: this.asText(date, deviceName, deviceId),
      directory: Directory.Data,
      encoding: Encoding.UTF8,
      recursive: true,
    });
  }

  private asText(date: string, deviceName: string, deviceId: string): string {
    const entries = this.read(date);
    const games = entries.filter((entry) => entry.includes('] PARTIDA |')).length;
    const winners = entries.filter((entry) => entry.includes('] PARTIDA |') && entry.includes('ganador=sí')).length;
    return [
      'STOP TEN - REGISTRO DIARIO', `Fecha: ${date}`, `Dispositivo: ${deviceName}`, `ID técnico: ${deviceId}`,
      `Total de partidas: ${games}`, `Ganadores: ${winners}`, `Total de eventos: ${entries.length}`,
      '------------------------------------------------------------', ...entries, '',
    ].join('\r\n');
  }

  private read(date: string): string[] {
    const stored = localStorage.getItem(this.storageKey(date));
    if (!stored) return [];
    try {
      const value = JSON.parse(stored);
      return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
    } catch { return []; }
  }

  private migrateLegacyLog(): void {
    const stored = localStorage.getItem(this.legacyStorageKey);
    if (!stored) return;
    try {
      const entries = JSON.parse(stored);
      if (!Array.isArray(entries)) return;
      for (const entry of entries.filter((value): value is string => typeof value === 'string')) {
        const match = entry.match(/^\[([^\]]+)\]/);
        const parsed = match ? new Date(match[1]) : new Date();
        const date = this.localDay(Number.isNaN(parsed.getTime()) ? new Date() : parsed);
        const daily = this.read(date);
        daily.push(entry);
        localStorage.setItem(this.storageKey(date), JSON.stringify(daily.slice(-this.maximumEntriesPerDay)));
      }
      localStorage.removeItem(this.legacyStorageKey);
    } catch { /* Conserva el registro anterior si no puede migrarse. */ }
  }

  private storageKey(date: string): string { return `${this.storagePrefix}${date}`; }

  private filename(date: string, deviceName: string): string {
    const slug = deviceName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'tablet';
    return `stop-ten-${date}-${slug}.txt`;
  }

  private localDay(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private clean(value: string): string { return value.replace(/[\r\n|]/g, ' ').trim(); }
  private yesNo(value: boolean): string { return value ? 'sí' : 'no'; }
}
