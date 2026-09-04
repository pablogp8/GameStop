import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { LocalResultsRepository } from './core/local-results.repository';
import { RESULTS_REPOSITORY } from './core/results.repository';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes), LocalResultsRepository,
    { provide: RESULTS_REPOSITORY, useExisting: LocalResultsRepository }],
};
