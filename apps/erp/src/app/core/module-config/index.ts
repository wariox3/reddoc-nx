/**
 * Framework configuracional de módulos del ERP (camino A — ver
 * `docs/architecture/erp-module-architecture.md`).
 *
 * Aplica solo a **documentos transaccionales** sobre el endpoint genérico
 * `/api/documento`. Los masters administrativos viven como features
 * directos en `apps/erp/src/app/features/<modulo>/` y NO usan este módulo.
 *
 * Aquí viven:
 *  - Tipos: `DocumentEntityConfig`, `ModuleConfig`, etc.
 *  - Registry: token `MODULE_REGISTRY` + service `ModuleRegistryService`.
 *  - Estado: `ModuleNavigationStore` (signals del módulo/documento activos).
 *  - Resolvers: `activeModuleResolver`, `activeDocumentResolver`.
 *  - Acceso a datos: `EntityDataGateway` + `HttpEntityDataGateway`.
 *  - Componente base: `BaseDocumentListComponent`.
 *  - Errores tipados del dominio.
 *
 * Los building blocks genéricos (tabla tonta, tipos de columna, query
 * serialization, filter storage) viven en `@reddoc/core` porque son
 * agnósticos del ERP.
 */

// Types
export type {
  EntityConfig,
  EntityKind,
  EntityRoutes,
  DocumentEntityConfig,
  DocumentCapabilities,
  InventoryEffect,
  ImportDescriptor,
} from './types/entity-config.types';
export type { ModuleConfig } from './types/module-config.types';

// Registry
export { MODULE_REGISTRY } from './module-registry.token';
export type { ModuleConfigLoader, ModuleRegistry } from './module-registry.token';
export { ERP_MODULE_REGISTRY } from './module-registry.constant';
export type { ErpModuleId } from './module-registry.constant';
export { ModuleRegistryService } from './module-registry.service';

// Navigation store
export { ModuleNavigationStore } from './module-navigation.store';

// Resolvers
export { activeModuleResolver } from './resolvers/active-module.resolver';
export {
  activeDocumentResolver,
  DOCUMENT_KEY_ROUTE_PARAM,
} from './resolvers/active-document.resolver';

// Data gateway
export { ENTITY_DATA_GATEWAY } from './data/entity-data-gateway';
export type { EntityDataGateway } from './data/entity-data-gateway';
export { HttpEntityDataGateway } from './data/http-entity-data-gateway.service';

// Storage helper
export { buildEntityStorageKey } from './storage/build-entity-storage-key';

// Components
// NOTA: BaseDocumentListComponent NO se exporta desde aquí para evitar que
// PrimeNG entre en el bundle inicial. Los consumidores deben usar:
//   loadComponent: () => import('@erp/core/module-config/components/base-document-list/base-document-list.component')
//     .then(m => m.BaseDocumentListComponent)

// Errors
export {
  UnknownModuleError,
  ConfigMismatchError,
  DuplicateDocumentIdError,
  MissingModuleContextError,
  MissingDocumentKeyError,
  DocumentNotFoundError,
} from './errors/config.errors';
