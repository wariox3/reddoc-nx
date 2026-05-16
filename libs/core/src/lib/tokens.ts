import { InjectionToken, Signal } from '@angular/core';
import { Observable } from 'rxjs';
import {
  BaseUsuario,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
} from './models/auth.model';

export interface ReddocEnvironment {
  apiUrl: string;
  turnstileSiteKey: string;
  cuentaUrl?: string;
  wompiPublicKey?: string;
}

export interface RoutePaths {
  auth: {
    login: string;
    register: string;
    forgotPassword: string;
    resetPassword: string;
    resendVerification: string;
    verifyEmail: string;
  };
  dashboard: { root: string };
}

export interface AuthServiceContract {
  readonly currentUser: Signal<BaseUsuario | null>;
  isAuthenticated: () => boolean;
  refresh: () => Observable<unknown>;
  clearSession: () => void;
  login: (data: LoginRequest) => Observable<unknown>;
  register: (data: RegisterRequest) => Observable<RegisterResponse>;
  forgotPassword: (email: string, captchaToken?: string) => Observable<void>;
  resetPassword: (token: string, password: string, captchaToken?: string) => Observable<void>;
  resendVerification: (data: ResendVerificationRequest) => Observable<void>;
  verifyEmail: (token: string) => Observable<void>;
}

export interface AppBranding {
  appName: string;
  tagline?: string;
}

export const ENVIRONMENT = new InjectionToken<ReddocEnvironment>('ReddocEnvironment');
export const ROUTE_PATHS_TOKEN = new InjectionToken<RoutePaths>('RoutePaths');
export const AUTH_SERVICE = new InjectionToken<AuthServiceContract>('AuthService');
export const AUTH_SKIP_URLS = new InjectionToken<string[]>('AuthSkipUrls');
export const APP_BRANDING = new InjectionToken<AppBranding>('AppBranding');
