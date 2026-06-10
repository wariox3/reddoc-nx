import { Injectable } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { Identificacion } from '../models/identificacion.model';
import { PaginatedResponse } from '../models/pagination.model';
import { BaseHttpService } from './base-http.service';

@Injectable({ providedIn: 'root' })
export class IdentificacionService extends BaseHttpService {
  // Catálogo global en el schema público: sin X-Tenant.
  // Declarado antes de `list$` porque ese campo inicializa la petición.
  protected override readonly tenantScoped = false;

  // Lista finita y estable: una sola petición compartida para toda la sesión.
  private readonly list$ = this.get<PaginatedResponse<Identificacion>>(
    '/contenedor/identificacion/seleccionar/',
  ).pipe(
    map((res) => [...res.results]),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  list(): Observable<Identificacion[]> {
    return this.list$;
  }
}
