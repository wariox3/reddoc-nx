import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { BaseAuthService, AuthApiEndpoints, LoginRequest, AuthResponse } from '@reddoc/core';
import { RegisterRequest, RegisterResponse, Usuario } from '../models/auth.model';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints.constants';
import { ROUTE_PATHS } from '../../../core/constants/route-paths.constants';
import { ACCESS_TOKEN_KEY } from '../../../core/interceptors/jwt.interceptor';

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseAuthService<Usuario> {
  protected readonly apiEndpoints: AuthApiEndpoints = {
    login: API_ENDPOINTS.auth.login,
    logout: API_ENDPOINTS.auth.logout,
    refresh: API_ENDPOINTS.auth.refresh,
    me: API_ENDPOINTS.auth.me,
    forgotPassword: API_ENDPOINTS.auth.forgotPassword,
    resetPassword: API_ENDPOINTS.auth.resetPassword,
    resendVerification: API_ENDPOINTS.auth.resendVerification,
    verifyEmail: API_ENDPOINTS.auth.verifyEmail,
  };

  protected readonly loginRoute = ROUTE_PATHS.auth.login;

  override login(credentials: LoginRequest): Observable<AuthResponse<Usuario>> {
    return this.http
      .post<{ access: string }>(`${this.environment.apiUrl}${this.apiEndpoints.login}`, credentials)
      .pipe(
        tap((res) => localStorage.setItem(ACCESS_TOKEN_KEY, res.access)),
        switchMap(() => this.me()),
      ) as unknown as Observable<AuthResponse<Usuario>>;
  }

  override me(): Observable<Usuario | null> {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      this.setCurrentUser(null);
      return of(null);
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      if (payload.exp && Date.now() / 1000 > payload.exp) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        this.setCurrentUser(null);
        return of(null);
      }

      const userId: string | undefined = payload.user_id;
      if (!userId) return super.me();

      return this.http
        .get<Usuario>(`${this.environment.apiUrl}${API_ENDPOINTS.perfil.update}${userId}/`)
        .pipe(
          tap((user) => this.setCurrentUser(user)),
          catchError(() => {
            this.setCurrentUser(null);
            return of(null);
          }),
        );
    } catch {
      return super.me();
    }
  }

  override clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    super.clearSession();
  }

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.environment.apiUrl}${API_ENDPOINTS.auth.register}`,
      data,
    );
  }
}
