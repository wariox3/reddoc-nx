import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import { firstValueFrom } from 'rxjs';
import { appRoutes } from './app.routes';
import { environment } from '../environments/environment';
import {
  APP_BRANDING,
  ENVIRONMENT,
  ROUTE_PATHS_TOKEN,
  AUTH_SERVICE,
  AUTH_SKIP_URLS,
  ReddocPreset,
  authInterceptor,
  errorInterceptor,
} from '@reddoc/core';
import { AuthService } from './features/auth/services/auth.service';
import { API_ENDPOINTS } from './core/constants/api-endpoints.constants';
import { ROUTE_PATHS } from './core/constants/route-paths.constants';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: ReddocPreset,
        options: {
          darkModeSelector: '.dark-mode',
          cssLayer: { name: 'primeng', order: 'theme, base, primeng, utilities' },
        },
      },
    }),
    MessageService,
    { provide: ENVIRONMENT, useValue: environment },
    {
      provide: ROUTE_PATHS_TOKEN,
      useValue: {
        auth: {
          login: ROUTE_PATHS.auth.login,
          register: ROUTE_PATHS.auth.register,
          forgotPassword: ROUTE_PATHS.auth.forgotPassword,
          resetPassword: ROUTE_PATHS.auth.resetPassword,
          resendVerification: ROUTE_PATHS.auth.resendVerification,
          verifyEmail: ROUTE_PATHS.auth.verifyEmail,
        },
        dashboard: { root: ROUTE_PATHS.contenedores.root },
      },
    },
    {
      provide: APP_BRANDING,
      useValue: { appName: 'ERP', tagline: 'Gestiona tu empresa desde un solo lugar.' },
    },
    { provide: AUTH_SERVICE, useExisting: AuthService },
    {
      provide: AUTH_SKIP_URLS,
      useValue: [
        API_ENDPOINTS.auth.login,
        API_ENDPOINTS.auth.refresh,
        API_ENDPOINTS.auth.logout,
        API_ENDPOINTS.auth.me,
        API_ENDPOINTS.auth.forgotPassword,
        API_ENDPOINTS.auth.resetPassword,
        API_ENDPOINTS.auth.register,
        API_ENDPOINTS.auth.resendVerification,
        API_ENDPOINTS.auth.verifyEmail,
      ],
    },
    provideAppInitializer(() => {
      const auth = inject(AuthService);
      return firstValueFrom(auth.me()).catch(() => null);
    }),
  ],
};
