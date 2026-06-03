# Guía: agregar un módulo nuevo al ERP

> **Para quién**: cualquier dev que necesite sumar un módulo de negocio
> (Tesorería, Nómina, etc.) al ERP sin perderse.
> **Tiempo**: ~15 min para el esqueleto navegable; el contenido (masters/documentos)
> se agrega después.
> **Antes de empezar**: esta guía es el _recetario_. El _por qué_ de la arquitectura
> está en [`../architecture/erp-module-architecture.md`](../architecture/erp-module-architecture.md).
> Léelo si vas a tomar decisiones de diseño; para solo agregar un módulo, basta esta guía.

---

## Qué es un "módulo" aquí

El ERP se organiza en **módulos** (General, Compra, Venta, Inventario…). El módulo
activo es el **primer segmento de la URL tras el tenant**: `/t/:slug/<modulo>/...`.

Cada módulo aporta un **`ErpModuleDescriptor`** que declara su id, nombre, icono, a
dónde redirige y qué muestra el sidebar cuando está activo. El topbar pinta un link por
módulo habilitado; el sidebar se filtra al módulo activo.

Un módulo puede arrancar **vacío (placeholder)** y luego llenarse con:

- **Masters** (camino B) → contacto, ítem… cada uno con su endpoint REST. Ver
  [Agregar un master](#paso-b-agregar-un-master-camino-b).
- **Documentos** (camino A) → factura, contrato… sobre `/api/general/documento`
  discriminados por `documento_tipo_id`. Ver
  [Agregar un documento](#paso-c-agregar-un-documento-camino-a).

---

## Mapa de archivos que vas a tocar

```
apps/erp/src/app/
├── i18n/
│   ├── app.dict.ts        ← (1) tipo del diccionario  ─┐ los 3 SIEMPRE
│   ├── app.es.ts          ← (1) textos español         ├ en sincronía
│   └── app.en.ts          ← (1) textos inglés         ─┘
├── features/<id>/
│   ├── <id>.module-descriptor.ts   ← (2) descriptor del módulo
│   └── <id>.routes.ts              ← (3) rutas + resolver
├── core/erp-modules/
│   └── erp-modules.registry.ts     ← (4) registrar en ERP_MODULES
└── app.routes.ts                   ← (5) loadChildren bajo /t/:tenantSlug
```

`permissions.service.ts` **no se toca**: el stub habilita todos los módulos
registrados. Cuando el backend exponga flags `plan_*`, solo cambia su `computed`.

---

## Esqueleto navegable (módulo vacío) — 5 pasos

Ejemplo: agregar el módulo **Tesorería** (`id: 'tesoreria'`). Copia el patrón de
`inventario`, que hoy es un placeholder real.

### 1. i18n — el nombre del módulo (3 archivos en sincronía)

El diccionario es **estrictamente tipado**: si agregás una clave en `app.dict.ts` y no
la ponés en `app.es.ts` **y** `app.en.ts`, el build falla. Hacelo en los tres a la vez.

```ts
// app.dict.ts  → dentro de `modules:`
modules: {
  general: {
    name: string;
  }
  // …
  tesoreria: {
    name: string;
  } // ← nuevo
}
```

```ts
// app.es.ts  → dentro de `modules:`
tesoreria: { name: 'Tesorería' },
```

```ts
// app.en.ts  → dentro de `modules:`
tesoreria: { name: 'Treasury' },
```

> Recordá la convención de textos: solo la **primera palabra** va en mayúscula
> ("Nueva empresa", no "Nueva Empresa").

### 2. Descriptor del módulo

`apps/erp/src/app/features/tesoreria/tesoreria.module-descriptor.ts`:

```ts
import type { ErpModuleDescriptor } from '@erp/core/erp-modules';

export const TESORERIA_MODULE: ErpModuleDescriptor = {
  id: 'tesoreria',
  displayNameKey: 'modules.tesoreria.name',
  iconClass: 'pi pi-wallet', // cualquier PrimeIcon
  defaultChildPath: null, // null ⇒ placeholder; o 'cuentas-banco' cuando tenga contenido
  menu: [], // vacío por ahora; se llena al agregar masters/documentos
};
```

### 3. Rutas del módulo

`apps/erp/src/app/features/tesoreria/tesoreria.routes.ts`:

```ts
import type { Route } from '@angular/router';
import { erpModuleResolver } from '@erp/core/erp-modules';

export const TESORERIA_ROUTES: Route[] = [
  {
    path: '',
    resolve: { _module: erpModuleResolver('tesoreria') }, // marca el módulo activo
    loadComponent: () =>
      import('@erp/layouts/module-placeholder/module-placeholder.component').then(
        (m) => m.ModulePlaceholderComponent,
      ),
  },
];
```

> El `erpModuleResolver('<id>')` es lo que sincroniza topbar + sidebar. **Siempre** va
> en la ruta raíz del módulo. (Cuando el módulo tenga documentos, además se encadena
> `activeModuleResolver('<id>')` — ver paso C.)

### 4. Registrar en el registry

`apps/erp/src/app/core/erp-modules/erp-modules.registry.ts` — el orden en el array es
el orden en el topbar:

```ts
import { TESORERIA_MODULE } from '@erp/features/tesoreria/tesoreria.module-descriptor';

export const ERP_MODULES: readonly ErpModuleDescriptor[] = [
  GENERAL_MODULE,
  COMPRA_MODULE,
  VENTA_MODULE,
  INVENTARIO_MODULE,
  TESORERIA_MODULE, // ← nuevo
] as const;
```

### 5. `loadChildren` bajo el tenant

`apps/erp/src/app/app.routes.ts` — dentro de los `children` de `path: 't/:tenantSlug'`:

```ts
{
  path: 'tesoreria',
  loadChildren: () =>
    import('./features/tesoreria/tesoreria.routes').then((m) => m.TESORERIA_ROUTES),
},
```

**Listo.** `npx nx serve erp` → entrá a un tenant → el módulo aparece en el topbar y
abre su placeholder. Ya podés llenarlo.

---

## Paso B: agregar un master (camino B)

Para entidades con **endpoint REST propio** (contacto, ítem, cuenta banco…). Ejemplo
canónico vivo: `features/general/masters/contacto/`.

1. Crear el bounded context bajo `features/tesoreria/masters/<entity>/`:
   - `<entity>.model.ts`, `<entity>.service.ts` (extends `BaseHttpService`),
     `<entity>.constants.ts` (columnas, filtros, acciones), `<entity>.routes.ts`,
     `pages/<plural>-list/…` componiendo `<lib-data-table>` + `<lib-data-toolbar>`.
2. En `tesoreria.routes.ts`, delegar el master:
   ```ts
   {
     path: 'cuentas-banco',
     loadChildren: () =>
       import('./masters/cuenta-banco/cuenta-banco.routes').then((m) => m.CUENTA_BANCO_ROUTES),
   }
   ```
   URL final: `/t/:slug/tesoreria/cuentas-banco`.
3. Sumar la entrada al `menu` del descriptor (ver [menú del sidebar](#el-menú-del-sidebar)).
4. Claves i18n `entities.<entity>.*` en los 3 archivos i18n.

> ⚠️ **Servicio global vs tenant-scoped**: si el endpoint del master vive en el schema
> público (catálogos globales, `/seguridad/…`), declarar
> `protected override readonly tenantScoped = false;` **en el servicio**. Si no, el
> backend resuelve contra el tenant y devuelve **404**. Lo normal (tenant-scoped) no
> requiere nada. Ver `CLAUDE.md` → "Tenant scoping".

---

## Paso C: agregar un documento (camino A)

> 📄 **Guía dedicada**: [`agregar-documento-erp.md`](./agregar-documento-erp.md) tiene el
> recetario completo con snippets. Lo de aquí es el resumen.

Para documentos transaccionales sobre `/api/general/documento` discriminados por
`documento_tipo_id`. Ejemplos vivos: `features/venta/documentos/factura-venta/`
(completo) y `contrato-servicio/` (solo lista).

1. Asegurate de que el `documento_tipo_id` esté en
   `core/module-config/constants/document-types.constants.ts` (`DOCUMENT_TYPE_ID`).
2. Crear `features/tesoreria/tesoreria.config.ts` que exporte un `ModuleConfig` con sus
   `documents: DocumentEntityConfig[]` (columnas, filtros, capabilities, rutas).
   Registrarlo en `ERP_MODULE_REGISTRY` (`core/module-config/module-registry.constant.ts`).
3. Encadenar **ambos** resolvers en la raíz de `tesoreria.routes.ts`:
   ```ts
   resolve: {
     _navModule: erpModuleResolver('tesoreria'),
     _docModule: activeModuleResolver('tesoreria'),
   },
   ```
   y un `loadChildren` por documento que cargue su `<doc>.routes.ts`. Ese routes resuelve
   `activeDocumentResolver('<doc>')` y carga `BaseDocumentListComponent` vía
   `loadComponent` (nunca por barrel — evita jalar PrimeNG al bundle inicial).
4. Sumar la entrada al `menu` del descriptor.

El `BaseDocumentListComponent` ya deriva toolbar, filtros, breadcrumb y card del
`DocumentEntityConfig` — un documento solo-lista (capabilities en `false`, `filters: []`)
muestra solo card + tabla.

---

## El menú del sidebar

El `menu` del descriptor es un `SidebarSection[]`. Dos formas de entrada:

```ts
menu: [
  // a) Item simple (link directo)
  { kind: 'item', labelKey: 'entities.x.name', iconClass: 'pi pi-th-large', path: 'x' },

  // b) Acordeón que agrupa varios items
  {
    kind: 'accordion',
    id: 'tesoreria-cuentas',          // id único; solo rastrea expand/collapse en memoria
    labelKey: 'layout.nav.sections.master',
    iconClass: 'pi pi-folder',
    defaultExpanded: true,            // ← arranca ABIERTO. Sin este flag, arranca cerrado
    groups: [
      { items: [{ labelKey: 'entities.cuentaBanco.name', path: 'cuentas-banco' }] },
    ],
  },
],
```

- Los `path` son **relativos al módulo**: el layout les prepende `/t/<slug>/<id>/`.
- **`defaultExpanded`**: por defecto los acordeones arrancan **cerrados**. Marcá
  `defaultExpanded: true` los que quieras abiertos al entrar al módulo (convención:
  el que contiene el `defaultChildPath`). El usuario puede abrir/cerrar a mano después.
- Los `labelKey` de `layout.nav.sections.*` (master / document / movement / utility) ya
  existen; si necesitás otro sub-header, agregalo en los 3 archivos i18n.

---

## Checklist final

- [ ] `modules.<id>.name` en `app.dict.ts` + `app.es.ts` + `app.en.ts` (los tres).
- [ ] `features/<id>/<id>.module-descriptor.ts` con el `ErpModuleDescriptor`.
- [ ] `features/<id>/<id>.routes.ts` con `erpModuleResolver('<id>')` (y
      `activeModuleResolver` si hay documentos).
- [ ] Registrado en `ERP_MODULES` (`erp-modules.registry.ts`).
- [ ] `loadChildren` en `app.routes.ts` bajo `t/:tenantSlug`.
- [ ] (Si aplica) masters/documentos enganchados + sus claves i18n `entities.<entity>.*`.
- [ ] `npx nx lint erp` y `npx nx build erp` en verde.
- [ ] `npx nx serve erp` (4201) → el módulo aparece en el topbar, abre su destino y el
      sidebar muestra su menú con los acordeones en el estado esperado.

---

## Referencias

- Arquitectura completa (el _por qué_): [`../architecture/erp-module-architecture.md`](../architecture/erp-module-architecture.md)
- Resumen de convenciones y comandos: `CLAUDE.md` (raíz del repo)
- Ejemplos vivos:
  - Módulo placeholder: `features/inventario/`
  - Módulo con masters: `features/general/`
  - Módulo con documentos (camino A): `features/venta/`
