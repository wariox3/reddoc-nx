import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface ReddocEnvironment {
  apiUrl: string;
  turnstileSiteKey: string;
  cuentaUrl?: string;
}

export interface RoutePaths {
  auth: { login: string };
  dashboard: { root: string };
}

export interface AuthServiceContract {
  isAuthenticated: () => boolean;
  refresh: () => Observable<unknown>;
  clearSession: () => void;
}

export const ENVIRONMENT = new InjectionToken<ReddocEnvironment>('ReddocEnvironment');
export const ROUTE_PATHS_TOKEN = new InjectionToken<RoutePaths>('RoutePaths');
export const AUTH_SERVICE = new InjectionToken<AuthServiceContract>('AuthService');
export const AUTH_SKIP_URLS = new InjectionToken<string[]>('AuthSkipUrls');
