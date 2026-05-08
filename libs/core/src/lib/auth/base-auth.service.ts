import { computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, of, switchMap, tap } from 'rxjs';
import {
  BaseUsuario,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
} from '../models/auth.model';
import { ENVIRONMENT } from '../tokens';
import { TokenRefreshService } from '../services/token-refresh.service';

export interface AuthApiEndpoints {
  login: string;
  register: string;
  logout: string;
  refresh: string;
  me: string;
  forgotPassword: string;
  resetPassword: string;
  resendVerification: string;
  verifyEmail: string;
}

export const AUTH_API_ENDPOINTS: AuthApiEndpoints = {
  login: '/seguridad/login/',
  register: '/seguridad/usuario/',
  logout: '/seguridad/logout/',
  refresh: '/seguridad/refresh/',
  me: '/seguridad/me/',
  forgotPassword: '/seguridad/usuario/recuperar-clave/',
  resetPassword: '/seguridad/usuario/restablecer-clave/',
  resendVerification: '/seguridad/usuario/reenviar-verificacion/',
  verifyEmail: '/seguridad/usuario/verificar-email/',
};

// /me queda fuera: un 401 en ese endpoint debe disparar el refresh automático.
export const AUTH_DEFAULT_SKIP_URLS: string[] = [
  AUTH_API_ENDPOINTS.login,
  AUTH_API_ENDPOINTS.register,
  AUTH_API_ENDPOINTS.logout,
  AUTH_API_ENDPOINTS.refresh,
  AUTH_API_ENDPOINTS.forgotPassword,
  AUTH_API_ENDPOINTS.resetPassword,
  AUTH_API_ENDPOINTS.resendVerification,
  AUTH_API_ENDPOINTS.verifyEmail,
];

export abstract class BaseAuthService<TUser extends BaseUsuario> {
  protected readonly http = inject(HttpClient);
  protected readonly router = inject(Router);
  protected readonly tokenRefresh = inject(TokenRefreshService);
  protected readonly environment = inject(ENVIRONMENT);

  protected readonly apiEndpoints: AuthApiEndpoints = AUTH_API_ENDPOINTS;
  protected abstract readonly loginRoute: string;

  private readonly _currentUser = signal<TUser | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());

  login(credentials: LoginRequest): Observable<TUser | null> {
    return this.http
      .post(`${this.environment.apiUrl}${this.apiEndpoints.login}`, credentials)
      .pipe(switchMap(() => this.me()));
  }

  me(): Observable<TUser | null> {
    return this.http.get<TUser>(`${this.environment.apiUrl}${this.apiEndpoints.me}`).pipe(
      tap((user) => {
        this._currentUser.set(user);
      }),
      catchError(() => {
        this._currentUser.set(null);
        return of(null);
      }),
    );
  }

  refresh(): Observable<void> {
    return this.http.post<void>(`${this.environment.apiUrl}${this.apiEndpoints.refresh}`, {});
  }

  logout(): void {
    this.clearSession();
    this.http
      .post(`${this.environment.apiUrl}${this.apiEndpoints.logout}`, {})
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  forgotPassword(email: string, captchaToken?: string): Observable<void> {
    return this.http.post<void>(`${this.environment.apiUrl}${this.apiEndpoints.forgotPassword}`, {
      email,
      ...(captchaToken && { turnstile_token: captchaToken }),
    });
  }

  resetPassword(token: string, password: string, captchaToken?: string): Observable<void> {
    return this.http.post<void>(`${this.environment.apiUrl}${this.apiEndpoints.resetPassword}`, {
      token,
      nueva_clave: password,
      ...(captchaToken && { turnstile_token: captchaToken }),
    });
  }

  resendVerification(data: ResendVerificationRequest): Observable<void> {
    return this.http.post<void>(
      `${this.environment.apiUrl}${this.apiEndpoints.resendVerification}`,
      data,
    );
  }

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.environment.apiUrl}${this.apiEndpoints.register}`,
      data,
    );
  }

  verifyEmail(token: string): Observable<void> {
    const params = new HttpParams().set('token', token);
    return this.http.get<void>(`${this.environment.apiUrl}${this.apiEndpoints.verifyEmail}`, {
      params,
    });
  }

  protected setCurrentUser(user: TUser | null): void {
    this._currentUser.set(user);
  }

  clearSession(): void {
    this._currentUser.set(null);
    this.tokenRefresh.reset();
    this.router.navigate([this.loginRoute]);
  }
}
