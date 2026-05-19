import { Injectable } from '@angular/core';
import type { FilterCondition } from '../data/list-query.types';

/**
 * Persistencia de filtros del usuario en `localStorage` indexada por una
 * clave libre.
 *
 * El servicio es agnóstico del dominio: recibe un `storageKey` ya armado
 * y opera sobre él. Cada consumidor define la convención de su clave
 * (literal `'general:contactos:v1'` o derivada de un descriptor de entidad).
 *
 * Convención recomendada: `<scope>:<resource>:v<schemaVersion>`. Incrementar
 * la versión cuando cambie el shape de filtros para invalidar storage obsoleto
 * sin afectar al usuario.
 *
 * Manejo de errores:
 *  - Si `localStorage` no está disponible (SSR), las operaciones son no-op.
 *  - Si el JSON guardado está corrupto, se descarta silenciosamente y se
 *    devuelve lista vacía.
 */
@Injectable({ providedIn: 'root' })
export class FilterStorageService {
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
