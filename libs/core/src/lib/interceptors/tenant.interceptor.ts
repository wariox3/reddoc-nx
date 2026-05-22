import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ENVIRONMENT } from '../tokens';
import { TenantService } from '../tenant/tenant.service';
import { TENANT_SCOPED } from '../tenant/tenant-http-context';

/**
 * Agrega la cabecera `X-Tenant` con el slug del contenedor activo a las
 * peticiones que sí son tenant-scoped.
 *
 * El interceptor **no conoce ninguna feature**: cada petición declara su scope
 * vía el token `TENANT_SCOPED` (default `true`). Los servicios cuyo endpoint
 * vive en el schema público lo marcan en `false` —ver `BaseHttpService` y
 * `BaseAuthService`—, así la decisión vive junto al dueño del endpoint.
 *
 * Se saltan también las peticiones que no van a la API y las que se hacen sin
 * tenant activo.
 */
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const environment = inject(ENVIRONMENT);
  const tenant = inject(TenantService);

  if (!req.url.startsWith(environment.apiUrl)) return next(req);
  if (!req.context.get(TENANT_SCOPED)) return next(req);

  const slug = tenant.currentSlug();
  if (!slug) return next(req);

  return next(req.clone({ setHeaders: { 'X-Tenant': slug } }));
};
