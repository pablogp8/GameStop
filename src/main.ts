/**
 * STOP TEN
 * Descripción: juego de detener cronómetro a los 10 segundos
 *
 * @author Tu Rosso Pablo Jonathan Yeguech Sanic <pablogp8@gmail.com>
 * @copyright 2026 SICOGUA
 * @version 1.0.0
 */

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
