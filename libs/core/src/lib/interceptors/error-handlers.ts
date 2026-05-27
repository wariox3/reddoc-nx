import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { AuthServiceContract, RoutePaths } from '../tokens';
import { ToastService } from '../services/toast.service';
import { TokenRefreshService } from '../services/token-refresh.service';
import { TenantService } from '../tenant/tenant.service';
import { normalizeHttpError } from '../utils/error-normalizer';
import { isSuscripcionVencidaError, isUnverifiedAccountError } from '../utils/error.utils';

function isAuthUrl(url: string, skipUrls: string[]): boolean {
  return skipUrls.some((endpoint) => url.includes(endpoint));
}

export function handleConnectionError(
  toast: ToastService,
  error: HttpErrorResponse,
): Observable<never> {
  toast.error('Error de conexión', normalizeHttpError(error).message);
  return throwError(() => error);
}

export function handleUnauthorized(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthServiceContract,
  tokenRefresh: TokenRefreshService,
  error: HttpErrorResponse,
  skipUrls: string[],
): Observable<HttpEvent<unknown>> {
  if (isAuthUrl(req.url, skipUrls)) {
    return throwError(() => error);
  }

  if (!tokenRefresh.refreshing) {
    tokenRefresh.startRefresh();

    return authService.refresh().pipe(
      switchMap(() => {
        tokenRefresh.completeRefresh();
        return next(req);
      }),
      catchError((refreshError) => {
        tokenRefresh.failRefresh();
        authService.clearSession();
        return throwError(() => refreshError);
      }),
    );
  }

  return tokenRefresh.waitForRefresh().pipe(
    switchMap((success) => {
      if (success) {
        return next(req);
      }
      return throwError(() => error);
    }),
  );
}

export function handleForbidden(
  toast: ToastService,
  router: Router,
  tenant: TenantService,
  routes: RoutePaths,
  error: HttpErrorResponse,
): Observable<never> {
  if (isUnverifiedAccountError(error)) {
    return throwError(() => error);
  }

  if (isSuscripcionVencidaError(error)) {
    const target = routes.dashboard.root;
    if (!router.url.startsWith(target)) {
      tenant.clear();
      toast.warn('Suscripción vencida', normalizeHttpError(error).message);
      router.navigateByUrl(target);
    }
    return throwError(() => error);
  }

  toast.error('Acceso denegado', normalizeHttpError(error).message);
  return throwError(() => error);
}

export function handleNotFoundOrClient(
  toast: ToastService,
  error: HttpErrorResponse,
): Observable<never> {
  const normalized = normalizeHttpError(error);
  const summary =
    normalized.kind === 'notFound'
      ? 'No encontrado'
      : normalized.kind === 'conflict'
        ? 'Conflicto'
        : 'Solicitud no procesada';
  toast.error(summary, normalized.message);
  return throwError(() => error);
}

export function handleTooManyRequests(
  toast: ToastService,
  error: HttpErrorResponse,
): Observable<never> {
  toast.warn('Demasiadas solicitudes', normalizeHttpError(error).message);
  return throwError(() => error);
}

export function handleServerError(
  toast: ToastService,
  error: HttpErrorResponse,
): Observable<never> {
  toast.error('Error del servidor', normalizeHttpError(error).message);
  return throwError(() => error);
}
