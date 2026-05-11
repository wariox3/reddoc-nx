import type { EntityKind } from '../types/entity-config.types';

/**
 * Errores tipados del framework de configuración de módulos.
 *
 * Convención: nunca lanzar `new Error('mensaje')`. Estas clases permiten
 * que el ErrorHandler global identifique el tipo y reaccione apropiadamente
 * (toast, redirect a 404, etc.).
 */

/** El id de módulo solicitado no existe en el `MODULE_REGISTRY` inyectado. */
export class UnknownModuleError extends Error {
  constructor(readonly moduleId: string) {
    super(`Module '${moduleId}' is not registered in MODULE_REGISTRY.`);
    this.name = 'UnknownModuleError';
  }
}

/** La constante del módulo declara un `id` que no coincide con la clave del registry. */
export class ConfigMismatchError extends Error {
  constructor(
    readonly expectedId: string,
    readonly actualId: string,
  ) {
    super(
      `Module config id mismatch: registry key is '${expectedId}' but the loaded config declares id='${actualId}'.`,
    );
    this.name = 'ConfigMismatchError';
  }
}

/** Dos entidades dentro del mismo módulo declaran el mismo `id`. */
export class DuplicateEntityIdError extends Error {
  constructor(
    readonly moduleId: string,
    readonly duplicateIds: readonly string[],
  ) {
    super(`Module '${moduleId}' has duplicate entity ids: ${duplicateIds.join(', ')}.`);
    this.name = 'DuplicateEntityIdError';
  }
}

/** Se intentó resolver una entidad pero el módulo activo no está cargado. */
export class MissingModuleContextError extends Error {
  constructor() {
    super(
      'Cannot resolve entity: no active module in ModuleNavigationStore. Make sure the parent route declares `activeModuleResolver`.',
    );
    this.name = 'MissingModuleContextError';
  }
}

/** La ruta no proporciona el parámetro `entityKey`. */
export class MissingEntityKeyError extends Error {
  constructor() {
    super('Cannot resolve entity: route is missing `:entityKey` param.');
    this.name = 'MissingEntityKeyError';
  }
}

/** La entidad solicitada no existe dentro del módulo activo. */
export class EntityNotFoundError extends Error {
  constructor(
    readonly moduleId: string,
    readonly entityId: string,
  ) {
    super(`Entity '${entityId}' not found in module '${moduleId}'.`);
    this.name = 'EntityNotFoundError';
  }
}

/** La entidad existe pero su `kind` no coincide con el esperado por la ruta. */
export class EntityKindMismatchError extends Error {
  constructor(
    readonly entityId: string,
    readonly expectedKind: EntityKind,
    readonly actualKind: EntityKind,
  ) {
    super(`Entity '${entityId}' is of kind '${actualKind}' but route expected '${expectedKind}'.`);
    this.name = 'EntityKindMismatchError';
  }
}
