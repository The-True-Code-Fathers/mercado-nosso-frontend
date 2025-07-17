import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core'
import { provideRouter, withInMemoryScrolling } from '@angular/router'
import { provideHttpClient } from '@angular/common/http'
import { ConfirmationService, MessageService } from 'primeng/api'

import { routes } from './app.routes'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import { providePrimeNG } from 'primeng/config'

import Aura from '@primeng/themes/aura'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'disabled',
      }),
    ),
    provideHttpClient(),
    provideAnimationsAsync(),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: Aura,
        options: { darkModeSelector: '.p-dark' },
      },
    }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Global PrimeNG services for modern Angular
    ConfirmationService,
    MessageService,
  ],
}
