import type { EntityConfig } from './entity-config.types';

/**
 * Configuración completa de un módulo de negocio del ERP.
 *
 * Cada módulo (compra, venta, inventario, etc.) exporta una constante de este tipo
 * desde `apps/erp/src/app/features/<id>/<id>.config.ts`.
 *
 * El sidebar, los breadcrumbs y los resolvers de rutas derivan toda su información
 * de esta estructura. Es la única fuente de verdad del módulo a nivel UI.
 */
export interface ModuleConfig {
  /** Identificador estable del módulo. Aparece en URLs y como key del registry. */
  readonly id: string;
  /** Clave i18n del nombre visible. Ej: 'modules.general.name'. */
  readonly displayNameKey: string;
  /** Clase PrimeIcon usada en el menú. Ej: 'pi pi-cog'. */
  readonly iconClass: string;
  /** Entidades del módulo. El sidebar las agrupa por `kind`. */
  readonly entities: readonly EntityConfig[];
}
