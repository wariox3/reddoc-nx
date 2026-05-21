import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ENVIRONMENT } from '../tokens';
import { TenantService } from '../tenant/tenant.service';

/**
 * Prefijos de endpoints **globales** — viven en el schema público, no dentro
 * de un tenant. Nunca deben llevar `X-Tenant`: si lo llevan, el backend los
 * resuelve contra el schema del tenant y responde 404.
 *
 * - `/auth/`       → sesión y usuario (login, me, refresh…).
 * - `/contenedor/` → gestión de contenedores (lista del usuario, alta, etc.).
 */
const TENANT_AGNOSTIC_PREFIXES = ['/auth/', '/contenedor/'] as const;

/**
 * Agrega la cabecera `X-Tenant` con el slug del contenedor activo a las
 * peticiones a la API que sí son tenant-scoped. Se saltan las globales
 * (ver `TENANT_AGNOSTIC_PREFIXES`) y las que se hacen sin tenant activo.
 */
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const environment = inject(ENVIRONMENT);
  const tenant = inject(TenantService);

  if (!req.url.startsWith(environment.apiUrl)) return next(req);

  const slug = tenant.currentSlug();
  if (!slug) return next(req);

  const path = req.url.slice(environment.apiUrl.length);
  if (TENANT_AGNOSTIC_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { 'X-Tenant': slug } }));
};
