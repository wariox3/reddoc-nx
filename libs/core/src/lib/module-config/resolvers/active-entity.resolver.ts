import { inject } from '@angular/core';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import {
  EntityKindMismatchError,
  EntityNotFoundError,
  MissingEntityKeyError,
  MissingModuleContextError,
} from '../errors/config.errors';
import { ModuleNavigationStore } from '../services/module-navigation.store';
import type { EntityConfig, EntityKind } from '../types/entity-config.types';

/**
 * Nombre del parámetro de ruta que identifica la entidad activa.
 * Centralizado en una constante para evitar typos en `route.paramMap.get(...)`.
 */
export const ENTITY_KEY_ROUTE_PARAM = 'entityKey';

/**
 * Crea un resolver que valida y resuelve la entidad activa dentro del módulo
 * activo, según el parámetro `:entityKey` de la ruta.
 *
 * Garantías:
 *  - El módulo ya está cargado (el resolver del padre debió correr antes).
 *  - La entidad existe en el módulo.
 *  - El `kind` de la entidad coincide con el esperado por la ruta.
 *
 * Si cualquiera de estas condiciones falla, lanza un error tipado.
 *
 * Uso:
 *   ```ts
 *   {
 *     path: 'master/:entityKey',
 *     resolve: { entity: activeEntityResolver('master') },
 *     children: [...]
 *   }
 *   ```
 */
export function activeEntityResolver(expectedKind: EntityKind): ResolveFn<EntityConfig> {
  return (route: ActivatedRouteSnapshot): EntityConfig => {
    const navigationStore = inject(ModuleNavigationStore);
    const entityId = route.paramMap.get(ENTITY_KEY_ROUTE_PARAM);
    const activeModule = navigationStore.activeModule();

    if (!activeModule) throw new MissingModuleContextError();
    if (!entityId) throw new MissingEntityKeyError();

    const entity = activeModule.entities.find((candidate) => candidate.id === entityId);
    if (!entity) throw new EntityNotFoundError(activeModule.id, entityId);
    if (entity.kind !== expectedKind) {
      throw new EntityKindMismatchError(entityId, expectedKind, entity.kind);
    }

    navigationStore.setActiveEntity(entity);
    return entity;
  };
}
