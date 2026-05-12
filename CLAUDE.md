# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All tasks run through Nx. Use `npx nx <target> <project>`.

```bash
# Serve
npx nx serve landing       # SSR/SSG dev server  → http://localhost:4200
npx nx serve erp           # ERP SPA             → http://localhost:4201
npx nx serve cuenta        # Cuenta SPA          → http://localhost:4203
npx nx serve transporte    # Transporte SPA      → http://localhost:4204
npx nx serve pos           # POS SPA             → http://localhost:4205
npx nx serve turnos        # Turnos SPA          → http://localhost:4206
npx nx serve cliente       # Cliente SPA         → http://localhost:4207

# Build
npx nx build landing       # Static + SSR build
npx nx build erp           # SPA build
npx nx run-many -t build   # all projects

# Lint
npx nx lint <project>
npx nx run-many -t lint

# Affected (CI-style, based on git diff vs main)
npx nx affected -t build
npx nx affected -t lint

# Release
npm run release            # commit-and-tag-version bump + changelog
```

**Installing packages:** always pass `--legacy-peer-deps` due to a pre-existing peer conflict between `angular-eslint@21` and `@angular/cli@20`.

## Architecture

```
apps/
  landing/      Angular 20 SSR/SSG, Tailwind, port 4200 — public marketing site
  erp/          Angular 20 SPA, PrimeNG 20, port 4201 — ERP application
  cuenta/       SPA + PrimeNG, port 4203 — perfil y seguridad de la cuenta
  transporte/   SPA + PrimeNG, port 4204 — gestión de transporte
  pos/          SPA + PrimeNG, port 4205 — punto de venta
  turnos/       SPA + PrimeNG, port 4206 — gestión de turnos
  cliente/      SPA + PrimeNG, port 4207 — portal de clientes
libs/
  core/         Auth, tokens, theme, i18n, tenant + data-list building blocks (cross-app)
  ui/           Shared standalone components: TurnstileComponent + auth pages
  feature-base/ DataTableComponent (tonto, cross-app)
  styles/       SCSS design tokens + Tailwind @theme (brand colors, animations)
```

Path aliases: `@reddoc/core`, `@reddoc/ui`, `@reddoc/feature-base`, `@reddoc/styles`.

**Lo que ES cross-app va en libs/. Lo que es ERP-específico vive en `apps/erp/src/app/core/`** — incluyendo el framework configuracional de documentos.

### landing

- **SSG** — `outputMode: static` with pre-rendered routes from `routes.txt`. Has a real Express `server.ts`.
- **i18n** — translation files under `src/app/i18n/`; components consume them via a translation pipe/service.
- **Tailwind** — imported via `src/tailwind.css`. Shared SCSS tokens not used here; use Tailwind utilities.
- No PrimeNG. No auth.

### apps/erp + cuenta + transporte + pos + turnos + cliente (SPAs)

The 6 SPAs share the same skeleton:

- No SSR, no hydration provider.
- **Proxy** — `proxy.conf.json` rewrites `/api/*` to `https://reddocapi.uk` (the staging/prod API). All HTTP uses the relative `/api` prefix injected via `ENVIRONMENT.apiUrl`.
- **PrimeNG theme** — single `ReddocPreset` exported from `@reddoc/core` (navy `#143049` primary, sky `#77aad7` accent), used by every app via `providePrimeNG({ theme: { preset: ReddocPreset, ... } })`.
- **Environments** — `src/environments/environment.ts` (dev), `.staging.ts`, `.prod.ts`. Swap via `fileReplacements` in `project.json`.
- **Auth pages** — every app loads `LoginComponent`/`RegisterComponent`/etc. directly from `@reddoc/ui`. Per-app branding is provided via the `APP_BRANDING` token (`{ appName, tagline }`).
- **Tailwind brand tokens** — each app's `src/tailwind.css` imports `libs/styles/src/tailwind/brand.css`, which exposes `--color-brand-*` and the `fade-up` / `drift1` / `drift2` animations as Tailwind v4 `@theme` values.
- **Logos** — `libs/ui/src/assets/logos/` is wired in each app's `project.json` so `<img src="/logos/reddoc.svg">` resolves.

