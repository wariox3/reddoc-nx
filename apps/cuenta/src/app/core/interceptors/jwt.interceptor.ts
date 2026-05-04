import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ENVIRONMENT } from '@reddoc/core';

export const ACCESS_TOKEN_KEY = 'reddoc_access_token';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const env = inject(ENVIRONMENT);
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (token && req.url.includes(env.apiUrl)) {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }

  return next(req);
};
