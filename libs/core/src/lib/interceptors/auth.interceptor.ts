import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ENVIRONMENT } from '../tokens';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const environment = inject(ENVIRONMENT);

  if (!req.url.startsWith(environment.apiUrl)) return next(req);

  return next(req.clone({ withCredentials: true }));
};
