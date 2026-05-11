import { Injectable, computed, signal } from '@angular/core';
import type { EntityConfig } from '../types/entity-config.types';
import type { ModuleConfig } from '../types/module-config.types';

/**
 * Mantiene el módulo y la entidad activos según la ruta actual.
 *
 * Los resolvers de ruta escriben aquí; los componentes leen vía signals.
 * Toda la lectura es síncrona — sin observables, sin race conditions.
 *
 * SRP: este store no carga configs (eso lo hace `ModuleRegistryService`).
 * Solo expone el estado actual de la navegación.
 */
@Injectable({ providedIn: 'root' })
export class ModuleNavigationStore {
  private readonly _activeModule = signal<ModuleConfig | null>(null);
  private readonly _activeEntity = signal<EntityConfig | null>(null);

  readonly activeModule = this._activeModule.asReadonly();
  readonly activeEntity = this._activeEntity.asReadonly();

  /**
   * Filtros disponibles para la entidad activa.
   * Vacío si no hay entidad o si la entidad es de tipo `utility` (no filtrable).
   */
  readonly availableFilters = computed(() => {
    const entity = this._activeEntity();
    if (entity === null || entity.kind === 'utility') return [];
    return entity.filters;
  });

  /** True si la entidad activa es un documento transaccional. */
  readonly isDocumentEntity = computed(() => this._activeEntity()?.kind === 'document');

  /** True si la entidad activa es un master. */
  readonly isMasterEntity = computed(() => this._activeEntity()?.kind === 'master');

  setActiveModule(config: ModuleConfig | null): void {
    this._activeModule.set(config);
  }

  setActiveEntity(config: EntityConfig | null): void {
    this._activeEntity.set(config);
  }
}
