# @reddoc/core

Librería compartida del monorepo. Punto único de exports vía `@reddoc/core`.

## Áreas

- **`auth/`** — `BaseAuthService<TUser>` abstracto que cada app extiende con su `Usuario`.
- **`guards/`** — `authGuard`, `publicGuard` (consumen `AUTH_SERVICE` token).
- **`interceptors/`** — `authInterceptor`, `errorInterceptor` (manejo de 401 + refresh).
- **`i18n/`** — `I18nService<TDict>` + `provideI18n(dicts)` con signals.
- **`services/`** — `BaseHttpService`, `ToastService`, `TokenRefreshService`, `UserAvatarService`.
- **`tenant/`** — `TenantService` + `tenantGuard` para multi-tenancy con slug.
- **`theme/`** — `ReddocPreset` (tema PrimeNG navy/sky para todas las SPAs).
- **`tokens.ts`** — InjectionTokens: `ENVIRONMENT`, `ROUTE_PATHS_TOKEN`, `AUTH_SERVICE`, `AUTH_SKIP_URLS`, `APP_BRANDING`.
- **`module-config/`** — framework configuracional para documentos transaccionales del ERP. Ver `docs/architecture/erp-module-architecture.md`.

## Convenciones

- Todo standalone (sin `NgModule`).
- Signals para estado; observables solo para I/O.
- Errores tipados (clases que extienden `Error`) — nunca `throw new Error('...')` genérico.

Ver `docs/architecture/erp-module-architecture.md` para la decisión arquitectónica completa del framework de módulos.
