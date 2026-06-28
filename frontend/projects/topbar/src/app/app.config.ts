import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { ToastService } from '@general/services/toast.service';
import { ToastVoidService } from '@general/services/toast-void.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideStore(),
    {
      provide: ToastService,
      useClass: ToastVoidService,
    },
  ],
};
