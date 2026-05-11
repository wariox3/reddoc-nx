// Types
export type {
  EntityConfig,
  EntityKind,
  EntityRoutes,
  DocumentEntityConfig,
  DocumentCapabilities,
  MasterEntityConfig,
  MasterCapabilities,
  UtilityEntityConfig,
  InventoryEffect,
  ImportDescriptor,
} from './types/entity-config.types';
export type { ModuleConfig } from './types/module-config.types';
export type { FilterField, FilterFieldType } from './types/filter-field.types';
export type { ColumnDef, ColumnValueType, ColumnAlignment } from './types/column-def.types';

// Registry token
export { MODULE_REGISTRY } from './module-registry.token';
export type { ModuleConfigLoader, ModuleRegistry } from './module-registry.token';

// Services
export { ModuleRegistryService } from './services/module-registry.service';
export { ModuleNavigationStore } from './services/module-navigation.store';

// Storage
export { EntityFilterStorageService } from './storage/entity-filter-storage.service';

// Resolvers
export { activeModuleResolver } from './resolvers/active-module.resolver';
export { activeEntityResolver, ENTITY_KEY_ROUTE_PARAM } from './resolvers/active-entity.resolver';

// Data gateway
export { ENTITY_DATA_GATEWAY } from './data/entity-data-gateway';
export type { EntityDataGateway } from './data/entity-data-gateway';
export { HttpEntityDataGateway } from './data/http-entity-data-gateway.service';
export type {
  FilterCondition,
  FilterOperator,
  ListQuery,
  ListResponse,
  SortDirection,
  SortSpec,
} from './data/list-query.types';

// Errors
export {
  UnknownModuleError,
  ConfigMismatchError,
  DuplicateEntityIdError,
  MissingModuleContextError,
  MissingEntityKeyError,
  EntityNotFoundError,
  EntityKindMismatchError,
} from './errors/config.errors';
