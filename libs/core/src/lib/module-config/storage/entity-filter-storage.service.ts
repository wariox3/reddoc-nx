import { Injectable } from '@angular/core';
import type { FilterCondition } from '../data/list-query.types';
import type { EntityConfig } from '../types/entity-config.types';

/** Prefijo común de todas las claves de localStorage gestionadas por este servicio. */
const STORAGE_KEY_PREFIX = 'entity-filters';

/**
 * Construye la clave canónica de localStorage para una entidad del framework
 * de documentos. Centraliza la convención de naming para que distintos
 * llamadores generen siempre la misma clave.
 *
 * Formato: `entity-filters:<moduleId>:<entityId>:v<schemaVersion>`.
 */
export function buildEntityStorageKey(moduleId: string, entity: EntityConfig): string {
  return `${STORAGE_KEY_PREFIX}:${moduleId}:${entity.id}:v${entity.schemaVersion}`;
}

/**
 * Persistencia de filtros del usuario en `localStorage` indexada por una
 * clave libre.
 *
 * Es agnóstico del dominio: recibe un `storageKey` ya armado y opera sobre él.
 * Permite uso tanto desde el camino A (documentos vía `buildEntityStorageKey`)
 * como desde el camino B (masters con claves literales).
 *
 * Manejo de errores:
 *  - Si `localStorage` no está disponible (SSR), las operaciones son no-op.
 *  - Si el JSON guardado está corrupto, se descarta silenciosamente.
 *
 * Convención recomendada: `<scope>:<resource>:v<schemaVersion>`. Incrementar
 * la versión cuando cambie el shape de filtros para invalidar storage obsoleto.
 */
@Injectable({ providedIn: 'root' })
export class EntityFilterStorageService {
  read(storageKey: string): readonly FilterCondition[] {
    if (!this.isStorageAvailable()) return [];

    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        this.clearCorrupted(storageKey);
        return [];
      }
      return parsed as FilterCondition[];
    } catch {
      this.clearCorrupted(storageKey);
      return [];
    }
  }

  write(storageKey: string, filters: readonly FilterCondition[]): void {
    if (!this.isStorageAvailable()) return;
    localStorage.setItem(storageKey, JSON.stringify(filters));
  }

  clear(storageKey: string): void {
    if (!this.isStorageAvailable()) return;
    localStorage.removeItem(storageKey);
  }

  private isStorageAvailable(): boolean {
    return typeof localStorage !== 'undefined';
  }

  private clearCorrupted(storageKey: string): void {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Si tampoco podemos limpiar, no hay más que hacer.
    }
  }
}