### libs/core — auth infrastructure + data-list cross-app

The auth pattern is an abstract generic service extended per-app:

```
BaseAuthService<TUser extends BaseUsuario>   (libs/core)
  └── AuthService extends BaseAuthService<Usuario>  (apps/<app>)
```

`BaseAuthService` handles login, me, refresh, logout, forgotPassword, resetPassword, verifyEmail, resendVerification, register using **HTTP-only cookies** — no tokens in localStorage.

**Injection tokens** that must be provided in each app's `app.config.ts`:

| Token               | Purpose                                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `ENVIRONMENT`       | `{ apiUrl, turnstileSiteKey, cuentaUrl? }`                                                                           |
| `ROUTE_PATHS_TOKEN` | `{ auth: { login, register, forgotPassword, resetPassword, resendVerification, verifyEmail }, dashboard: { root } }` |
| `AUTH_SERVICE`      | `useExisting: AuthService` — exposes `AuthServiceContract` to interceptors, guards, and shared auth pages            |
| `AUTH_SKIP_URLS`    | String array of API paths that bypass the 401-refresh logic                                                          |
| `APP_BRANDING`      | `{ appName, tagline? }` — consumed by the shared auth pages in `@reddoc/ui` to render per-app brand panel            |

**Guards** (`authGuard`, `publicGuard`) inject `AUTH_SERVICE` and `ROUTE_PATHS_TOKEN`.

**errorInterceptor** — on 401, attempts one token refresh via `AUTH_SERVICE.refresh()`. Uses `TokenRefreshService` (signal + Subject) to queue concurrent requests while refresh is in-flight. Skips refresh for URLs listed in `AUTH_SKIP_URLS`.

**`data-list/` cross-app building blocks** (`libs/core/src/lib/data-list/`):

- Tipos: `ColumnDef`, `FilterField`, `ListQuery`, `ListResponse`, `FilterCondition`, `SortSpec`.
- `serializeListQuery(query)` — convención Django REST de query-params (filtros `field__operator=value`, ordering, paginación).
- `FilterStorageService` — persistencia agnóstica de filtros en localStorage por `storageKey: string`.

Cualquier app del monorepo puede usarlos para construir listas paginadas.

### libs/ui — shared standalone components

- `TurnstileComponent` (`lib-turnstile`) — Cloudflare Turnstile widget. Reads `turnstileSiteKey` from `ENVIRONMENT`. Dev key `1x00000000000000000000AA` always passes.
- Auth pages (`LoginComponent`, `RegisterComponent`, `ForgotPasswordComponent`, `ResetPasswordComponent`, `ResendVerificationComponent`, `VerifyEmailComponent`) — fully implemented; each app routes to them via eager `component:` (Nx prohibits mixing lazy + static imports of the same lib).
- Assets: `src/assets/logos/reddoc.svg` and `reddoc-on-dark.svg` — copied into each app's build via `project.json` assets glob.

### libs/feature-base — building blocks de listados

- `DataTableComponent` (`lib-data-table`) — tabla "tonta": recibe `columns`, `items`, `rowActions` por input y emite eventos. Sin HTTP, sin config. Reusable por cualquier app.
- Tipos `RowAction`, `RowActionInvokedEvent`, `PageChangeEvent`.

### apps/erp — module architecture

El ERP usa un **enfoque híbrido** (documentado en `docs/architecture/erp-module-architecture.md`):

| Camino                                   | A quién aplica                                                                                                       | Cómo se implementa                                                                                                                                                                       |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework configuracional (camino A)** | Documentos transaccionales (factura, nota crédito, etc.) sobre `/api/documento` discriminado por `documento_tipo_id` | `DocumentEntityConfig` declarativo + `MODULE_REGISTRY` lazy + resolvers + `BaseDocumentListComponent`. Todo vive en **`apps/erp/src/app/core/module-config/`** porque es ERP-específico. |
| **Features directos (camino B)**         | Masters administrativos (contacto, ítem, sede, almacén, etc.) con endpoint propio                                    | Cada master: `services/*.service.ts` (extends `BaseHttpService`) + `pages/*-list/*-list.component.ts` que compone `<lib-data-table>` con inputs concretos                                |
| **Building blocks compartidos**          | Ambos caminos + otras apps potencialmente                                                                            | `<lib-data-table>` (`@reddoc/feature-base`), tipos `ColumnDef`/`FilterField`/`ListQuery`, `serializeListQuery`, `FilterStorageService` (todos en `@reddoc/core` data-list)               |

