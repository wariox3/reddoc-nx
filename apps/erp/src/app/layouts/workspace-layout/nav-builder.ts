import type { EntityConfig, EntityKind, ModuleConfig } from '@reddoc/core';

/**
 * Item navegable de hoja del sidebar — corresponde a una entidad concreta
 * (lista de contactos, lista de facturas, etc.).
 */
export interface NavLeafItem {
  readonly entityId: string;
  /** Clave i18n del label visible. El componente la traduce al renderizar. */
  readonly displayNameKey: string;
  /** Ruta absoluta navegable (incluye `/t/:slug/<modulo>/...`). */
  readonly path: string;
}

/**
 * Sub-sección de un módulo que agrupa entidades por su `kind`.
 * Ej: dentro de "General", el grupo `master` agrupa Contacto, Item, etc.
 */
export interface NavGroup {
  readonly kind: EntityKind;
  readonly items: readonly NavLeafItem[];
}

/**
 * Acordeón de un módulo en el sidebar. Se renderiza uno por cada `ModuleConfig`
 * del registry, en el orden en que vienen.
 */
export interface NavSection {
  readonly moduleId: string;
  /** Clave i18n del nombre del módulo. */
  readonly displayNameKey: string;
  readonly iconClass: string;
  readonly groups: readonly NavGroup[];
}

/**
 * Orden estable en que se renderizan los grupos de entidades dentro de cada
 * acordeón de módulo. Garantiza UX consistente entre módulos.
 */
export const ENTITY_NAV_GROUP_ORDER: readonly EntityKind[] = ['master', 'document', 'utility'];

/**
 * Construye la estructura de navegación del sidebar a partir de los módulos
 * registrados y el slug del tenant activo.
 *
 * - Filtra entidades de tipo `utility` que no tienen rutas list (no aplica al sidebar lateral).
 * - Agrupa por `kind` siguiendo `ENTITY_NAV_GROUP_ORDER`.
 * - Omite grupos vacíos para no renderizar headers sin items.
 *
 * Función pura: facilita testing sin Angular harness.
 */
export function buildNavSections(
  modules: readonly ModuleConfig[],
  tenantSlug: string,
): readonly NavSection[] {
  return modules.map((moduleConfig) => buildModuleSection(moduleConfig, tenantSlug));
}

function buildModuleSection(moduleConfig: ModuleConfig, tenantSlug: string): NavSection {
  const groups = ENTITY_NAV_GROUP_ORDER.map((kind) =>
    buildGroup(moduleConfig, kind, tenantSlug),
  ).filter((group): group is NavGroup => group.items.length > 0);

  return {
    moduleId: moduleConfig.id,
    displayNameKey: moduleConfig.displayNameKey,
    iconClass: moduleConfig.iconClass,
    groups,
  };
}

function buildGroup(moduleConfig: ModuleConfig, kind: EntityKind, tenantSlug: string): NavGroup {
  const items = moduleConfig.entities
    .filter((entity) => entity.kind === kind)
    .map((entity) => buildLeafItem(entity, moduleConfig.id, tenantSlug));

  return { kind, items };
}

function buildLeafItem(entity: EntityConfig, moduleId: string, tenantSlug: string): NavLeafItem {
  const path =
    entity.kind === 'utility'
      ? `/t/${tenantSlug}/${moduleId}/utility/${entity.id}`
      : `/t/${tenantSlug}/${moduleId}/${entity.routes.list}`;

  return {
    entityId: entity.id,
    displayNameKey: entity.displayNameKey,
    path,
  };
}
