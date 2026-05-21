import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ENVIRONMENT } from '../tokens';
import { TenantService } from '../tenant/tenant.service';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const environment = inject(ENVIRONMENT);
  const tenant = inject(TenantService);

  if (!req.url.startsWith(environment.apiUrl)) return next(req);

  const slug = tenant.currentSlug();
  if (!slug) return next(req);

  return next(req.clone({ setHeaders: { 'X-Tenant': slug } }));
};
