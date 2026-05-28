# Reddoc Monorepo

Monorepo Nx con la plataforma RedDoc: 1 site marketing + 6 apps internas que comparten infraestructura de auth, UI y diseño.

## Apps

| App          | Puerto | Tipo                  | Descripción                                  |
| ------------ | ------ | --------------------- | -------------------------------------------- |
| `landing`    | 4200   | Angular SSR/SSG       | Site público / marketing (Tailwind, i18n)    |
| `erp`        | 4201   | Angular SPA + PrimeNG | ERP — gestión empresarial (módulo principal) |
| `cuenta`     | 4203   | Angular SPA + PrimeNG | Perfil y seguridad de la cuenta              |
| `transporte` | 4204   | Angular SPA + PrimeNG | Gestión de transporte                        |
| `pos`        | 4205   | Angular SPA + PrimeNG | Punto de venta                               |
| `turnos`     | 4206   | Angular SPA + PrimeNG | Gestión de turnos                            |
| `cliente`    | 4207   | Angular SPA + PrimeNG | Portal de clientes                           |

## Libs compartidas

- `@reddoc/core` — `BaseAuthService`, guards, interceptors, tokens (`ENVIRONMENT`, `AUTH_SERVICE`, `ROUTE_PATHS_TOKEN`, `APP_BRANDING`), tema PrimeNG (`ReddocPreset`).
- `@reddoc/ui` — `TurnstileComponent`, páginas de auth (`LoginComponent`, `RegisterComponent`, `ForgotPasswordComponent`, `ResetPasswordComponent`, `ResendVerificationComponent`, `VerifyEmailComponent`), assets compartidos (logos).
- `@reddoc/styles` — design tokens SCSS y `@theme` Tailwind compartido (colores brand, animaciones).

## Setup

```bash
npm install --legacy-peer-deps
```

> El flag `--legacy-peer-deps` es obligatorio: `angular-eslint@21` declara peer en `@angular/cli@21` pero el repo usa `@angular/cli@20`.

## Comandos comunes

Todas las tareas pasan por Nx:

```bash
# Servir una app
npx nx serve landing       # http://localhost:4200
npx nx serve erp           # http://localhost:4201
npx nx serve cuenta        # http://localhost:4203
# ... idem para transporte/pos/turnos/cliente

# Build
npx nx build erp
npx nx run-many -t build   # todas

# Lint
npx nx lint erp
npx nx run-many -t lint

# Affected (CI-style, contra main)
npx nx affected -t lint
npx nx affected -t build

# Release
npm run release            # commit-and-tag-version
```

## Apuntar a un backend local

Por defecto las SPAs proxean `/api/*` a `https://reddocapi.uk`. Si corrés el backend Django local en `http://localhost:8000`, serví con el proxy alternativo:

```bash
npx nx serve erp        --proxy-config=apps/erp/proxy.conf.local.json
npx nx serve cuenta     --proxy-config=apps/cuenta/proxy.conf.local.json
npx nx serve transporte --proxy-config=apps/transporte/proxy.conf.local.json
npx nx serve pos        --proxy-config=apps/pos/proxy.conf.local.json
npx nx serve turnos     --proxy-config=apps/turnos/proxy.conf.local.json
npx nx serve cliente    --proxy-config=apps/cliente/proxy.conf.local.json
```

Sin el flag, `nx serve` sigue usando el `proxy.conf.json` default que apunta a staging — no hace falta revertir nada.

El Django local debe servir las rutas en la raíz (`/seguridad/login/`, no `/api/seguridad/login/`) y tener habilitados para que el login por cookie funcione:

- `CORS_ALLOW_CREDENTIALS = True`
- `CSRF_COOKIE_SECURE = False`, `SESSION_COOKIE_SECURE = False`
- `CSRF_TRUSTED_ORIGINS` con `http://localhost:4201`, `:4203`, `:4204`, `:4205`, `:4206`, `:4207`

Si las requests devuelven 404, lo más probable es que el backend local sirva bajo `/api/`. En ese caso, quitá la línea `pathRewrite` del `proxy.conf.local.json` correspondiente.

## Convenciones

- **Standalone components** en todo el código.
- **Signals** para estado local; evitar `BehaviorSubject` en código nuevo.
- **Lazy loading** vía `loadChildren` en rutas de feature; las páginas de auth se importan eagerly desde `@reddoc/ui` (Nx prohíbe mezclar lazy/eager para una misma lib).
- **Conventional Commits** validados por commitlint en PRs.
- HTTP cookies HttpOnly, no tokens en localStorage. Cada app provee `AUTH_SERVICE` que extiende `BaseAuthService<TUser>`.

Más detalle en [`CLAUDE.md`](./CLAUDE.md).
