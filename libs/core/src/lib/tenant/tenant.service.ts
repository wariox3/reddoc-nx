import { Injectable, signal } from '@angular/core';
import { LAST_TENANT_KEY, type ContenedorAccess } from './tenant.types';

/**
 * Estado del tenant activo.
 *
 * El **slug** es la fuente de verdad: se deriva de la URL `/t/:tenantSlug` y es
 * lo único que necesita el grueso de la app (interceptor, layouts, navegación).
 * `currentContenedor` es enriquecimiento opcional — el objeto completo solo está
 * disponible cuando el usuario entró vía la página de contenedores.
 */
@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly _slug = signal<string | null>(null);
  private readonly _contenedor = signal<ContenedorAccess | null>(null);

  /** Slug del tenant activo. Fuente de verdad. */
  readonly currentSlug = this._slug.asReadonly();
  /** Objeto completo del tenant activo, si se dispone. */
  readonly currentContenedor = this._contenedor.asReadonly();

  /** Fija el tenant activo a partir del slug de la URL. */
  setSlug(slug: string): void {
    this._slug.set(slug);
    this.persist(slug);
  }

  /** Fija el tenant activo con su objeto completo (también actualiza el slug). */
  setCurrent(contenedor: ContenedorAccess): void {
    this._contenedor.set(contenedor);
    this.setSlug(contenedor.schema_name);
  }

  clear(): void {
    this._slug.set(null);
    this._contenedor.set(null);
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
