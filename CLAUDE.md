# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All tasks run through Nx. Use `npx nx <target> <project>`.

```bash
# Serve
npx nx serve landing          # Landing SSR dev server → http://localhost:4200
npx nx serve erp              # ERP SPA dev server   → http://localhost:4201
npx nx serve cuenta           # Cuenta SPA dev server → http://localhost:4203

# Build
npx nx build landing          # Static + SSR build
npx nx build erp              # SPA build

# Lint & format
npx nx lint landing
npx nx lint erp
npx nx run-many -t lint       # All projects


# Affected (CI-style, based on git diff vs main)
npx nx affected -t build
npx nx affected -t lint

# Release
npm run release               # commit-and-tag-version bump + changelog
```

**Installing packages:** always pass `--legacy-peer-deps` due to a pre-existing peer conflict between `angular-eslint@21` and `@angular/cli@20`.

## Architecture

```
apps/
  landing/   Angular 20 SSR/SSG, Tailwind CSS, port 4200 — public marketing site
  erp/       Angular 20 SPA, PrimeNG 20, port 4201 — ERP application
libs/
  core/      Auth infrastructure shared across apps (see below)
  ui/        Shared Angular components
  styles/    Shared SCSS design tokens (variables, base, utilities)
```

Path aliases: `@reddoc/core`, `@reddoc/ui`, `@reddoc/styles`.

### landing

- **SSG** — `outputMode: static` with pre-rendered routes from `routes.txt`. Has a real Express `server.ts`.
- **i18n** — content lives in translation files under `src/app/i18n/`; components consume it via a translation pipe/service.
- **Tailwind** — imported via `src/tailwind.css`. Shared SCSS tokens are **not** used here; use Tailwind utilities instead.
- No PrimeNG. No auth.

### erp

- **SPA** — no SSR, no hydration provider.
- **Proxy** — `/api/*` → `http://localhost:8000` in development via `proxy.conf.json`. All HTTP calls use the relative `/api` prefix injected through the `ENVIRONMENT` token.
- **PrimeNG theme** — `ReddocPreset` defined in `app.config.ts`, extending Aura with a navy (`#143049`) primary and sky (`#77aad7`) accent palette.
- **Environments** — `src/environments/environment.ts` (dev), `.staging.ts`, `.prod.ts`. Swap via `fileReplacements` in `project.json`.

### libs/core — auth infrastructure

The pattern is an abstract generic service extended per-app:

```
BaseAuthService<TUser extends BaseUsuario>   (libs/core)
  └── AuthService extends BaseAuthService<Usuario>  (apps/erp)
```

`BaseAuthService` handles login, me, refresh, logout, forgotPassword, resetPassword, verifyEmail, resendVerification using **HTTP-only cookies** — no tokens in localStorage.

**Injection tokens** that must be provided in each app's `app.config.ts`:

| Token               | Purpose                                                                  |
| ------------------- | ------------------------------------------------------------------------ |
| `ENVIRONMENT`       | `{ apiUrl, turnstileSiteKey }`                                           |
| `ROUTE_PATHS_TOKEN` | `{ auth: { login }, dashboard: { root } }`                               |
| `AUTH_SERVICE`      | `useExisting: AuthService` — exposes the contract to interceptors/guards |
| `AUTH_SKIP_URLS`    | String array of API paths that bypass the 401-refresh logic              |

**Guards** (`authGuard`, `publicGuard`) inject `AUTH_SERVICE` and `ROUTE_PATHS_TOKEN` — both tokens must be provided for guards to work.

**errorInterceptor** — on 401, attempts one token refresh via `AUTH_SERVICE.refresh()`. Uses `TokenRefreshService` to queue concurrent requests while refresh is in-flight. Skips refresh for URLs listed in `AUTH_SKIP_URLS`.

**Cloudflare Turnstile** — `TurnstileComponent` at `apps/erp/src/app/shared/turnstile/`. Reads `turnstileSiteKey` from `ENVIRONMENT`. Dev key `1x00000000000000000000AA` always passes. Pages that use it hold a `captchaToken` signal and pass it to the service call.

## Key conventions

- **Standalone components** throughout — no NgModules.
- **Signals** for local state (`signal()`, `computed()`); no BehaviorSubjects in new code.
- **Lazy loading** — all feature routes use `loadComponent` / `loadChildren`.
- **`provideAppInitializer`** in erp's `app.config.ts` calls `auth.me()` on startup to rehydrate session from cookie.
- **Commits** follow Conventional Commits (`feat:`, `fix:`, `chore:`, etc.) — enforced by commitlint on PRs.
- **SCSS** — component styles are scoped; global tokens live in `libs/styles`. Avoid inline styles.
