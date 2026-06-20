import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AUTH_SERVICE, TenantService } from '@reddoc/core';
import { ContenedorService } from '../../features/contenedores/services/contenedor.service';
import { ROUTE_PATHS } from '../constants/route-paths.constants';

export const rootRedirectGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AUTH_SERVICE);
  const tenant = inject(TenantService);
  const contenedorService = inject(ContenedorService);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree([ROUTE_PATHS.auth.login]);
  }

  const lastSlug = tenant.getLastSlug();
  if (!lastSlug) {
    return router.createUrlTree([ROUTE_PATHS.contenedores.root]);
  }

  return contenedorService.getAccesos().pipe(
    map((res) => {
      const match = res.results.find((c) => c.schema_name === lastSlug);
      if (!match) {
        return router.createUrlTree([ROUTE_PATHS.contenedores.root]);
      }
      tenant.setCurrent(match);
      return router.parseUrl(ROUTE_PATHS.tenant.dashboard(lastSlug));
    }),
    catchError(() => of(router.createUrlTree([ROUTE_PATHS.contenedores.root]))),
  );
};
