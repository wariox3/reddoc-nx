import type { ModuleRegistry } from '@reddoc/core';

/**
 * Registro central de módulos con **documentos transaccionales** del framework
 * configuracional (camino A del enfoque híbrido — ver docs/architecture).
 *
 * **Solo aplica a documentos** sobre el endpoint genérico `/api/documento`.
 * Los masters administrativos (contactos, ítems, sedes, etc.) NO entran aquí:
 * son features directos (camino B) que declaran su menú en
 * `apps/erp/src/app/layouts/sidebar/sidebar-menu.ts`.
 *
 * Para agregar un módulo con documentos:
 *   1. Crear `apps/erp/src/app/features/<id>/<id>.config.ts` que exporte
 *      una constante `<ID>_CONFIG: ModuleConfig` con sus documentos.
 *   2. Agregar una entrada aquí — cero modificaciones a otros archivos.
 *   3. Registrar la ruta lazy en `app.routes.ts`.
 *   4. El sidebar mostrará automáticamente el acordeón con los documentos.
 *
 * Vacío hoy: ningún módulo transaccional implementado todavía.
 */
export const ERP_MODULE_REGISTRY = {
  // compra:     () => import('../../features/compra/compra.config').then((m) => m.COMPRA_CONFIG),
  // venta:      () => import('../../features/venta/venta.config').then((m) => m.VENTA_CONFIG),
} as const satisfies ModuleRegistry;

/**
 * Tipo derivado del registry. Garantiza que ningún string huérfano
 * pueda referenciar un módulo inexistente desde código tipado.
 */
export type ErpModuleId = keyof typeof ERP_MODULE_REGISTRY;
