/**
 * Errores tipados del framework de configuración de módulos.
 *
 * Convención: nunca lanzar `new Error('mensaje')` genérico. Estas clases
 * permiten que el `ErrorHandler` global identifique el tipo y reaccione
 * apropiadamente (toast, redirect a 404, etc.).
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

/** Dos documentos dentro del mismo módulo declaran el mismo `id`. */
export class DuplicateDocumentIdError extends Error {
  constructor(
    readonly moduleId: string,
    readonly duplicateIds: readonly string[],
  ) {
    super(`Module '${moduleId}' has duplicate document ids: ${duplicateIds.join(', ')}.`);
    this.name = 'DuplicateDocumentIdError';
  }
}

/** Se intentó resolver un documento pero el módulo activo no está cargado. */
export class MissingModuleContextError extends Error {
  constructor() {
    super(
      'Cannot resolve document: no active module in ModuleNavigationStore. Make sure the parent route declares `activeModuleResolver`.',
    );
    this.name = 'MissingModuleContextError';
  }
}

/** La ruta no proporciona el parámetro `documentKey`. */
export class MissingDocumentKeyError extends Error {
  constructor() {
    super('Cannot resolve document: route is missing `:documentKey` param.');
    this.name = 'MissingDocumentKeyError';
  }
}

/** El documento solicitado no existe dentro del módulo activo. */
export class DocumentNotFoundError extends Error {
  constructor(
    readonly moduleId: string,
    readonly documentId: string,
  ) {
    super(`Document '${documentId}' not found in module '${moduleId}'.`);
    this.name = 'DocumentNotFoundError';
  }
}
