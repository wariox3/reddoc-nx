import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AUTH_SERVICE, ROUTE_PATHS_TOKEN } from '../tokens';

export const publicGuard: CanActivateFn = () => {
  const auth = inject(AUTH_SERVICE);
  const router = inject(Router);
  const routePaths = inject(ROUTE_PATHS_TOKEN);

  if (!auth.isAuthenticated()) return true;

  return router.createUrlTree([routePaths.dashboard.root]);
};
