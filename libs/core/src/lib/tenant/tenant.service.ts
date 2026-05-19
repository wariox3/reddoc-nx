import { Injectable, computed, signal } from '@angular/core';
import { LAST_TENANT_KEY, type ContenedorAccess } from './tenant.types';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly _accesos = signal<ContenedorAccess[]>([]);
  private readonly _current = signal<ContenedorAccess | null>(null);

  readonly accesos = this._accesos.asReadonly();
  readonly currentContenedor = this._current.asReadonly();
  readonly currentSlug = computed(() => this._current()?.schema_name ?? null);

  setAccesos(list: ContenedorAccess[]): void {
    this._accesos.set(list);
  }

  setCurrent(contenedor: ContenedorAccess): void {
    this._current.set(contenedor);
    this.persist(contenedor.schema_name);
  }

  setSlug(slug: string): void {
    const match = this._accesos().find((c) => c.schema_name === slug);
    if (match) this._current.set(match);
    this.persist(slug);
  }

  clear(): void {
    this._current.set(null);
    this._accesos.set([]);
  }

  getLastSlug(): string | null {
    try {
      return localStorage.getItem(LAST_TENANT_KEY);
    } catch {
      return null;
    }
  }

  private persist(slug: string): void {
    try {
      localStorage.setItem(LAST_TENANT_KEY, slug);
    } catch {
      // ignore
    }
  }
}
