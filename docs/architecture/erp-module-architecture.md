# Arquitectura modular del ERP

> **Estado**: Decisión aprobada · pendiente de implementación
> **Fecha**: 2026-05-11
> **Autores**: Sebastian
> **Aplica a**: `apps/erp` del monorepo `reddoc-monorepo`
> **Versión del documento**: 1.1 (revisión SOLID + buenas prácticas)

---

## Tabla de contenidos

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Contexto](#2-contexto)
3. [Análisis del sistema legacy](#3-análisis-del-sistema-legacy)
4. [Principios rectores](#4-principios-rectores)
5. [Arquitectura propuesta](#5-arquitectura-propuesta)
6. [Convenciones de naming](#6-convenciones-de-naming)
7. [Estructura por módulo](#7-estructura-por-módulo)
8. [Manejo de errores y casos límite](#8-manejo-de-errores-y-casos-límite)
9. [Estrategia de testing](#9-estrategia-de-testing)
10. [Trade-offs aceptados](#10-trade-offs-aceptados)
11. [Plan de implementación](#11-plan-de-implementación)
12. [Decisiones tomadas](#12-decisiones-tomadas)
13. [Referencias](#13-referencias)

---

## 1. Resumen ejecutivo

El ERP albergará **8+ módulos de negocio** (compra, venta, inventario, cartera, tesorería, etc.) sobre un **backend genérico** (`/api/documento` que discrimina por `documento_tipo_id`). A esa escala, componentes específicos por entidad son insostenibles. Adoptamos un patrón **configuration-driven** inspirado en el sistema legacy `app.reddoc`, **modernizado para Angular 20** y reescrito siguiendo **SOLID**, **inmutabilidad** y **type-safety estricto**.

Cambios clave frente al legacy:

| Aspecto                       | Legacy (`app.reddoc`)                                                           | Nuevo (`reddoc-monorepo`)                                   |
| ----------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Carga de configuración        | `switch(modulo)` hardcodeado                                                    | Registry con lazy imports (OCP)                             |
| Estado del módulo             | `BehaviorSubject`                                                               | `signal` + `computed` (lectura síncrona)                    |
| Tipado                        | `Record<string, any>`                                                           | Discriminated unions, `readonly` por defecto                |
| Componentes base              | `ViewContainerRef.createComponent()`                                            | Standalone components + `input()` tipado                    |
| Resolución de config          | Listener global de `NavigationEnd`                                              | Resolver por ruta + `withComponentInputBinding()`           |
| Duplicación                   | `base-documento` (491 LoC) + `base-administracion` (266 LoC) — **70% repetido** | Una implementación que ramifica por `kind`                  |
| Acceso a datos                | HTTP directo desde componente                                                   | Abstracción `EntityDataGateway` (DIP)                       |
| Acciones custom               | `ViewContainerRef` + lookup por `key`                                           | Strategy pattern vía `EntityActionStrategy`                 |
| Persistencia de filtros       | `localStorage` sin versión                                                      | `localStorage` con clave versionada por config              |
| Responsabilidades del service | Una clase hace todo                                                             | Separadas: `ModuleRegistryService`, `ModuleNavigationStore` |

---

## 2. Contexto

### 2.1 Estado actual del nuevo ERP

`apps/erp` corre sobre **Angular 20 standalone + PrimeNG 20 + Tailwind v4** dentro de un monorepo Nx. La única feature implementada es `contenedores` (selección de tenant pre-workspace), que es una **feature no-CRUD** y queda fuera del framework.

```
apps/erp/src/app/
├── core/                  · constants, guards
├── features/
│   ├── auth/              · login, register, etc. (vive en libs/ui)
│   ├── contenedores/      · selección de tenant
│   └── dashboard/         · placeholder
├── layouts/               · ShellLayout + WorkspaceLayout
└── shared/                · user-menu, etc.
```

Rutas: `/` redirige según auth, `/contenedores` selecciona tenant, `/t/:tenantSlug/...` entra al workspace del tenant.

### 2.2 El legacy: `app.reddoc`

Sistema Angular 17 en `/home/tamerlan/Desktop/semantica/app.reddoc/` con 8 módulos de negocio y ~3,120 líneas de configuración declarativa. Resolvió el problema de "muchas entidades sobre el mismo backend" con un patrón configuration-driven que tiene aciertos arquitectónicos genuinos y deuda técnica importante.

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
   · endpoint        = 'general/documento'
   · queryParams     = { documento_tipo_id: 5, ordering: '...' }
   · ui flags        = { verBotonNuevo: true, ... }
   · rutas           = { nuevo, editar, detalle }
   · filters.ui      = DOCUMENTO_FILTERS
   │
   ▼
HTTP GET /general/documento?documento_tipo_id=5&...
   │
   ▼
Render con tabla genérica + botones condicionados por ui flags
```

### 3.2 Aciertos que preservamos

| Acierto                                | Por qué importa                                                   |
| -------------------------------------- | ----------------------------------------------------------------- |
| Una constante por módulo describe todo | Onboarding rápido: agregar `FACTURA_VENTA` = 1 objeto             |
| Componentes base reutilizables         | 14+ tipos de documento usan el mismo `BaseListaComponent`         |
| Endpoint genérico aprovechado          | `documento_tipo_id` discrimina; el front no necesita 14 servicios |
| Sidebar derivado de la config          | El menú se construye desde el registro de módulos (DRY)           |
| UI flags por entidad                   | Activan/desactivan capacidades sin código nuevo                   |
| Filtros declarativos compartidos       | `DOCUMENTO_FILTERS`, `CONTACTO_FILTERS` se importan entre módulos |

### 3.3 Antipatrones que corregimos (no repetiremos)

| Antipatrón legacy                                                                                       | Costo                                            | Cómo lo corregimos                                                              |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------- |
| `switch(modulo)` en `ConfigModuleService`                                                               | Violar OCP: agregar módulo modifica el core      | **Registry** `Record<ModuleId, ModuleLoader>` con lazy imports                  |
| `queryParams: { [key: string]: any }`                                                                   | Cero type-safety, refactors a ciegas             | Discriminated unions + tipos estrictos por `kind`                               |
| `if (this._modelo === 'GenDocumento')` hardcoded en componente base                                     | Fuga del backend al UI                           | `kind: 'document' \| 'master' \| 'utility'` con narrowing nativo de TS          |
| `ViewContainerRef.createComponent()` para acciones extras                                               | Pierde inputs/outputs, cero type-checking        | Standalone components + Strategy pattern (`EntityActionStrategy`)               |
| `base-documento/base-lista` (491 LoC) vs `base-administracion/base-lista` (266 LoC) — **70% duplicado** | Dos sitios para mantener una sola lógica         | Una sola implementación que ramifica por `kind`                                 |
| `BehaviorSubject<ModeloConfig \| null>`                                                                 | Race conditions; requiere `takeUntil` manual     | `signal<EntityConfig \| null>` con lectura síncrona                             |
| Listener global de `NavigationEnd`                                                                      | Parse del URL con regex; orden de eventos frágil | Resolvers por ruta + `withComponentInputBinding()`                              |
| Imports estáticos de las 8 configs                                                                      | Bundle carga todo aunque solo se use 1 módulo    | Lazy `import()` dentro del registry                                             |
| `localStorage.setItem('filtros_compra_300', ...)` sin versión                                           | Cambios de schema rompen storage del usuario     | Clave con `schemaVersion` derivado del config                                   |
| HTTP directo desde el componente base                                                                   | Violar DIP: componente acoplado a `HttpClient`   | `EntityDataGateway` abstracto inyectado                                         |
| `ConfigModuleService` mezcla carga + estado + navegación                                                | Violar SRP: una clase hace todo                  | 2 servicios: `ModuleRegistryService` (carga) + `ModuleNavigationStore` (estado) |

---

## 4. Principios rectores

El framework se diseña aplicando estos principios. No son aspiracionales — cada decisión técnica los referencia explícitamente.

### 4.1 SOLID

- **SRP — Single Responsibility**: cada clase tiene una razón para cambiar. `ModuleRegistryService` solo carga configs. `ModuleNavigationStore` solo mantiene el estado de la navegación actual. `EntityDataGateway` solo habla con HTTP.
- **OCP — Open/Closed**: agregar un módulo nuevo **no requiere modificar ningún archivo del core**. Solo agregar una entrada en el registry y crear el config del módulo.
- **LSP — Liskov Substitution**: cualquier `EntityConfig` (sea `kind: 'document'`, `'master'` o `'utility'`) es consumible por `BaseListComponent` sin condicionales fuera de los necesarios para el dominio.
- **ISP — Interface Segregation**: `DocumentEntityConfig` y `MasterEntityConfig` no comparten flags irrelevantes. Un master no tiene `documentTypeId` porque no aplica.
- **DIP — Dependency Inversion**: los componentes base dependen de abstracciones (`EntityDataGateway`, `EntityActionStrategy`), no de implementaciones concretas.

### 4.2 Otros principios

- **Inmutabilidad por defecto**: todo `readonly`. Las configs no se mutan en runtime.
- **Type-safety estricto**: `any` está prohibido. Donde el tipo es genuinamente desconocido (respuestas HTTP de listado), usamos `unknown` + parseo explícito.
- **Lectura síncrona donde se pueda**: signals sobre observables para estado no derivado de I/O.
- **Composición sobre herencia**: los componentes base reciben colaboradores vía DI, no extienden clases.
- **Fail fast, fail loud**: errores de configuración explotan en tiempo de carga del módulo, no se silencian.

---

## 5. Arquitectura propuesta

### 5.1 Tipos del dominio configuracional

Ubicación: `libs/core/src/lib/module-config/types/`

```ts
// entity-config.types.ts

/**
 * Tipos de entidad soportados por el framework.
 * - 'document': entidades transaccionales sobre /api/documento (Factura, Nota, etc.)
 * - 'master':   entidades maestras con su propio endpoint (Item, Contacto, etc.)
 * - 'utility':  pantallas custom que no son CRUD pero forman parte del módulo
 */
export type EntityKind = 'document' | 'master' | 'utility';

/**
 * Operación del documento sobre el inventario.
 * 'inflow' aumenta el stock (compra, devolución de venta).
 * 'outflow' disminuye el stock (venta, devolución de compra).
 */
export type InventoryEffect = 'inflow' | 'outflow';

/**
 * Capacidades visibles en la UI de un documento.
 * Cada flag es independiente; no hay implicaciones cruzadas.
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

export interface MasterCapabilities {
  readonly canCreate: boolean;
  readonly canEdit: boolean;
  readonly canDelete: boolean;
  readonly canImport: boolean;
  readonly canExportExcel: boolean;
}

/**
 * Rutas relativas al módulo. Se prefijan con el path del módulo en runtime.
 * Ej: 'list' en módulo 'compra' resuelve a '/compra/documento/factura/list'.
 */
export interface EntityRoutes {
  readonly list: string;
  readonly new: string;
  readonly edit: string;
  readonly detail: string;
}

/**
 * Configuración base compartida por toda entidad.
 * Las propiedades aquí son las únicas que `BaseListComponent` puede asumir sin narrowing.
 */
interface BaseEntityConfig {
  readonly id: string; // Identificador estable en URLs: 'factura-compra'
  readonly displayNameKey: string; // Clave i18n: 'modules.compra.entities.factura.name'
  readonly endpoint: string;
  readonly filters: readonly FilterField[];
  readonly routes: EntityRoutes;
  readonly schemaVersion: number; // Para invalidar localStorage cuando cambia el shape
}

export interface DocumentEntityConfig extends BaseEntityConfig {
  readonly kind: 'document';
  readonly documentTypeId: number; // Discriminador para el backend genérico
  readonly inventoryEffect: InventoryEffect;
  readonly capabilities: DocumentCapabilities;
  readonly extraActionIds?: readonly string[]; // Strategy keys, ver §5.7
  readonly importDescriptor?: ImportDescriptor;
}

export interface MasterEntityConfig extends BaseEntityConfig {
  readonly kind: 'master';
  readonly capabilities: MasterCapabilities;
  readonly importDescriptor?: ImportDescriptor;
}

export interface UtilityEntityConfig {
  readonly kind: 'utility';
  readonly id: string;
  readonly displayNameKey: string;
  readonly loadComponent: () => Promise<Type<unknown>>;
}

/**
 * Union discriminada por `kind`. TypeScript hace narrowing automático
 * cuando se hace switch sobre `entity.kind`.
 */
export type EntityConfig = DocumentEntityConfig | MasterEntityConfig | UtilityEntityConfig;
```

```ts
// module-config.types.ts

export interface ModuleConfig {
  readonly id: string; // 'compra'
  readonly displayNameKey: string; // 'modules.compra.name'
  readonly iconClass: string; // Clase PrimeIcon: 'pi pi-shopping-cart'
  readonly entities: readonly EntityConfig[];
}
```

**Por qué cada decisión**:

- `readonly` recursivo: las configs son **constantes**, no estado. Mutarlas es un bug, no una feature. TypeScript las protege.
- `id: string` en lugar de `key: number | string`: identificador uniforme, legible en URLs. El `documentTypeId` se separa porque es **detalle del backend**, no la identidad de la entidad en el front.
- `displayNameKey` (clave i18n) en lugar de string literal: nunca acoplamos UI a idioma.
- `schemaVersion`: cuando cambien los filtros guardados o el shape de la entidad, incrementamos esta versión y el `localStorage` antiguo se descarta automáticamente.
- `inventoryEffect: 'inflow' | 'outflow'` en lugar de `operation: 1 | -1`: cero magic numbers, intención clara.
- `extraActionIds: readonly string[]`: la entidad solo declara **qué** strategies usa, no las implementa inline. Ver §5.7.

### 5.2 Registry de módulos (OCP)

Ubicación: `libs/core/src/lib/module-config/module-registry.ts`

```ts
/**
 * Función que carga la configuración completa de un módulo.
 * Debe ser una promesa para permitir lazy loading vía dynamic import.
 */
export type ModuleConfigLoader = () => Promise<ModuleConfig>;

/**
 * Registro central de módulos del ERP.
 *
 * Agregar un módulo nuevo:
 *   1. Crear `apps/erp/src/app/features/<id>/<id>.config.ts` que exporte `<ID>_CONFIG: ModuleConfig`.
 *   2. Agregar una entrada en este record. Cero modificaciones a otros archivos.
 *
 * Quitar un módulo:
 *   1. Eliminar la entrada de este record.
 *   2. Borrar la carpeta del feature.
 *   Las rutas obsoletas devolverán 404 en runtime (manejado por wildcard route).
 */
export const MODULE_REGISTRY = {
  compra: () => import('@erp/features/compra/compra.config').then((m) => m.COMPRA_CONFIG),
  venta: () => import('@erp/features/venta/venta.config').then((m) => m.VENTA_CONFIG),
  inventario: () =>
    import('@erp/features/inventario/inventario.config').then((m) => m.INVENTARIO_CONFIG),
  cartera: () => import('@erp/features/cartera/cartera.config').then((m) => m.CARTERA_CONFIG),
  tesoreria: () =>
    import('@erp/features/tesoreria/tesoreria.config').then((m) => m.TESORERIA_CONFIG),
  contabilidad: () =>
    import('@erp/features/contabilidad/contabilidad.config').then((m) => m.CONTABILIDAD_CONFIG),
  general: () => import('@erp/features/general/general.config').then((m) => m.GENERAL_CONFIG),
  humano: () => import('@erp/features/humano/humano.config').then((m) => m.HUMANO_CONFIG),
} as const satisfies Record<string, ModuleConfigLoader>;

/**
 * Tipo derivado del registry. Garantiza que ningún string huérfano
 * pueda referenciar un módulo inexistente.
 */
export type ModuleId = keyof typeof MODULE_REGISTRY;
```

**Por qué `as const satisfies`**:

- `as const` congela los keys del objeto para derivar `ModuleId` con precisión.
- `satisfies` valida que cada loader cumple el contrato sin perder la inferencia literal de keys.

### 5.3 Servicios (SRP)

Una clase, una razón para cambiar. El legacy mezclaba carga + estado + navegación en un solo `ConfigModuleService`. Lo separamos en dos.

#### 5.3.1 `ModuleRegistryService` — solo carga

Ubicación: `libs/core/src/lib/module-config/services/module-registry.service.ts`

```ts
/**
 * Carga ModuleConfig desde el registry y cachea los resultados.
 * No mantiene estado de navegación.
 */
@Injectable({ providedIn: 'root' })
export class ModuleRegistryService {
  private readonly cache = new Map<ModuleId, ModuleConfig>();

  /**
   * Resuelve la configuración de un módulo. La primera llamada
   * dispara el dynamic import; las siguientes leen del cache.
   *
   * @throws UnknownModuleError si el id no está registrado.
   */
  async load(id: ModuleId): Promise<ModuleConfig> {
    const cached = this.cache.get(id);
    if (cached) return cached;

    const loader = MODULE_REGISTRY[id];
    if (!loader) throw new UnknownModuleError(id);

    const config = await loader();
    this.assertValidConfig(config, id);
    this.cache.set(id, config);
    return config;
  }

  /**
   * Devuelve todos los módulos registrados sin cargarlos.
   * Útil para construir el sidebar antes de navegar a un módulo.
   */
  listRegisteredIds(): readonly ModuleId[] {
    return Object.keys(MODULE_REGISTRY) as ModuleId[];
  }

  private assertValidConfig(config: ModuleConfig, expectedId: ModuleId): void {
    if (config.id !== expectedId) {
      throw new ConfigMismatchError(expectedId, config.id);
    }
    const duplicateEntityIds = findDuplicates(config.entities.map((e) => e.id));
    if (duplicateEntityIds.length > 0) {
      throw new DuplicateEntityIdError(expectedId, duplicateEntityIds);
    }
  }
}
```

#### 5.3.2 `ModuleNavigationStore` — solo estado

Ubicación: `libs/core/src/lib/module-config/stores/module-navigation.store.ts`

```ts
/**
 * Mantiene el módulo y la entidad activos según la ruta actual.
 * Los resolvers escriben aquí; los componentes leen via signals.
 */
@Injectable({ providedIn: 'root' })
export class ModuleNavigationStore {
  private readonly _currentModule = signal<ModuleConfig | null>(null);
  private readonly _currentEntity = signal<EntityConfig | null>(null);

  readonly currentModule = this._currentModule.asReadonly();
  readonly currentEntity = this._currentEntity.asReadonly();

  readonly availableFilters = computed(() => this._currentEntity()?.filters ?? []);

  readonly isDocument = computed(() => this._currentEntity()?.kind === 'document');

  setActiveModule(config: ModuleConfig | null): void {
    this._currentModule.set(config);
  }

  setActiveEntity(config: EntityConfig | null): void {
    this._currentEntity.set(config);
  }
}
```

**Por qué dos servicios y no uno**:

- El registry **solo cambia** si cambia la lógica de carga/caché de configs.
- El store **solo cambia** si cambia la lógica de cómo se expone el estado actual.
- Un componente del sidebar que solo necesita listar módulos no debería arrastrar la dependencia del estado de navegación.

### 5.4 Routing con resolvers

Ubicación de los resolvers: `libs/core/src/lib/module-config/resolvers/`

```ts
// active-module.resolver.ts

/**
 * Resolver de nivel módulo. Carga el ModuleConfig completo
 * antes de que cualquier ruta hija se monte.
 *
 * Uso:
 *   { path: 'compra', resolve: { module: activeModuleResolver('compra') }, ... }
 */
export const activeModuleResolver =
  (moduleId: ModuleId): ResolveFn<ModuleConfig> =>
  async (): Promise<ModuleConfig> => {
    const registry = inject(ModuleRegistryService);
    const store = inject(ModuleNavigationStore);
    const config = await registry.load(moduleId);
    store.setActiveModule(config);
    return config;
  };
```

```ts
// active-entity.resolver.ts

/**
 * Resolver de nivel entidad. Resuelve qué entidad del módulo activo
 * corresponde al parámetro `entityKey` de la ruta.
 *
 * @throws EntityNotFoundError si la entidad no existe o no es del kind esperado.
 */
export const activeEntityResolver =
  (expectedKind: EntityKind): ResolveFn<EntityConfig> =>
  (route: ActivatedRouteSnapshot): EntityConfig => {
    const store = inject(ModuleNavigationStore);
    const entityId = route.paramMap.get('entityKey');
    const module = store.currentModule();

    if (!module) throw new MissingModuleContextError();
    if (!entityId) throw new MissingEntityKeyError();

    const entity = module.entities.find((e) => e.id === entityId);
    if (!entity) throw new EntityNotFoundError(module.id, entityId);
    if (entity.kind !== expectedKind) {
      throw new EntityKindMismatchError(entityId, expectedKind, entity.kind);
    }

    store.setActiveEntity(entity);
    return entity;
  };
```

Configuración del router en cada feature:

```ts
// apps/erp/src/app/features/compra/compra.routes.ts

export const COMPRA_ROUTES: Routes = [
  {
    path: '',
    resolve: { module: activeModuleResolver('compra') },
    children: [
      {
        path: 'documento/:entityKey',
        resolve: { entity: activeEntityResolver('document') },
        children: [
          { path: 'list', component: BaseListComponent },
          { path: 'new', component: BaseFormComponent },
          { path: 'edit/:id', component: BaseFormComponent },
          { path: 'detail/:id', component: BaseDetailComponent },
        ],
      },
      {
        path: 'master/:entityKey',
        resolve: { entity: activeEntityResolver('master') },
        children: [
          { path: 'list', component: BaseListComponent },
          { path: 'new', component: BaseFormComponent },
          { path: 'edit/:id', component: BaseFormComponent },
          { path: 'detail/:id', component: BaseDetailComponent },
        ],
      },
    ],
  },
];
```

**Provider del router** (en `app.config.ts`):

```ts
provideRouter(routes, withComponentInputBinding());
```

`withComponentInputBinding()` hace que los `resolve` lleguen como `input()` a los componentes:

```ts
export class BaseListComponent {
  readonly entity = input.required<EntityConfig>(); // viene del resolver
  // ...
}
```

**Por qué resolvers en vez de listener global**:

- El componente **nunca** se monta sin `entity`. No hay `null`-checks defensivos.
- El router de Angular gestiona el ciclo de vida; no hay observable custom que mantener.
- Los errores de configuración fallan **antes** de montar el componente (fail-fast).

### 5.5 Acceso a datos abstracto (DIP)

Ubicación: `libs/core/src/lib/module-config/data/`

```ts
// entity-data-gateway.ts

/**
 * Contrato para acceder a la API de una entidad.
 * El componente base depende de esta abstracción, no de HttpClient.
 *
 * Esto permite:
 *   - Testear componentes base con un gateway en memoria.
 *   - Cambiar el transporte (HTTP, WebSocket, GraphQL) sin tocar el componente.
 *   - Inyectar interceptores específicos por kind sin acoplarlos al HttpClient global.
 */
export interface EntityDataGateway {
  list(entity: EntityConfig, query: ListQuery): Observable<ListResponse>;
  getById(entity: EntityConfig, id: string | number): Observable<unknown>;
  create(entity: EntityConfig, payload: unknown): Observable<unknown>;
  update(entity: EntityConfig, id: string | number, payload: unknown): Observable<unknown>;
  remove(entity: EntityConfig, ids: readonly (string | number)[]): Observable<void>;
}

export const ENTITY_DATA_GATEWAY = new InjectionToken<EntityDataGateway>('EntityDataGateway');
```

```ts
// http-entity-data-gateway.ts — implementación default

@Injectable({ providedIn: 'root' })
export class HttpEntityDataGateway implements EntityDataGateway {
  private readonly http = inject(HttpClient);

  list(entity: EntityConfig, query: ListQuery): Observable<ListResponse> {
    if (entity.kind === 'utility') {
      throw new UnsupportedOperationError('list', 'utility');
    }
    const params = this.buildListParams(entity, query);
    return this.http.get<ListResponse>(entity.endpoint, { params });
  }

  remove(entity: EntityConfig, ids: readonly (string | number)[]): Observable<void> {
    // Para documentos genéricos, el backend espera un POST a /eliminar/.
    // Para masters, DELETE por id. La discriminación ocurre aquí, no en el componente.
    if (entity.kind === 'document') {
      return this.http.post<void>(`${entity.endpoint}/eliminar/`, { ids });
    }
    if (entity.kind === 'master') {
      return forkJoin(ids.map((id) => this.http.delete<void>(`${entity.endpoint}/${id}/`))).pipe(
        map(() => undefined),
      );
    }
    throw new UnsupportedOperationError('remove', entity.kind);
  }

  // ... resto de métodos
}
```

Registro como provider default en `app.config.ts`:

```ts
{ provide: ENTITY_DATA_GATEWAY, useClass: HttpEntityDataGateway }
```

**Beneficio**: el componente base hace `inject(ENTITY_DATA_GATEWAY).list(entity, query)`, sin saber de HTTP, sin condicionales sobre `kind`. La lógica de "documentos van por POST a /eliminar/, masters por DELETE" vive en **un único lugar**.

### 5.6 Componentes base unificados (LSP)

Ubicación: nueva librería Nx `libs/feature-base/` — ver decisión en §12.

```ts
// libs/feature-base/src/lib/components/base-list.component.ts

@Component({
  selector: 'lib-base-list',
  standalone: true,
  imports: [
    /* PrimeNG Table, etc. */
  ],
  templateUrl: './base-list.component.html',
})
export class BaseListComponent {
  // ── Inputs ───────────────────────────────────────────────────────────────
  readonly entity = input.required<EntityConfig>();

  // ── Colaboradores ────────────────────────────────────────────────────────
  private readonly gateway = inject(ENTITY_DATA_GATEWAY);
  private readonly filterStorage = inject(EntityFilterStorageService);
  private readonly actionRegistry = inject(EntityActionRegistry);

  // ── Estado ───────────────────────────────────────────────────────────────
  readonly items = signal<readonly unknown[]>([]);
  readonly totalCount = signal(0);
  readonly isLoading = signal(false);

  // ── Derivado ─────────────────────────────────────────────────────────────
  readonly extraActions = computed(() =>
    this.entity().kind === 'document'
      ? this.actionRegistry.resolveActions(
          (this.entity() as DocumentEntityConfig).extraActionIds ?? [],
        )
      : [],
  );

  // ── Ciclo de vida ────────────────────────────────────────────────────────
  constructor() {
    // Recargar cuando cambia la entidad (navegación entre entidades del mismo módulo)
    effect(() => {
      this.entity(); // suscripción
      this.loadList();
    });
  }

  // ── API pública ──────────────────────────────────────────────────────────
  loadList(): void {
    this.isLoading.set(true);
    const filters = this.filterStorage.read(this.entity());
    this.gateway
      .list(this.entity(), { filters })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((response) => {
        this.items.set(response.results);
        this.totalCount.set(response.count);
      });
  }
}
```

**Por qué hay una sola implementación y no dos como en el legacy**:

- Las diferencias entre `kind` son **datos**, no estructura: capacidades distintas, lógica de delete distinta. Todo eso vive en el `gateway` y las `capabilities`.
- El componente solo orquesta. Si una operación no aplica para un kind, el gateway lo declara y la UI lee de `entity.capabilities.canX`.

### 5.7 Strategy pattern para acciones extras (OCP)

El legacy hardcodeaba acciones extras (Generar, Recurrente) en `configuracionExtraDocumento[key].botones`, y las cargaba con `ViewContainerRef.createComponent()`. Esto rompía type-checking y mezclaba presentación con configuración.

**Nuestro enfoque**: cada acción extra es una **strategy** registrada con un id estable. La entidad declara qué strategies usa.

```ts
// libs/feature-base/src/lib/actions/entity-action.strategy.ts

/**
 * Estrategia que implementa una acción extra disponible desde la lista.
 * Cada strategy se registra una vez con un id; las entidades la declaran por id.
 */
export interface EntityActionStrategy {
  readonly id: string;
  readonly labelKey: string;
  readonly iconClass: string;
  readonly execute: (context: EntityActionContext) => Observable<EntityActionResult>;
}

export interface EntityActionContext {
  readonly entity: EntityConfig;
  readonly selectedIds: readonly (string | number)[];
}

export const ENTITY_ACTION_STRATEGY = new InjectionToken<EntityActionStrategy>(
  'EntityActionStrategy',
  {
    providedIn: 'root',
    factory: () => {
      throw new Error('No strategies registered');
    },
  },
);
```

Registro de una strategy concreta:

```ts
// apps/erp/src/app/features/compra/actions/generate-purchase-action.ts

export const generatePurchaseAction: EntityActionStrategy = {
  id: 'compra.generate-purchase',
  labelKey: 'modules.compra.actions.generate',
  iconClass: 'pi pi-cog',
  execute: ({ entity, selectedIds }) => {
    const service = inject(GeneratePurchaseService);
    return service.run(selectedIds);
  },
};
```

Provider:

```ts
{ provide: ENTITY_ACTION_STRATEGY, useValue: generatePurchaseAction, multi: true }
```

Uso desde el config de la entidad:

```ts
{
  kind: 'document',
  id: 'factura-compra',
  // ...
  extraActionIds: ['compra.generate-purchase'],
}
```

`EntityActionRegistry` colecta todas las strategies por su `id` y las resuelve cuando el componente las pide. Agregar una acción nueva = crear archivo + registrar provider. **Sin modificar el componente base**.

### 5.8 Persistencia de filtros versionada

```ts
// libs/feature-base/src/lib/storage/entity-filter-storage.service.ts

/**
 * Persiste filtros del usuario por entidad en localStorage.
 * La clave incluye schemaVersion para invalidar storage obsoleto automáticamente.
 */
@Injectable({ providedIn: 'root' })
export class EntityFilterStorageService {
  private buildKey(entity: EntityConfig): string {
    // 'compra:factura-compra:v3'
    return `${this.moduleIdOf(entity)}:${entity.id}:v${entity.schemaVersion}`;
  }

  read(entity: EntityConfig): readonly FilterCondition[] {
    const raw = localStorage.getItem(this.buildKey(entity));
    if (!raw) return [];
    try {
      const parsed: unknown = JSON.parse(raw);
      return this.validate(parsed);
    } catch {
      // Storage corrupto. Borrarlo y devolver vacío.
      localStorage.removeItem(this.buildKey(entity));
      return [];
    }
  }

  write(entity: EntityConfig, filters: readonly FilterCondition[]): void {
    localStorage.setItem(this.buildKey(entity), JSON.stringify(filters));
  }
}
```

**Por qué `schemaVersion` en la clave**: cuando una entidad cambia sus filtros disponibles, basta con incrementar `schemaVersion` en su config. El storage viejo queda huérfano (con su propia clave) y eventualmente se limpia. **Nunca se carga un filtro incompatible**.

---

## 6. Convenciones de naming

Reglas que aplican a todo el código del framework y de los features. Romperlas requiere justificación explícita en el PR.

### 6.1 General

| Categoría           | Convención                        | Ejemplo                                 |
| ------------------- | --------------------------------- | --------------------------------------- |
| Archivos            | `kebab-case`                      | `module-registry.service.ts`            |
| Clases / interfaces | `PascalCase`                      | `ModuleRegistryService`, `EntityConfig` |
| Constantes globales | `SCREAMING_SNAKE_CASE`            | `MODULE_REGISTRY`, `COMPRA_CONFIG`      |
| Funciones / métodos | `camelCase`, verbo primero        | `loadModule`, `setActiveEntity`         |
| Booleanos           | Prefijo `is`/`can`/`has`/`should` | `isLoading`, `canEdit`, `hasFilters`    |
| Signals             | Sin prefijo, snake o camel        | `currentEntity`, `items`                |
| Eventos / outputs   | Verbo en pasado                   | `entitySelected`, `actionExecuted`      |
| Inyección tokens    | `SCREAMING_SNAKE_CASE`            | `ENTITY_DATA_GATEWAY`                   |

### 6.2 Identificadores en el dominio

- Usa `id` (no `key`, `name`, `slug`) para identificadores estables que aparecen en URLs.
- `displayNameKey` para claves i18n. Nunca strings de UI literales en configs.
- Nombres en inglés en código y APIs. Strings de UI en español/inglés vía i18n.

### 6.3 Anti-naming (prohibido)

- `data: any`, `params: any` → usa `unknown` + parseo, o tipa correctamente.
- `obj.modeloCofig` (typo del legacy) → revisar antes de commitear, nunca normalizar errores.
- `arrItems`, `objConfig` → notación húngara. Prohibido.
- `_modelo`, `_tipo` (underscore prefix para "privado pero accesible") → privado real con `private`, o público con nombre limpio.
- Funciones que devuelven `any` o `Promise<any>`.

---

## 7. Estructura por módulo

```
apps/erp/src/app/features/<id>/
├── <id>.routes.ts              · rutas + resolvers
├── <id>.config.ts              · ModuleConfig exportado (la única "constante de módulo")
├── entities/                    · solo si una entidad tiene UI custom
│   └── factura/
│       ├── factura-extra-fields.component.ts
│       └── factura-detail-overrides.component.ts
├── actions/                     · strategies del módulo
│   ├── generate-purchase.action.ts
│   └── index.ts                 · provider() para registrar todas
├── services/                    · servicios HTTP específicos del módulo
└── i18n/                        · traducciones del módulo
    ├── compra.es.ts
    └── compra.en.ts
```

### 7.1 Cómo agregar un módulo nuevo (ejemplo: `cartera`)

1. **Crear el config**: `apps/erp/src/app/features/cartera/cartera.config.ts`

   ```ts
   export const CARTERA_CONFIG: ModuleConfig = {
     id: 'cartera',
     displayNameKey: 'modules.cartera.name',
     iconClass: 'pi pi-wallet',
     entities: [
       {
         kind: 'document',
         id: 'recibo-caja',
         displayNameKey: 'modules.cartera.entities.recibo.name',
         endpoint: '/api/documento',
         documentTypeId: 400,
         inventoryEffect: 'inflow',
         schemaVersion: 1,
         filters: RECEIPT_FILTERS,
         routes: {
           list: 'documento/recibo-caja/list',
           new: 'documento/recibo-caja/new',
           edit: 'documento/recibo-caja/edit',
           detail: 'documento/recibo-caja/detail',
         },
         capabilities: {
           canCreate: true,
           canEdit: true,
           canDelete: true,
           canSelectRows: true,
           canImport: false,
           canExportExcel: true,
           canExportZip: false,
           canGenerate: false,
         },
       },
       // ...
     ],
   };
   ```

2. **Crear las rutas**: `apps/erp/src/app/features/cartera/cartera.routes.ts` (idéntico al ejemplo §5.4 con `'cartera'`).

3. **Registrar en `MODULE_REGISTRY`**: una línea en `libs/core/src/lib/module-config/module-registry.ts`.

4. **Cablear al router principal**:

   ```ts
   { path: 'cartera', loadChildren: () => import('@erp/features/cartera/cartera.routes').then(m => m.CARTERA_ROUTES) }
   ```

5. **Si necesita acciones custom**: crear `actions/<action>.ts` y registrar el provider en `cartera.providers.ts` (cargado por el routing del módulo).

Sidebar, permisos, breadcrumbs, deep links: todo se deriva del config. No se toca nada más.

---

## 8. Manejo de errores y casos límite

### 8.1 Errores tipados

Definir clases de error específicas, nunca lanzar `new Error('mensaje')` genérico:

```ts
export class UnknownModuleError extends Error {
  constructor(readonly moduleId: string) {
    super(`Module '${moduleId}' is not registered in MODULE_REGISTRY.`);
    this.name = 'UnknownModuleError';
  }
}

export class EntityNotFoundError extends Error {
  constructor(
    readonly moduleId: string,
    readonly entityId: string,
  ) {
    super(`Entity '${entityId}' not found in module '${moduleId}'.`);
    this.name = 'EntityNotFoundError';
  }
}

export class EntityKindMismatchError extends Error {
  /* ... */
}
export class ConfigMismatchError extends Error {
  /* ... */
}
export class DuplicateEntityIdError extends Error {
  /* ... */
}
export class MissingModuleContextError extends Error {
  /* ... */
}
```

### 8.2 Boundary de errores en el router

Un guard catch-all que maneja errores de resolvers y redirige al fallback adecuado (404 del módulo, mensaje al usuario):

```ts
// libs/core/src/lib/module-config/error-handling/config-error.handler.ts

@Injectable({ providedIn: 'root' })
export class ConfigErrorHandler implements ErrorHandler {
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  handleError(error: unknown): void {
    if (error instanceof UnknownModuleError || error instanceof EntityNotFoundError) {
      this.toast.error('Recurso no encontrado', error.message);
      this.router.navigate(['/not-found']);
      return;
    }
    // Otros errores: delegar al ErrorHandler global
    console.error(error);
  }
}
```

### 8.3 Validación de configs en build

Implementar un script Nx target `validate-configs` que:

- Importa todas las configs registradas.
- Verifica que `documentTypeId` sea único across módulos.
- Verifica que cada `extraActionIds` referenciado exista en algún archivo de strategy.
- Verifica que las claves i18n existan en los diccionarios.

Corre en pre-commit y en CI.

---

## 9. Estrategia de testing

### 9.1 Cobertura mínima por capa

| Capa                         | Tipo de test                     | Cobertura objetivo                 |
| ---------------------------- | -------------------------------- | ---------------------------------- |
| Tipos (compile-time)         | `tsc --strict`                   | 100% (forzado)                     |
| `ModuleRegistryService`      | Unit                             | 100%                               |
| `ModuleNavigationStore`      | Unit                             | 100%                               |
| Resolvers                    | Unit + integration               | 100% paths felices + errores       |
| `HttpEntityDataGateway`      | Unit con `HttpTestingController` | 100% de métodos                    |
| `EntityFilterStorageService` | Unit                             | 100% (incluye corruption recovery) |
| `BaseListComponent`          | Component test con gateway fake  | flujos principales                 |
| Actions strategies           | Unit                             | 100% del `execute`                 |
| Module configs               | Validation script                | 100% en CI                         |

### 9.2 Fakes en lugar de mocks

Para `EntityDataGateway` y similares, mantenemos una implementación **en memoria** real en `libs/feature-base/testing/`:

```ts
export class InMemoryEntityDataGateway implements EntityDataGateway {
  private store = new Map<string, unknown[]>();
  // implementación real con datos en memoria
}
```

Usar fakes (no mocks `jest.fn()`) hace los tests más legibles y permite probar interacciones reales.

---

## 10. Trade-offs aceptados

### Ganamos

- **Onboarding de módulo nuevo**: 1 archivo de config + 1 de rutas + 1 entrada en el registry.
- **Type-safety end-to-end**: cero `any`. Refactors con confianza total.
- **Lazy load real**: el bundle del módulo activo se descarga solo cuando se necesita.
- **Una sola implementación** de filtros, paginación, exportación, importación, eliminación.
- **Sidebar y breadcrumbs** derivados del registry — un solo origen de verdad.
- **Strategies para acciones custom**: extensibilidad sin tocar el componente base.
- **DIP**: tests sin red, sin levantar HttpClient mock global.

### Pagamos

- **Indirección**: para entender `/compra/documento/factura-compra/list` hay que leer el routing del módulo + el config de la entidad + el componente base. Costo cognitivo real.
- **Curva de aprendizaje**: ~2-3 días para un dev nuevo internalizar el patrón.
- **Foundation upfront**: tipos + registry + servicios + resolvers + gateway + componentes base = ~5-7 archivos antes del primer feature útil.
- **Escape hatches necesarios**: cuando una entidad necesita UI única (un campo custom en el detalle), se inyecta vía slot `<ng-content select="[extra-fields]">` o se compone con un `entities/<id>/<id>-overrides.component.ts`. No es magia.

### Cuándo **no** usar el framework

Algunas features no son CRUD estándar y deben quedarse como features tradicionales:

- **`contenedores`** — selección de tenant pre-workspace.
- **`dashboard`** — KPIs, gráficos, vistas custom.
- **Settings de usuario** — formularios únicos por sección.
- **Wizards, builders, configuradores** — flujos no-CRUD.

Esto no es un workaround: son casos legítimamente distintos. Forzarlos al framework introduciría complejidad sin beneficio.

---

## 11. Plan de implementación

| Fase | Alcance                                                                    | Entregable                                     |
| ---- | -------------------------------------------------------------------------- | ---------------------------------------------- |
| 1    | **Foundation tipos + registry + servicios**                                | `libs/core/module-config/` listo y testeado    |
| 2    | **Resolvers + gateway HTTP default**                                       | Resolución de rutas + acceso a datos abstracto |
| 3    | **Smoke test**: módulo `general` con 1 master simple, sin componentes base | Validar el flujo end-to-end                    |
| 4    | **`BaseListComponent`** con paginación, filtros, exportación               | Listado funcional para masters                 |
| 5    | **`BaseFormComponent` + `BaseDetailComponent`**                            | CRUD completo                                  |
| 6    | **Sistema de strategies** + primera acción extra                           | Extensibilidad validada                        |
| 7    | **Sidebar dinámico** derivado del registry                                 | UX final                                       |
| 8    | **Migración**: implementar módulos uno por uno                             | Producto en producción                         |

`contenedores` no migra — se queda como feature tradicional.

---

## 12. Decisiones tomadas

Resoluciones a los puntos que el documento v1.0 dejó pendientes.

### 12.1 Ubicación de los componentes base

**Decisión: nueva librería Nx `libs/feature-base/`**.

Justificación: estos componentes tienen dependencias propias (router, http, config store, gateway, action registry) que no aplican al resto de `libs/ui`. Separarlos:

- Permite testear el framework configuracional independientemente.
- Hace explícito el límite entre "componentes de presentación" (`libs/ui`) y "componentes de feature genéricos" (`libs/feature-base`).
- Acepta lazy-loading limpio por feature sin arrastrar UI no usada.

### 12.2 Granularidad de i18n

**Decisión: por módulo, con namespace embebido por entidad**.

Estructura:

```ts
// modules.cartera.entities.recibo.name = 'Recibo de caja'
// modules.cartera.entities.recibo.list.title = 'Recibos'
// modules.cartera.actions.print = 'Imprimir'
```

Justificación:

- Cada módulo es un dominio léxico cohesivo; "Factura" en compra ≠ "Factura" en venta.
- El reuso real entre entidades dentro de un módulo es alto; entre módulos es bajo.
- Diccionarios por módulo permiten lazy load de traducciones junto con el código.

Las claves comunes (botones "Guardar", "Cancelar") viven en `common.*`.

### 12.3 Sistema de permisos

**Decisión: dos niveles — por ruta (acceso) y por capacidad (UI)**.

- **Acceso al módulo/entidad**: guards de Angular leen el rol del usuario contra una matriz `module → entity → role`. Bloquea la ruta entera.
- **Capacidades dentro de la UI**: el componente base lee `entity.capabilities.canCreate` Y consulta `PermissionsService.can('compra.factura.create')`. Solo muestra el botón si **ambos** son true.

La capacidad de la entidad declara **qué es técnicamente posible**. El servicio de permisos declara **qué le es permitido al usuario actual**.

Implementación inicial: `PermissionsService` con un signal estático cargado en el `provideAppInitializer`. Cuando el backend tenga API de permisos granulares, solo cambia la fuente — el contrato del servicio no.

### 12.4 Vistas alternativas (kanban, calendar, etc.)

**Decisión: no soportar inicialmente, pero reservar el hook**.

`EntityConfig` no incluye `viewType` ahora. Cuando emerja la necesidad real:

1. Agregar `readonly defaultView: 'list' | 'kanban' | 'calendar'` con default `'list'`.
2. Crear `BaseKanbanComponent`/`BaseCalendarComponent` en `libs/feature-base/`.
3. El router cargará el componente correspondiente según `entity.defaultView`.

No agregamos complejidad upfront. La forma del config y los resolvers ya soportan la extensión sin breaking changes.

---

## 13. Referencias

### Legacy estudiado

- `/home/tamerlan/Desktop/semantica/app.reddoc/` — Angular 17
  - `src/app/modules/compra/domain/constantes/configuracion.constant.ts` — config del módulo compra
  - `src/app/comun/services/application/config-modulo.service.ts` — service legacy
  - `src/app/comun/componentes/base-documento/base-lista/base-lista.component.ts` — base list documentos
  - `src/app/comun/componentes/base-administracion/base-lista/base-lista.component.ts` — base list masters

### Nuevo

- `/home/tamerlan/Desktop/reddoc-monorepo/`
  - `apps/erp/` — aplicación destino
  - `libs/core/` — librería compartida donde vivirá `module-config/`
  - `libs/ui/` — componentes de presentación
  - `libs/feature-base/` — **nueva librería** que albergará los componentes base configuracionales

### Conceptos

- **SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
- **Strategy pattern**: Gamma et al., "Design Patterns"
- **Configuration-driven architecture**: variante de "Data-Driven UI"
- **Discriminated unions en TS**: handbook oficial — narrowing por propiedad común
