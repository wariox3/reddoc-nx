import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ROUTE_PATHS_TOKEN } from '../tokens';
import { CONTENEDOR_ACCESS_SERVICE } from './contenedor-access.token';
import { TenantService } from './tenant.service';

export const tenantGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const tenant = inject(TenantService);
  const accesoService = inject(CONTENEDOR_ACCESS_SERVICE);
  const routes = inject(ROUTE_PATHS_TOKEN);

  const slug = route.paramMap.get('tenantSlug');
  const fallback = router.createUrlTree([routes.dashboard.root]);

  if (!slug) return fallback;

  const cached = tenant.accesos();
  if (cached.length > 0) {
    const match = cached.find((c) => c.schema_name === slug);
    if (!match) return fallback;
    tenant.setCurrent(match);
    return true;
  }

  return accesoService.getAccesos().pipe(
    map((res) => {
      tenant.setAccesos(res.results);
      const match = res.results.find((c) => c.schema_name === slug);
      if (!match) return fallback;
      tenant.setCurrent(match);
      return true as const;
    }),
    catchError(() => of(fallback)),
  );
};
