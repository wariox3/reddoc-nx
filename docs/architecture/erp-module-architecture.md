# Arquitectura modular del ERP

> **Estado**: Decisión aprobada · migración en curso
> **Fecha**: 2026-05-12
> **Autores**: Sebastian
> **Aplica a**: `apps/erp` del monorepo `reddoc-monorepo`
> **Versión del documento**: 2.0 (enfoque híbrido tras reflexión post-implementación)

---

## Tabla de contenidos

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Contexto](#2-contexto)
3. [Análisis del sistema legacy](#3-análisis-del-sistema-legacy)
4. [Reflexión post-implementación (v1.1 → v2.0)](#4-reflexión-post-implementación-v11--v20)
5. [Principios rectores](#5-principios-rectores)
6. [Arquitectura propuesta](#6-arquitectura-propuesta)
7. [Convenciones de naming](#7-convenciones-de-naming)
8. [Estructura por módulo](#8-estructura-por-módulo)
9. [Manejo de errores y casos límite](#9-manejo-de-errores-y-casos-límite)
10. [Estrategia de testing](#10-estrategia-de-testing)
11. [Trade-offs aceptados](#11-trade-offs-aceptados)
12. [Plan de migración](#12-plan-de-migración)
13. [Decisiones tomadas](#13-decisiones-tomadas)
14. [Referencias](#14-referencias)

---

## 1. Resumen ejecutivo

El ERP albergará **8+ módulos de negocio** con dos clases de entidades cuyo nivel de reuso real es muy distinto:

- **Documentos transaccionales** (factura, nota crédito, nota débito, factura POS, factura recurrente, etc.): comparten el endpoint genérico `/api/documento` discriminado por `documento_tipo_id`. El reuso es **estructural** — mismo schema, mismo flujo, misma forma de filtros.
- **Masters administrativos** (contacto, ítem, sede, almacén, cuenta banco, asesor, resolución, etc.): cada uno tiene su **propio endpoint REST**, su propio shape de datos y, frecuentemente, su propio UX. El reuso es solo de **building blocks de UI** (tabla, filtros, toolbar).

Adoptamos un **enfoque híbrido**:

| Camino                          | A quién aplica             | Cómo se implementa                                                                                                               |
| ------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Framework configuracional**   | Documentos transaccionales | `EntityConfig` declarativo + `MODULE_REGISTRY` lazy + resolvers + `BaseDocumentList` que orquesta. Aprovecha el endpoint único.  |
| **Features directos**           | Masters administrativos    | Cada master tiene su `*-list.component.ts`, su `*Service` y su propio routing. Compone building blocks compartidos por inputs.   |
| **Building blocks compartidos** | Ambos caminos              | `<lib-data-table>`, `<lib-filter-panel>`, `<lib-toolbar-actions>`, tipos `ColumnDef`/`FilterField`, gateway HTTP, filter storage |

Este enfoque emerge de la **reflexión post-implementación** documentada en la sección 4: aplicar un framework configuracional uniforme a entidades cuyo backend es heterogéneo introduce indirección sin beneficio. El framework sigue valiendo donde el reuso es genuino (documentos) y desaparece donde no lo era (masters).

---

## 2. Contexto

### 2.1 Estado actual del nuevo ERP

`apps/erp` corre sobre **Angular 20 standalone + PrimeNG 20 + Tailwind v4** dentro de un monorepo Nx. Features no-CRUD ya existentes (`contenedores`, `dashboard`) quedan fuera del framework.

```
apps/erp/src/app/
├── core/                  · constants, guards, module-config registry concreto
├── features/
│   ├── auth/              · login, register, etc. (vive en libs/ui)
│   ├── contenedores/      · selección de tenant
│   ├── dashboard/         · placeholder
│   └── general/           · (en migración a feature directo, ver §12)
├── layouts/               · ShellLayout + WorkspaceLayout
└── shared/                · user-menu, etc.
```

Rutas: `/` redirige según auth, `/contenedores` selecciona tenant, `/t/:tenantSlug/...` entra al workspace del tenant.

### 2.2 El legacy: `app.reddoc`

Sistema Angular 17 en `/home/tamerlan/Desktop/semantica/app.reddoc/` con 8 módulos de negocio y ~3,120 líneas de configuración declarativa. Resolvió el problema "muchas entidades sobre el mismo backend" con un patrón configuration-driven que aplicaba **tanto a documentos como a masters** (vía `base-documento/base-lista` y `base-administracion/base-lista`, que en la práctica compartían 70% del código).

---

## 3. Análisis del sistema legacy

### 3.1 Flujo de datos

```
URL: /compra/documento/lista?modelo=300
   │
   ▼
ConfigModuleService escucha NavigationEnd del router
   │
   ▼
Extrae del URL:  modulo='compra'  funcionalidad='documento'  modelo='300'
   │
   ▼
switch(modulo) → carga COMPRA_CONFIGURACION (constante importada estáticamente)
   │
   ▼
Busca: funcionalidad='documento' → modelo=300 → entidad FACTURACOMPRA
   │
   ▼
Emite vía currentModelConfig$ (BehaviorSubject<ModeloConfig | null>)
   │
   ▼
BaseListaComponent (suscrito vía takeUntil) extrae:
   · endpoint, queryParams, ui flags, rutas, filters
   │
   ▼
HTTP GET + render
```

### 3.2 Aciertos que preservamos (siguen vigentes en v2.0)

| Acierto                                | Por qué importa                                                    |
| -------------------------------------- | ------------------------------------------------------------------ |
| Una constante por módulo describe todo | Aplica a **documentos**: endpoint genérico justifica un descriptor |
| Componentes base reutilizables         | Aplica a **documentos**: 14+ tipos sobre el mismo endpoint         |
| UI flags por entidad                   | Aplica a **documentos**: activar "Generar", "Importar ZIP", etc.   |
| Filtros declarativos compartidos       | Building block común: `FilterField[]` se reusa entre features      |

### 3.3 Antipatrones corregidos (no repetiremos)

| Antipatrón legacy                                                                  | Cómo lo corregimos                                                                |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `switch(modulo)` en el service global                                              | Registry con lazy imports (`Record<ModuleId, ModuleLoader>`)                      |
| `queryParams: { [key: string]: any }`                                              | Tipos estrictos por entidad                                                       |
| `if (this._modelo === 'GenDocumento')` hardcoded en componente base                | Gateway absorbe la lógica; el componente no conoce backend                        |
| `ViewContainerRef.createComponent()` para acciones extras                          | Strategy pattern con `multi: true` providers                                      |
| **`base-documento/base-lista` + `base-administracion/base-lista` — 70% duplicado** | **Diagnóstico real: no eran la misma cosa**. Resolvemos separando, no unificando. |
| `BehaviorSubject`                                                                  | `signal` + `computed` con lectura síncrona                                        |
| Listener global de `NavigationEnd`                                                 | Resolvers por ruta + `withComponentInputBinding()`                                |
| Imports estáticos de las 8 configs                                                 | Lazy `import()` dentro del registry                                               |
| `localStorage` sin versión                                                         | Clave con `schemaVersion`                                                         |
| HTTP directo desde el componente base                                              | `EntityDataGateway` abstracto inyectado (DIP)                                     |
| Service que mezcla carga + estado + navegación                                     | Dos servicios separados: registry vs navigation store                             |

---

## 4. Reflexión post-implementación (v1.1 → v2.0)

Esta sección documenta **por qué** el documento cambió. Sirve como registro histórico para que un dev futuro entienda las razones de la simplificación.

### 4.1 Lo que se construyó en v1.1

Tras aprobar el documento v1.1 se implementó la foundation completa en tres commits:

- **Fase 1**: tipos discriminados (`document | master | utility`), `MODULE_REGISTRY` con `InjectionToken`, `ModuleRegistryService`, `ModuleNavigationStore`, 7 errores tipados, sidebar dinámico (acordeón derivado del registry).
- **Fase 2**: `activeModuleResolver`, `activeEntityResolver`, `EntityDataGateway` (interface + impl HTTP default), `withComponentInputBinding()` en `provideRouter`.
- **Fase 4**: nueva lib `libs/feature-base/`, `BaseListComponent` con tabla PrimeNG, paginación, confirmaciones, restauración de filtros desde storage versionado.

Total: ~2,000 LoC de scaffolding antes del primer CRUD funcional. El módulo `general` con la entidad `contacto` (`kind: 'master'`) servía como smoke test.

### 4.2 Lo que se observó al usarlo

Durante la implementación emergieron tres síntomas claros:

1. **Indirección desproporcionada para masters**: para ver dónde se renderiza la lista de contactos hay que leer **5 archivos** (`general.config.ts` → `MODULE_REGISTRY` → `activeModuleResolver` → `activeEntityResolver` → `BaseListComponent`) cuando una lista directa son **2 archivos** (`contactos-list.component.ts` + `contactos-list.component.html`).

2. **El backend no estaba unificado**: cada master tiene su propio endpoint (`/api/general/contacto`, `/api/general/item`, `/api/inventario/almacen`, etc.). La abstracción del framework asume un patrón de acceso uniforme que solo se cumple para documentos.

3. **Las "diferencias entre kinds" eran datos, pero las diferencias UX no**: un contacto tiene flags cliente/proveedor/empleado; un ítem tiene precio + impuestos + categoría; un almacén tiene direcciones + bodegas. Cada uno termina necesitando un componente extra (`<entity-extra-fields>`) o un `kind: 'utility'` que es básicamente un escape hatch. El framework sirve mejor cuando las entidades son **realmente similares**, y los masters no lo son.

### 4.3 Lo que validó la sospecha del legacy

El legacy ya tenía **dos componentes** distintos para documentos y administración (`base-documento/base-lista` 491 LoC vs `base-administracion/base-lista` 266 LoC) con 70% de duplicación. En v1.1 lo "corregimos" unificando los dos en un solo componente que ramifica por `kind`. La reflexión es que **el legacy tenía razón en separarlos** — la duplicación señalaba que eran cosas distintas, no que necesitaban una abstracción común. El error del legacy fue duplicar código, no haber separado los componentes.

### 4.4 Pivote: enfoque híbrido

Conservamos el framework configuracional donde el reuso es **estructural y real** (documentos sobre endpoint genérico) y lo retiramos donde solo era **superficial** (masters con endpoints heterogéneos). Los building blocks de UI (tabla, filtros, toolbar) son reusables por inputs concretos, sin necesidad de configuración global.

### 4.5 Qué se conserva del trabajo de v1.1

| Pieza                                                                                  | Estado en v2.0                                                                                                 |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `ColumnDef`, `FilterField`, `ListQuery`, `ListResponse`, `FilterCondition`, `SortSpec` | **Se queda** como building blocks de tipos                                                                     |
| `EntityDataGateway` / `HttpEntityDataGateway`                                          | **Se queda** (renombre a evaluar): el DIP sigue valiendo                                                       |
| `EntityFilterStorageService`                                                           | **Se refactoriza** para aceptar `storageKey: string` directo (no acoplado a `EntityConfig`)                    |
| `MODULE_REGISTRY` + `ModuleRegistryService` + `ModuleNavigationStore` + resolvers      | **Se queda** pero **aplica solo a documentos**                                                                 |
| `BaseListComponent` (v1.1)                                                             | **Renombra** a `BaseDocumentListComponent` y elimina las ramas de masters/utility                              |
| `MasterEntityConfig`, `MasterCapabilities`, `UtilityEntityConfig`                      | **Se elimina** del framework                                                                                   |
| Sidebar dinámico (v1.1)                                                                | **Se refactoriza** a sidebar **híbrido**: items declarativos + acordeones derivados del registry de documentos |
| Módulo `general` registrado (v1.1)                                                     | **Se elimina** del registry; pasa a ser feature directo con sus propias rutas                                  |

---

## 5. Principios rectores

Las decisiones técnicas se justifican contra estos principios. Cualquier abstracción que no esté motivada por al menos uno de ellos es deuda potencial.

### 5.1 SOLID

- **SRP — Single Responsibility**: cada clase tiene una razón para cambiar. `ModuleRegistryService` solo carga configs. `ModuleNavigationStore` solo mantiene el estado de la navegación de documentos. Cada master tiene su servicio HTTP propio.
- **OCP — Open/Closed**: agregar un documento nuevo a un módulo existente no requiere modificar el core. Agregar un master nuevo requiere crear su archivo y registrar su ruta — cero modificaciones a otros features.
- **LSP — Liskov Substitution**: cualquier `DocumentEntityConfig` es consumible por `BaseDocumentListComponent` sin ramificación adicional. Cualquier `Resource` que cumpla el contrato de `<lib-data-table>` se renderiza igual.
- **ISP — Interface Segregation**: `DocumentEntityConfig` declara únicamente lo que los documentos necesitan. Los masters no arrastran `documentTypeId` ni `inventoryEffect`.
- **DIP — Dependency Inversion**: componentes y páginas dependen de abstracciones (`EntityDataGateway`, tokens de servicio), no de implementaciones concretas.

### 5.2 YAGNI y proporcionalidad

- **YAGNI ("you aren't gonna need it")**: no se abstrae lo que solo se usa una vez. Si una pieza de configuración solo aparece en una entidad, vive en esa entidad.
- **Proporcionalidad**: la complejidad de la abstracción se mide contra el número real de casos que la justifican. Una abstracción válida para 14 entidades (documentos) no se traslada automáticamente a 6 entidades (masters) que no comparten estructura.
- **Repetición preferida a abstracción prematura**: tres listas casi iguales son aceptables. La abstracción aparece cuando la repetición duele, no antes.

### 5.3 Otros principios

- **Inmutabilidad por defecto**: todo `readonly`. Las configs no se mutan en runtime.
- **Type-safety estricto**: `any` está prohibido. Usar `unknown` + parseo explícito donde el tipo es genuinamente desconocido.
- **Lectura síncrona donde se pueda**: signals sobre observables para estado no derivado de I/O.
- **Composición sobre herencia**: los componentes reciben colaboradores vía DI o inputs, no extienden clases.
- **Fail fast, fail loud**: errores de configuración explotan en tiempo de carga; nunca se silencian.

---

## 6. Arquitectura propuesta

Dos caminos coexisten en el ERP, alimentados por un set de building blocks compartidos.

### 6.A Camino "documentos": framework configuracional

Aplica a entidades transaccionales sobre el endpoint genérico `/api/documento`. Una constante declarativa describe la entidad y el framework la renderiza.

#### 6.A.1 Tipos

Ubicación: `libs/core/src/lib/module-config/types/`

```ts
// entity-config.types.ts

/**
 * Efecto del documento sobre el inventario.
 * `inflow`  aumenta stock (compra, devolución de venta).
 * `outflow` disminuye stock (venta, devolución de compra).
 */
export type InventoryEffect = 'inflow' | 'outflow';

/**
 * Capacidades del documento visibles en la UI.
 * Cada flag es independiente; declara lo que la entidad SOPORTA técnicamente.
 * La visibilidad final también depende de los permisos del usuario.
 */
export interface DocumentCapabilities {
  readonly canCreate: boolean;
  readonly canEdit: boolean;
  readonly canDelete: boolean;
  readonly canSelectRows: boolean;
  readonly canImport: boolean;
  readonly canExportExcel: boolean;
  readonly canExportZip: boolean;
  readonly canGenerate: boolean;
}

/** Rutas relativas al módulo. */
export interface EntityRoutes {
  readonly list: string;
  readonly new: string;
  readonly edit: string;
  readonly detail: string;
}

/**
 * Configuración de un documento transaccional.
 *
 * En v2.0, `EntityConfig` es exclusivamente `DocumentEntityConfig`.
 * Los masters NO viven en este tipo — son features directos (ver §6.B).
 */
export interface DocumentEntityConfig {
  readonly kind: 'document';
  readonly id: string; // 'factura-compra'
  readonly displayNameKey: string; // 'modules.compra.entities.factura.name'
  readonly endpoint: string; // '/api/documento'
  readonly documentTypeId: number; // 5 — único across todo el ERP
  readonly inventoryEffect: InventoryEffect;
  readonly schemaVersion: number; // Para invalidar localStorage
  readonly columns: readonly ColumnDef[];
  readonly filters: readonly FilterField[];
  readonly routes: EntityRoutes;
  readonly capabilities: DocumentCapabilities;
  readonly extraActionIds?: readonly string[];
  readonly importDescriptor?: ImportDescriptor;
}

export type EntityConfig = DocumentEntityConfig;
```

```ts
// module-config.types.ts

/** Módulo de negocio que contiene documentos transaccionales. */
export interface ModuleConfig {
  readonly id: string; // 'compra'
  readonly displayNameKey: string;
  readonly iconClass: string; // 'pi pi-shopping-cart'
  readonly documents: readonly DocumentEntityConfig[];
}
```

> Nota v2.0: el campo se renombra de `entities` a `documents` para reflejar que solo aloja documentos. Los masters viven en sus features.

#### 6.A.2 Registry (OCP)

```ts
// apps/erp/src/app/core/module-config/module-registry.constant.ts

export const ERP_MODULE_REGISTRY = {
  compra: () => import('../../features/compra/compra.config').then((m) => m.COMPRA_CONFIG),
  venta: () => import('../../features/venta/venta.config').then((m) => m.VENTA_CONFIG),
  inventario: () =>
    import('../../features/inventario/inventario.config').then((m) => m.INVENTARIO_CONFIG),
  // ... otros módulos con documentos
} as const satisfies ModuleRegistry;
```

Inyectado vía `MODULE_REGISTRY` token de `@reddoc/core`. El framework define el contrato; la app provee la instancia (DIP).

#### 6.A.3 Servicios

- **`ModuleRegistryService`** (`@reddoc/core`): carga `ModuleConfig` lazy desde el registry, cachea, valida.
- **`ModuleNavigationStore`** (`@reddoc/core`): signals `activeModule` y `activeDocument` escritos por los resolvers.

#### 6.A.4 Routing + resolvers

```ts
// apps/erp/src/app/features/compra/compra.routes.ts

export const COMPRA_ROUTES: Routes = [
  {
    path: '',
    resolve: { module: activeModuleResolver('compra') },
    children: [
      {
        path: 'documento/:documentKey',
        resolve: { document: activeDocumentResolver() },
        children: [
          {
            path: 'list',
            loadComponent: () =>
              import('@reddoc/feature-base').then((m) => m.BaseDocumentListComponent),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('@reddoc/feature-base').then((m) => m.BaseDocumentFormComponent),
          },
          {
            path: 'edit/:id',
            loadComponent: () =>
              import('@reddoc/feature-base').then((m) => m.BaseDocumentFormComponent),
          },
          {
            path: 'detail/:id',
            loadComponent: () =>
              import('@reddoc/feature-base').then((m) => m.BaseDocumentDetailComponent),
          },
        ],
      },
    ],
  },
];
```

> Nota: `activeEntityResolver(kind)` se renombra a `activeDocumentResolver()` (sin parámetro) porque solo procesa documentos en v2.0.

#### 6.A.5 `BaseDocumentListComponent`

Reemplaza al `BaseListComponent` de v1.1. Recibe `DocumentEntityConfig` por input. Internamente compone `<lib-data-table>` y `<lib-filter-panel>`. Delega I/O al `EntityDataGateway`.

```ts
@Component({ selector: 'lib-base-document-list' /* ... */ })
export class BaseDocumentListComponent {
  readonly document = input.required<DocumentEntityConfig>();
  // toolbar, columnas, paginación, etc. derivadas del config
}
```

#### 6.A.6 Strategy pattern para acciones extras

(Sin cambios respecto a v1.1.) Acciones como "Generar", "Recurrente" se registran como `EntityActionStrategy` con `multi: true` providers. El documento declara qué strategies usa por `id`.

### 6.B Camino "masters": features directos

Aplica a entidades administrativas con endpoint propio. Cada master vive como feature independiente.

#### 6.B.1 Anatomía de un master

```
apps/erp/src/app/features/general/
├── general.routes.ts                      · solo rutas del feature
├── menu.ts                                · entradas que aporta al sidebar (declarativo)
├── services/
│   └── contacto.service.ts                · extends BaseHttpService
└── pages/
    └── contactos-list/
        ├── contactos-list.component.ts    · página dedicada — orquesta el listado
        ├── contactos-list.component.html
        └── contactos-list.component.scss
```

#### 6.B.2 Cómo se ve una página de master

```ts
@Component({
  selector: 'app-contactos-list',
  standalone: true,
  imports: [DataTableComponent, FilterPanelComponent, ToolbarActionsComponent],
  templateUrl: './contactos-list.component.html',
})
export class ContactosListComponent {
  private readonly service = inject(ContactoService);

  protected readonly columns: readonly ColumnDef[] = [
    {
      field: 'id',
      headerKey: 'modules.general.contacto.columns.id',
      type: 'number',
      width: '70px',
      align: 'right',
      sortable: true,
    },
    {
      field: 'nombre_corto',
      headerKey: 'modules.general.contacto.columns.nombre',
      type: 'text',
      sortable: true,
    },
    // ...
  ];

  protected readonly filters: readonly FilterField[] = [
    {
      name: 'cliente',
      displayNameKey: 'modules.general.contacto.filters.cliente',
      type: 'boolean',
    },
    {
      name: 'proveedor',
      displayNameKey: 'modules.general.contacto.filters.proveedor',
      type: 'boolean',
    },
    // ...
  ];

  protected readonly storageKey = 'general:contactos:v1';

  protected readonly items = signal<readonly Contacto[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly isLoading = signal(false);

  // Lógica de paginación, filtros, carga, etc.
  // Es código simple del feature, no del framework.
}
```

**Características**:

- Sin `EntityConfig`, sin registry, sin resolver. La página existe y se renderiza directamente.
- Compone los building blocks compartidos por inputs explícitos.
- Si necesita un campo extra o un comportamiento único, lo agrega en el mismo archivo sin tocar a otros features.

### 6.C Building blocks compartidos

Viven en `libs/feature-base/src/lib/` y los usan **ambos caminos**.

#### 6.C.1 `<lib-data-table>` — componente "tonto"

```ts
@Component({ selector: 'lib-data-table' /* ... */ })
export class DataTableComponent {
  readonly columns = input.required<readonly ColumnDef[]>();
  readonly items = input.required<readonly unknown[]>();
  readonly totalCount = input<number>(0);
  readonly loading = input<boolean>(false);
  readonly pageSize = input<number>(25);
  readonly currentPage = input<number>(0);
  readonly selectionMode = input<'none' | 'multiple'>('none');
  readonly selectedRows = input<readonly unknown[]>([]);
  readonly rowActions = input<readonly RowAction[]>([]);

  readonly pageChange = output<{ page: number; pageSize: number }>();
  readonly sortChange = output<readonly SortSpec[]>();
  readonly selectionChange = output<readonly unknown[]>();
  readonly rowActionInvoked = output<{ actionId: string; row: unknown }>();
}
```

Sin lógica de negocio. Sin HTTP. Sin storage. Solo render + eventos. Es la pieza más reusada del sistema.

#### 6.C.2 `<lib-filter-panel>` — UI de filtros

Recibe `FilterField[]` + condiciones actuales, emite condiciones nuevas. Sin conocimiento de a qué entidad pertenece.

#### 6.C.3 `<lib-toolbar-actions>` — botones del header

Recibe un array declarativo de acciones (`{ id, labelKey, icon, severity, disabled? }`), emite el id al hacer click. El consumidor decide qué hacer con cada uno.

#### 6.C.4 `EntityDataGateway` + `HttpEntityDataGateway`

Sigue valiendo para documentos. Para masters, también es útil — pero un master simple puede saltarlo y usar su `*Service` directo si no necesita testabilidad de gateway. **No es obligatorio para masters**.

#### 6.C.5 `EntityFilterStorageService` (refactor v2.0)

Cambio de firma: en v1.1 recibía `EntityConfig`. En v2.0 recibe `storageKey: string` directo.

```ts
@Injectable({ providedIn: 'root' })
export class EntityFilterStorageService {
  read(storageKey: string): readonly FilterCondition[] {
    /* ... */
  }
  write(storageKey: string, filters: readonly FilterCondition[]): void {
    /* ... */
  }
  clear(storageKey: string): void {
    /* ... */
  }
}
```

Cada llamador construye su clave: documentos vía helper `buildDocumentStorageKey(module, document)`, masters con un literal `'general:contactos:v1'`.

#### 6.C.6 Tipos compartidos

`ColumnDef`, `FilterField`, `ListQuery`, `ListResponse`, `FilterCondition`, `SortSpec`, `FilterOperator`, `ImportDescriptor`. Viven en `@reddoc/core` para que cualquier feature los importe.

### 6.D Sidebar híbrido

El sidebar se compone de **dos fuentes**:

1. **Items declarativos** definidos en `apps/erp/src/app/layouts/sidebar-menu.ts`:
   - Items directos (Dashboard, Reportes…).
   - Grupos de masters por módulo (Administrador: Contactos, Ítems, Sedes…).
2. **Acordeones derivados** del `MODULE_REGISTRY` con sus documentos:
   - Compra → Documentos: Factura compra, Nota crédito…
   - Venta → Documentos: Factura venta, Nota crédito venta…

```ts
// apps/erp/src/app/layouts/sidebar-menu.ts

export const SIDEBAR_MENU: readonly SidebarSection[] = [
  {
    kind: 'item',
    labelKey: 'layout.nav.dashboard',
    iconClass: 'pi pi-th-large',
    path: 'dashboard',
  },
  {
    kind: 'module',
    moduleId: 'general',
    labelKey: 'modules.general.name',
    iconClass: 'pi pi-cog',
    groups: [
      {
        labelKey: 'layout.nav.sections.master',
        items: [
          { labelKey: 'modules.general.contacto.menuName', path: 'general/contactos' },
          // ...
        ],
      },
    ],
  },
  // Módulos con documentos aparecen automáticamente porque `WorkspaceLayout`
  // los mezcla con `ModuleRegistryService.loadAll()` filtrando por
  // los que tienen `documents.length > 0`.
];
```

El `WorkspaceLayoutComponent` ensambla las dos fuentes en un único árbol.

---

## 7. Convenciones de naming

Reglas que aplican a todo el código. Romperlas requiere justificación explícita en el PR.

### 7.1 General

| Categoría           | Convención                        | Ejemplo                                 |
| ------------------- | --------------------------------- | --------------------------------------- |
| Archivos            | `kebab-case`                      | `module-registry.service.ts`            |
| Clases / interfaces | `PascalCase`                      | `ModuleRegistryService`, `EntityConfig` |
| Constantes globales | `SCREAMING_SNAKE_CASE`            | `ERP_MODULE_REGISTRY`, `COMPRA_CONFIG`  |
| Funciones / métodos | `camelCase`, verbo primero        | `loadModule`, `setActiveDocument`       |
| Booleanos           | Prefijo `is`/`can`/`has`/`should` | `isLoading`, `canEdit`, `hasFilters`    |
| Signals             | Sin prefijo, snake o camel        | `activeDocument`, `items`               |
| Eventos / outputs   | Verbo en pasado                   | `documentSelected`, `actionInvoked`     |
| Inyección tokens    | `SCREAMING_SNAKE_CASE`            | `ENTITY_DATA_GATEWAY`                   |

### 7.2 Identificadores en el dominio

- Usa `id` (no `key`, `name`, `slug`) para identificadores estables que aparecen en URLs.
- `displayNameKey` para claves i18n. Nunca strings de UI literales en configs.
- Código y APIs en inglés; strings de UI en español/inglés vía i18n.

### 7.3 Anti-naming (prohibido)

- `data: any`, `params: any` → usar `unknown` + parseo, o tipar correctamente.
- `obj.modeloCofig` (typo del legacy) → revisar antes de commitear.
- `arrItems`, `objConfig` → notación húngara, prohibido.
- `_modelo`, `_tipo` (underscore prefix) → privado real con `private`.
- Funciones que devuelven `any` o `Promise<any>`.

---

## 8. Estructura por módulo

Dos patrones, según la naturaleza del módulo.

### 8.1 Módulo con documentos (camino A)

```
apps/erp/src/app/features/<id>/
├── <id>.routes.ts                    · rutas + resolvers
├── <id>.config.ts                    · ModuleConfig exportado
├── actions/                          · strategies del módulo
│   ├── <action>.action.ts
│   └── index.ts                      · provider() para registrar todas
└── i18n/                             · traducciones del módulo (cuando aplique)
```

Ejemplo: módulo `compra` con documentos Factura, Nota crédito, Nota débito, etc.

### 8.2 Módulo con masters (camino B)

```
apps/erp/src/app/features/<id>/
├── <id>.routes.ts                    · rutas literales del feature
├── menu.ts                           · entradas del sidebar para este módulo
├── services/
│   ├── contacto.service.ts
│   └── item.service.ts
└── pages/
    ├── contactos-list/
    │   ├── contactos-list.component.ts
    │   ├── contactos-list.component.html
    │   └── contactos-list.component.scss
    ├── contactos-form/
    │   └── ...
    └── items-list/
        └── ...
```

Ejemplo: módulo `general` con masters Contacto, Ítem, Sede, Almacén, Cuenta banco, Asesor, Resolución.

### 8.3 Módulo mixto

Si un módulo tiene **documentos y masters**, puede combinar las dos estructuras: un `<id>.config.ts` con `documents`, **y también** `pages/<master>-list/` para sus masters. Cada parte usa el camino correspondiente.

### 8.4 Cómo agregar un master nuevo (ejemplo: ítems)

1. Crear `apps/erp/src/app/features/general/services/item.service.ts` extendiendo `BaseHttpService`.
2. Crear `apps/erp/src/app/features/general/pages/items-list/items-list.component.ts` con columnas, filtros y la página armada con `<lib-data-table>`.
3. Agregar la ruta a `general.routes.ts`: `{ path: 'items', loadComponent: () => import('./pages/items-list/items-list.component').then(m => m.ItemsListComponent) }`.
4. Agregar la entrada al menú en `apps/erp/src/app/features/general/menu.ts`.

Sin tocar el framework, sin tocar otros features.

### 8.5 Cómo agregar un documento nuevo (ejemplo: nota débito de venta)

1. Agregar el descriptor al array `documents` de `venta.config.ts`.
2. Si necesita una acción custom, registrar la strategy.

El framework hace el resto (sidebar, rutas, lista, form, detalle).

---

## 9. Manejo de errores y casos límite

### 9.1 Errores tipados

Clases de error específicas en lugar de `new Error('mensaje')` genérico. Permite que el `ErrorHandler` global reaccione apropiadamente (toast, redirect, etc.).

Conservados de v1.1 y aplicables al camino de documentos:

- `UnknownModuleError`
- `ConfigMismatchError`
- `DuplicateEntityIdError`
- `MissingModuleContextError`
- `MissingDocumentKeyError` (renombrado desde `MissingEntityKeyError`)
- `DocumentNotFoundError` (renombrado desde `EntityNotFoundError`)

Para masters no se necesitan errores especiales — los servicios HTTP propagan errores estándar de `HttpClient`.

### 9.2 Boundary de errores en el router

`ConfigErrorHandler` captura errores de resolvers de documentos y redirige a `/not-found` o muestra un toast. Los masters usan el manejo de errores de su propio servicio HTTP.

### 9.3 Validación de configs en build

Script Nx `validate-configs` que:

- Importa todas las configs de documentos registradas.
- Verifica que `documentTypeId` sea único across módulos.
- Verifica que cada `extraActionIds` referenciado exista en algún archivo de strategy.
- Verifica que las claves i18n existan en los diccionarios.

Corre en pre-commit y CI.

---

## 10. Estrategia de testing

### 10.1 Cobertura mínima por capa

| Capa                                     | Tipo de test                     | Cobertura objetivo           |
| ---------------------------------------- | -------------------------------- | ---------------------------- |
| Tipos (compile-time)                     | `tsc --strict`                   | 100% (forzado)               |
| `ModuleRegistryService`                  | Unit                             | 100%                         |
| `ModuleNavigationStore`                  | Unit                             | 100%                         |
| Resolvers de documentos                  | Unit + integration               | 100% paths felices + errores |
| `HttpEntityDataGateway`                  | Unit con `HttpTestingController` | 100% de métodos              |
| `EntityFilterStorageService`             | Unit                             | 100% (incluye corrupción)    |
| `BaseDocumentListComponent`              | Component test con gateway fake  | flujos principales           |
| `<lib-data-table>`, `<lib-filter-panel>` | Component test                   | inputs/outputs + edge cases  |
| Servicios de masters (`*Service`)        | Unit con `HttpTestingController` | métodos públicos             |
| Páginas de masters (`*-list.component`)  | Component test                   | flujo de página              |
| Configs de documentos                    | Validation script                | 100% en CI                   |

### 10.2 Fakes en lugar de mocks

Para `EntityDataGateway` mantenemos una implementación **en memoria** real en `libs/feature-base/testing/`:

```ts
export class InMemoryEntityDataGateway implements EntityDataGateway {
  private store = new Map<string, unknown[]>();
  // implementación real
}
```

Tests más legibles y verifican interacciones reales, no comportamientos espiados.

---

## 11. Trade-offs aceptados

### 11.1 Para documentos (camino A)

**Ganamos**:

- Onboarding de documento nuevo: 1 objeto en el array `documents` de su módulo.
- Type-safety end-to-end sin `any`.
- Lazy load real por módulo.
- Una sola implementación de lista/form/detalle para los 14+ tipos de documento.
- Strategies para acciones custom — extensibilidad sin tocar `BaseDocumentList`.

**Pagamos**:

- Indirección: para entender `/compra/documento/factura-compra/list` hay que leer routing + config + `BaseDocumentList`.
- Curva de aprendizaje del framework — ~1-2 días para un dev nuevo.
- Foundation upfront (~1,000 LoC de scaffolding) ya pagada en v1.1.

### 11.2 Para masters (camino B)

**Ganamos**:

- Cada master es completamente independiente — modificar uno no afecta a otros.
- Lectura directa: ver lo que hace un master no requiere conocer el framework.
- UX flexible — agregar campos custom, validaciones especiales, layouts distintos sin escape hatches.
- Onboarding inmediato: un dev escribe un master nuevo en una sesión.

**Pagamos**:

- Cierto código repetido entre masters (la estructura "página con tabla + filtros + servicio HTTP" se replica).
- La repetición es manejable porque los building blocks (`<lib-data-table>`, `<lib-filter-panel>`) absorben el 80%.

### 11.3 Cuándo **no** usar ninguno de los dos caminos

Algunas features no son CRUD y deben quedarse como features tradicionales sin building blocks de tabla:

- **`contenedores`** — selección de tenant pre-workspace.
- **`dashboard`** — KPIs, gráficos, vistas custom.
- **Settings de usuario** — formularios únicos por sección.
- **Wizards, builders, configuradores** — flujos no-CRUD.

---

## 12. Plan de migración

Estado actual (commit `fcdb96f`): foundation v1.1 implementada con `BaseListComponent` unificado que ramifica por `kind` y módulo `general` registrado como `kind: 'master'`. Pasamos a v2.0 sin tirar lo aprovechable.

| Paso | Alcance                                                                                                                                   | Riesgo |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1    | Crear `<lib-data-table>` standalone tonto al lado del `BaseListComponent` actual. No toca nada existente.                                 | Bajo   |
| 2    | Refactorizar `EntityFilterStorageService` para aceptar `storageKey: string` directo (cambio compatible: ambas firmas conviven).           | Bajo   |
| 3    | Crear `ContactoService` (extends `BaseHttpService`) + `ContactosListComponent` que compone `<lib-data-table>` + servicio.                 | Bajo   |
| 4    | Crear `sidebar-menu.ts` y modificar `WorkspaceLayoutComponent` para mezclar items declarativos + acordeones del registry de documentos.   | Medio  |
| 5    | Mover la entrada "Contactos" del menú: del registry de v1.1 al menú declarativo. La ruta apunta a la página nueva.                        | Bajo   |
| 6    | Quitar `general` del `ERP_MODULE_REGISTRY` y eliminar `general.config.ts` (la entidad `contacto` ya no es del framework).                 | Bajo   |
| 7    | Limpiar el framework: eliminar `MasterEntityConfig`, `MasterCapabilities`, `UtilityEntityConfig`. `EntityConfig` queda solo documentos.   | Medio  |
| 8    | Renombrar `BaseListComponent` → `BaseDocumentListComponent`. Quitar narrowing por `kind`. Simplificar resolvers y gateway.                | Medio  |
| 9    | Renombrar `activeEntityResolver(kind)` → `activeDocumentResolver()` sin parámetro. Renombrar errores de "entity" a "document".            | Bajo   |
| 10   | Validar end-to-end: contactos como feature directo; framework listo para el primer documento real cuando se sume un módulo transaccional. | Bajo   |

Cada paso queda en su commit, así puedes revisar el diff o revertir individualmente.

**No se migra**: `contenedores`, `dashboard`, `auth`. Siguen como features tradicionales.

---

## 13. Decisiones tomadas

### 13.1 Ubicación de los componentes y building blocks

**Decisión**: nueva librería Nx `libs/feature-base/` ya creada en v1.1.

- Building blocks tontos (`<lib-data-table>`, `<lib-filter-panel>`, `<lib-toolbar-actions>`).
- Componentes base del framework de documentos (`BaseDocumentListComponent`, `BaseDocumentFormComponent`, `BaseDocumentDetailComponent`).
- Storage de filtros y otros helpers transversales.

### 13.2 Granularidad de i18n

**Decisión**: por módulo, con namespace embebido por entidad / master.

```
modules.compra.entities.factura.name        → 'Factura de compra'
modules.general.contacto.columns.nombre     → 'Nombre'
modules.general.contacto.filters.cliente    → 'Cliente'
common.actions.new                          → 'Nuevo'
common.actions.delete                       → 'Eliminar'
```

Las claves comunes (botones "Guardar", "Cancelar", toasts genéricos) viven en `common.*`.

### 13.3 Sistema de permisos

**Decisión**: dos niveles — por ruta (acceso) y por capacidad (UI).

- **Acceso al módulo / ruta**: guards de Angular leen el rol del usuario contra una matriz `module → role`. Bloquea la ruta entera.
- **Capacidades dentro de la UI**: el componente consulta `PermissionsService.can('compra.factura.create')` antes de mostrar un botón. El config `capabilities.canCreate` declara qué es **técnicamente posible**; el service decide qué le es **permitido al usuario actual**.

Implementación inicial: `PermissionsService` con signal estático cargado en `provideAppInitializer`. Cuando el backend exponga API de permisos granulares, solo cambia la fuente — el contrato del servicio no.

### 13.4 Vistas alternativas (kanban, calendar, etc.)

**Decisión**: no soportar inicialmente. Cuando emerja la necesidad:

- En **documentos**: agregar `defaultView: 'list' | 'kanban' | 'calendar'` al `DocumentEntityConfig` y crear `BaseDocumentKanbanComponent` en `libs/feature-base/`.
- En **masters**: cada feature ya es libre de renderizar lo que quiera; agrega su propia página `<master>-kanban/`.

### 13.5 Enfoque híbrido (nueva en v2.0)

**Decisión**: framework configuracional solo para documentos transaccionales; masters como features directos.

**Razones**:

- El backend ya está separado para masters (cada uno con su endpoint). El framework asume un patrón de acceso uniforme que solo se cumple en documentos.
- Las diferencias entre masters son **estructurales** (cada uno con su shape, su UX), no solo de capacidades. Forzarlos a una abstracción común introduce indirección sin beneficio.
- Conservar el framework donde el reuso es real (documentos) y retirarlo donde no lo era (masters) reduce ~600 LoC de scaffolding y elimina escape hatches.

**Implicaciones**:

- `EntityConfig` se vuelve sinónimo de `DocumentEntityConfig`.
- `BaseListComponent` se renombra a `BaseDocumentListComponent` y se simplifica.
- Sidebar se vuelve híbrido (declarativo + derivado del registry).
- Cada master implementa su listado componiendo building blocks.

---

## 14. Referencias

### Legacy estudiado

- `/home/tamerlan/Desktop/semantica/app.reddoc/` — Angular 17
  - `src/app/modules/compra/domain/constantes/configuracion.constant.ts`
  - `src/app/comun/services/application/config-modulo.service.ts`
  - `src/app/comun/componentes/base-documento/base-lista/base-lista.component.ts`
  - `src/app/comun/componentes/base-administracion/base-lista/base-lista.component.ts`

### Nuevo

- `/home/tamerlan/Desktop/reddoc-monorepo/`
  - `apps/erp/` — aplicación destino
  - `libs/core/` — tipos, registry, services, resolvers, gateway, errores
  - `libs/feature-base/` — building blocks tontos + componentes base de documentos
  - `libs/ui/` — componentes de presentación pura (auth, avatares, toggles)

### Conceptos

- **SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **YAGNI**: "You aren't gonna need it"
- **Strategy pattern**: Gamma et al., "Design Patterns"
- **Configuration-driven architecture**: variante de "Data-Driven UI" (aplica solo a documentos en v2.0)
- **Discriminated unions en TS**: handbook oficial — narrowing por propiedad común (aplica al campo `kind` de `DocumentEntityConfig`, que en v2.0 tiene una sola variante pero queda como hook para futuras extensiones)

---

## Historial de versiones

- **v1.0** (2026-05-11): primera propuesta — framework configuracional uniforme para documentos y masters.
- **v1.1** (2026-05-11): revisión SOLID — discriminated unions, registry, signals, resolvers, gateway, strategies.
- **v2.0** (2026-05-12): enfoque híbrido tras implementación de v1.1 — documentos siguen configuracionales, masters pasan a features directos.
