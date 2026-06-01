import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseHttpService, PaginatedResponse, ParamValue } from '@reddoc/core';

/** Opción genérica `{ id, nombre }` que devuelven los endpoints `seleccionar`. */
export interface ErpSelectOption {
  readonly id: number;
  readonly nombre: string;
}

/**
 * Fetch de opciones para los componentes `app-api-select` y `app-api-autocomplete`.
 *
 * Centraliza el HTTP en la capa de servicio (sobre `BaseHttpService`) en vez de
 * inyectar `HttpClient` en la vista: reutiliza `buildHttpParams`, la base URL y
 * el `HttpContext` con tenant scope. Tenant-scoped por default, como el resto de
 * los masters del ERP.
 */
@Injectable({ providedIn: 'root' })
export class ErpSelectDataService extends BaseHttpService {
  /** Trae las opciones de un endpoint paginado `seleccionar`. */
  fetchOptions(
    endpoint: string,
    params?: Record<string, ParamValue>,
  ): Observable<ErpSelectOption[]> {
    return this.get<PaginatedResponse<ErpSelectOption>>(endpoint, params).pipe(
      map((res) => res.results),
    );
  }
}