**Estructura del framework configuracional en el ERP**:

```
apps/erp/src/app/core/module-config/
├── types/                       DocumentEntityConfig, ModuleConfig, capabilities
├── module-registry.token.ts     InjectionToken + ModuleConfigLoader / ModuleRegistry
├── module-registry.constant.ts  ERP_MODULE_REGISTRY (módulos transaccionales)
├── module-registry.service.ts   Carga lazy + cache + validación
├── module-navigation.store.ts   Signals del módulo/documento activos
├── resolvers/                   activeModuleResolver, activeDocumentResolver
├── data/                        EntityDataGateway (interface) + HttpEntityDataGateway
├── storage/                     buildEntityStorageKey (usa EntityConfig)
├── errors/                      Errores tipados del dominio
├── components/
│   └── base-document-list/      BaseDocumentListComponent (lazy load — NO exportar desde el barrel)
└── index.ts                     Barrel sin BaseDocumentListComponent: evita jalar PrimeNG al initial bundle
```

El `BaseDocumentListComponent` se importa **siempre vía `loadComponent`** desde las rutas de documentos, no por barrel.

**Sidebar híbrido**: declarado en `apps/erp/src/app/layouts/sidebar/sidebar-menu.ts`. Items simples + acordeones de módulo. Cuando un módulo del `ERP_MODULE_REGISTRY` tenga documentos, sus entradas se mezclarán dinámicamente con las declarativas.

**Para agregar un master nuevo** (camino B):

1. `apps/erp/src/app/features/<modulo>/services/<x>.service.ts` extends `BaseHttpService`.
2. `apps/erp/src/app/features/<modulo>/pages/<x>-list/<x>-list.component.ts` que componga `<lib-data-table>`.
3. Ruta en `<modulo>.routes.ts`.
4. Entrada en `sidebar-menu.ts`.

**Para agregar un documento nuevo** (camino A):

1. Crear `<modulo>.config.ts` que exporte `ModuleConfig` con sus `documents`.
2. Registrar en `ERP_MODULE_REGISTRY` (1 línea).
3. Lazy route en `app.routes.ts` que cargue `BaseDocumentListComponent` vía `loadComponent`.
4. El sidebar lo mostrará automáticamente.

**No usar el framework para**: `contenedores`, `dashboard`, settings de usuario, wizards. Esas son features tradicionales sin tabla genérica.

## Key conventions

- **Standalone components** throughout — no NgModules.
- **Signals** for local state (`signal()`, `computed()`); no `BehaviorSubject` in new code.
- **Lazy loading** — feature routes use `loadComponent` / `loadChildren`. Exception: pages from `@reddoc/ui` are eager-loaded (Nx module-boundaries rule).
- **`provideAppInitializer`** in each SPA's `app.config.ts` calls `auth.me()` on startup to rehydrate session from cookie.
- **Commits** follow Conventional Commits (`feat:`, `fix:`, `chore:`, etc.) — enforced by commitlint on PRs. Body lines max 100 chars.
- **SCSS** — component styles are scoped; global Tailwind brand tokens live in `libs/styles/src/tailwind/brand.css`. Avoid inline styles.
- **Typed errors** — never `throw new Error('msg')` generic. Define a specific class extending `Error`.
- **No `any`** — use `unknown` + narrowing where the type is genuinely unknown.
- **Readonly by default** — prefer `readonly` properties and `readonly` arrays in configs and contracts.

## Tener en cuenta

- Para los textos no crees por ejemplo "Nueva Empresa" esta mal para nosotros, debe ser "Nueva empresa" no uses mayusculas al inicio de las palabras despues de la primera palabra
- siempre procura usar clases de tailwind

## Documentación de arquitectura

- `docs/architecture/erp-module-architecture.md` — decisión arquitectónica completa del framework de módulos del ERP (enfoque híbrido v2.0). Leerlo antes de agregar masters o documentos al ERP.
