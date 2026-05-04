import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AUTH_SKIP_URLS, ENVIRONMENT } from '@reddoc/core';

export const ACCESS_TOKEN_KEY = 'reddoc_access_token';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const env = inject(ENVIRONMENT);
  const skipUrls = inject(AUTH_SKIP_URLS, { optional: true }) ?? [];
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  const isSkipped = skipUrls.some((url) => req.url.includes(url));

  if (token && !isSkipped && req.url.includes(env.apiUrl)) {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }

  return next(req);
};
