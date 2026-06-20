# Interface Design System — reddoc ERP

Sistema de diseño del ERP (apps/erp). Las decisiones aquí son la fuente de verdad:
respétalas al agregar UI; si algo se desvía, es un bug de consistencia.

## Dirección y feel

- **Intent:** herramienta administrativa multi-tenant para operadores. Densa pero calmada;
  estructura por jerarquía sutil, no por color. "Sé invisible": el sistema se siente, no se ve.
- **Convención de capitalización (CLAUDE.md):** sentence case en español. Solo la primera palabra
  con mayúscula — "Nueva empresa", no "Nueva Empresa".
- **Tailwind primero** para utilidades; tokens de marca compartidos en `libs/styles`.

## Depth

- **Borders-only.** Sin sombras en estructura (header, sidebar, nav). La definición viene de
  bordes de baja opacidad, no de elevación.

## Tokens y paleta

Variables de marca (de `libs/styles`, usadas con `var(--...)`):

- `--brand-navy` (`#143049`) — primario / identidad. Fondo de monogramas, texto activo.
- `--brand-blue` — acento (íconos activos).
- `--brand-text` — texto primario.
- `--brand-muted` / `--brand-muted-2` — texto secundario / íconos inactivos.
- `--brand-bg` — canvas.

**Bordes y separadores** — siempre rgba navy de baja opacidad, nunca hex sólido:

- `rgba(19 38 60 / 0.08)` — borde estándar (header bottom, sidebar right).
- `rgba(19 38 60 / 0.12)` — divisor con un poco más de presencia (ej. divisor del header).
- `rgba(19 38 60 / 0.04)` — hover de items de nav.
- `rgba(19 38 60 / 0.08)` — fondo de item activo.

## Spacing / radius

- Base efectiva en rem; gaps comunes `0.5rem` (brand), `0.7rem`–`0.75rem` (items de nav).
- Radius: `6px` elementos pequeños (monograma, hamburguesa, leaf), `8px` items/headers de nav.

## Layout: header del workspace (56px)

`workspace-layout.component` — `.app-header` sticky, `height: 56px`, fondo
`rgba(255 255 255 / 0.85)` + `backdrop-filter: blur(12px)`, borde inferior `rgba(19 38 60 / 0.08)`.
Estructura `space-between`:

```
[brand: hamburguesa(móvil) · logo · divisor · tenant-badge]   [module-bar centrado]   [user-menu]
```

- **Divisor del header** (`.app-header__divider`): `width:1px; height:20px;`
  `background: rgba(19 38 60 / 0.12)`. Se oculta vía `&__brand:not(:has(.tenant-badge)) &__divider`
  para no quedar colgando cuando no hay badge.

## Patrón: tenant-badge (identidad de contenedor)

`layouts/tenant-badge/` — ancla de "¿en qué empresa estoy?" arriba-izquierda. Etiqueta estática
(no switcher; cambiar empresa vive en el user-menu).

- **Composición:** monograma (inicial, `--brand-navy` con texto blanco, `24×24`, radius `6px`,
  `font-size 0.72rem / 600`) + nombre (`--brand-text`, `0.85rem / 600`).
- **Nombres largos:** monograma fijo + nombre con `max-width: 190px` (desktop) / `120px` (móvil),
  `overflow:hidden; text-overflow:ellipsis; white-space:nowrap`. Nombre completo en `title` + `aria-label`.
  `min-width:0` en el contenedor flex para permitir encoger sin desbordar la barra de módulos.
- **Dato:** `TenantService.currentContenedor()?.nombre`, repoblado por `tenantAccessGuard` antes de
  pintar (sobrevive reload duro). Fallback al `currentSlug()`.
- **Regla general:** para identidad/monogramas usar la inicial + color de marca; aunque el texto
  trunque, el monograma mantiene la identidad.

## Patrón: nav del sidebar

`workspace-layout` — sidebar `240px`, `background:#fff`, borde derecho `rgba(19 38 60 / 0.08)`,
oculto `<768px` (se reemplaza por `<p-drawer>`). Items: `0.85rem`, radius `8px`, hover
`rgba(19 38 60 / 0.04)`, activo `rgba(19 38 60 / 0.08)` + texto `--brand-navy` + ícono `--brand-blue`.
Acordeones con chevron `pi` alineado a la derecha (`margin-left:auto`).

## i18n

Claves bajo `layout.*` en `app.dict.ts` (tipo) + `app.es.ts` + `app.en.ts`. Resolución por
notación de punto vía `I18nService<AppDict>.t()`. Siempre las tres a la vez.
