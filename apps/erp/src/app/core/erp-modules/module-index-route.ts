import type { Route } from '@angular/router';
import type { ErpModuleDescriptor } from './erp-module.types';

/** Error de configuración de un descriptor de módulo del ERP. */
export class ModuleDescriptorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModuleDescriptorError';
  }
}

/**
 * Construye la ruta índice (`''`) de un módulo: redirige `/t/:slug/<id>` hacia el
 * `defaultChildPath` declarado en su `ErpModuleDescriptor`.
 *
 * Así el descriptor es la **única fuente de verdad** del landing del módulo, en
 * lugar de duplicar el destino (y arriesgar que diverja) con un `redirectTo`
 * hardcodeado en cada `<modulo>.routes.ts`. Cambiar a dónde abre un módulo es,
 * desde ahora, editar solo su descriptor.
 *
 * Aplica a módulos con landing. Los módulos sin contenido todavía
 * (`defaultChildPath: null`, p. ej. Inventario) montan su placeholder y no usan
 * este helper.
 *
 * @throws {ModuleDescriptorError} si el descriptor no define `defaultChildPath`.
 */
export function moduleIndexRoute(descriptor: ErpModuleDescriptor): Route {
  const target = descriptor.defaultChildPath;
  if (target === null) {
    throw new ModuleDescriptorError(
      `El módulo "${descriptor.id}" no define defaultChildPath; no se puede construir su ruta índice.`,
    );
  }
  return { path: '', pathMatch: 'full', redirectTo: target };
}
