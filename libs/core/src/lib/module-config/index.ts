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

// Registry token
export { MODULE_REGISTRY } from './module-registry.token';
export type { ModuleConfigLoader, ModuleRegistry } from './module-registry.token';

// Services
export { ModuleRegistryService } from './services/module-registry.service';
export { ModuleNavigationStore } from './services/module-navigation.store';

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
