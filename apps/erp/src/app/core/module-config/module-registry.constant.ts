import type { ModuleRegistry } from '@reddoc/core';

/**
 * Registro central de módulos del ERP.
 *
 * Para agregar un módulo nuevo:
 *   1. Crear `apps/erp/src/app/features/<id>/<id>.config.ts` que exporte
 *      una constante `<ID>_CONFIG: ModuleConfig`.
 *   2. Agregar una entrada aquí. Cero modificaciones a otros archivos del framework.
 *   3. Registrar la ruta lazy en `app.routes.ts`.
 *
 * Para quitar un módulo:
 *   1. Eliminar la entrada de aquí.
 *   2. Borrar la carpeta del feature en `features/`.
 *   3. Quitar la ruta lazy de `app.routes.ts`.
 *
 * El sidebar se actualiza automáticamente porque deriva su contenido de este registro.
 */
export const ERP_MODULE_REGISTRY = {
  general: () => import('../../features/general/general.config').then((m) => m.GENERAL_CONFIG),
} as const satisfies ModuleRegistry;

/**
 * Tipo derivado del registry. Garantiza que ningún string huérfano
 * pueda referenciar un módulo inexistente desde código tipado.
 */
export type ErpModuleId = keyof typeof ERP_MODULE_REGISTRY;
