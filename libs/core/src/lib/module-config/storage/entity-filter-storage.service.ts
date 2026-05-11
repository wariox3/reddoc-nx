import { Injectable } from '@angular/core';
import type { FilterCondition } from '../data/list-query.types';
import type { EntityConfig } from '../types/entity-config.types';

/**
 * Persistencia de filtros del usuario por entidad en `localStorage`.
 *
 * La clave incluye `schemaVersion` para invalidar storage obsoleto cuando
 * la entidad cambia sus filtros disponibles. Solo basta con incrementar
 * `schemaVersion` en el config — los filtros antiguos quedan huérfanos
 * con su propia clave y se descartan automáticamente.
 *
 * Las entidades de tipo `utility` no se filtran y este service las ignora
 * silenciosamente.
 *
 * Si el `localStorage` no está disponible (SSR) o el JSON está corrupto,
 * los métodos devuelven el comportamiento seguro (lista vacía) sin lanzar.
 */
@Injectable({ providedIn: 'root' })
export class EntityFilterStorageService {
  /**
   * Lee los filtros guardados para la entidad indicada dentro del módulo.
   * Devuelve lista vacía si no hay nada guardado, si el JSON es inválido,
   * o si la entidad es de tipo `utility`.
   */
  read(moduleId: string, entity: EntityConfig): readonly FilterCondition[] {
    const key = this.buildKey(moduleId, entity);
    if (!key || !this.isStorageAvailable()) return [];

    const raw = localStorage.getItem(key);
    if (!raw) return [];

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        this.clearCorrupted(key);
        return [];
      }
      return parsed as FilterCondition[];
    } catch {
      this.clearCorrupted(key);
      return [];
    }
  }

  /**
   * Escribe los filtros activos en localStorage.
   * Si la entidad es `utility` o el storage no está disponible, no hace nada.
   */
  write(moduleId: string, entity: EntityConfig, filters: readonly FilterCondition[]): void {
    const key = this.buildKey(moduleId, entity);
    if (!key || !this.isStorageAvailable()) return;
    localStorage.setItem(key, JSON.stringify(filters));
  }

  /** Elimina los filtros guardados de la entidad. */
  clear(moduleId: string, entity: EntityConfig): void {
    const key = this.buildKey(moduleId, entity);
    if (!key || !this.isStorageAvailable()) return;
    localStorage.removeItem(key);
  }

  /**
   * Construye la clave de localStorage para la entidad.
   *
   * Formato: `entity-filters:<moduleId>:<entityId>:v<schemaVersion>`.
   * El prefijo `entity-filters` permite limpiar masivamente todos los
   * filtros del ERP sin afectar otras claves de la app.
   *
   * Devuelve `null` para entidades `utility` (no filtrables).
   */
  private buildKey(moduleId: string, entity: EntityConfig): string | null {
    if (entity.kind === 'utility') return null;
    return `entity-filters:${moduleId}:${entity.id}:v${entity.schemaVersion}`;
  }

  private isStorageAvailable(): boolean {
    return typeof localStorage !== 'undefined';
  }

  private clearCorrupted(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Si tampoco podemos limpiar, no hay más que hacer.
    }
  }
}
