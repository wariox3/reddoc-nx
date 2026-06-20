import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AUTH_SERVICE, AUTH_SKIP_URLS, ROUTE_PATHS_TOKEN } from '../tokens';
import { ToastService } from '../services/toast.service';
import { TokenRefreshService } from '../services/token-refresh.service';
import { TenantService } from '../tenant/tenant.service';
import { classifyStatus } from '../utils/error-normalizer';
import {
  handleConnectionError,
  handleForbidden,
  handleNotFoundOrClient,
  handleServerError,
  handleTooManyRequests,
  handleUnauthorized,
} from './error-handlers';

/**
 * Contrato de manejo de errores HTTP — quién muestra el error:
 *
 * - network (0)          → toast.error (interceptor)
 * - validation (400/422) → SIN toast; lo renderiza el formulario/banner inline
 * - unauthorized (401)   → refresh de token; sin toast
 * - forbidden (403)      → toast.error (salvo cuenta sin verificar)
 * - notFound (404)       → toast.error
 * - conflict (409)       → toast.error
 * - rateLimit (429)      → toast.warn
 * - client (otro 4xx)    → toast.error
 * - server (>=500)       → toast.error
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AUTH_SERVICE);
  const toast = inject(ToastService);
  const tokenRefresh = inject(TokenRefreshService);
  const skipUrls = inject(AUTH_SKIP_URLS);
  const router = inject(Router);
  const tenant = inject(TenantService);
  const routes = inject(ROUTE_PATHS_TOKEN);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (classifyStatus(error.status)) {
        case 'network':
          return handleConnectionError(toast, error);
        case 'unauthorized':
          return handleUnauthorized(req, next, authService, tokenRefresh, error, skipUrls);
        case 'forbidden':
          return handleForbidden(toast, router, tenant, routes, error);
        case 'notFound':
        case 'conflict':
        case 'client':
          return handleNotFoundOrClient(toast, error);
        case 'rateLimit':
          return handleTooManyRequests(toast, error);
        case 'server':
        case 'unknown':
          return handleServerError(toast, error);
        case 'validation':
          console.debug(`[HTTP ${error.status}] validación — la maneja el formulario`, error.url);
          return throwError(() => error);
      }
    }),
  );
};
