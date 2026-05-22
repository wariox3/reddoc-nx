import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Ciudad } from '../models/ciudad.model';
import { PaginatedResponse } from '../models/pagination.model';
import { BaseHttpService } from './base-http.service';

@Injectable({ providedIn: 'root' })
export class CiudadService extends BaseHttpService {
  // Catálogo global en el schema público: sin X-Tenant.
  protected override readonly tenantScoped = false;

  search(query: string): Observable<Ciudad[]> {
    const params = query ? { search: query } : undefined;
    return this.get<PaginatedResponse<Ciudad>>('/contenedor/ciudad/seleccionar/', params).pipe(
      map((res) => res.results),
    );
  }
}
