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

## Convenciones

- **Standalone components** en todo el código.
- **Signals** para estado local; evitar `BehaviorSubject` en código nuevo.
- **Lazy loading** vía `loadChildren` en rutas de feature; las páginas de auth se importan eagerly desde `@reddoc/ui` (Nx prohíbe mezclar lazy/eager para una misma lib).
- **Conventional Commits** validados por commitlint en PRs.
- HTTP cookies HttpOnly, no tokens en localStorage. Cada app provee `AUTH_SERVICE` que extiende `BaseAuthService<TUser>`.

Más detalle en [`CLAUDE.md`](./CLAUDE.md).
