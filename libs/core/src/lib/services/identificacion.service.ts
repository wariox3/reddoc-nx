import { Injectable } from '@angular/core';
import { Observable, map, shareReplay } from 'rxjs';
import { Identificacion } from '../models/identificacion.model';
import { BaseHttpService } from './base-http.service';

type IdentificacionResponse = Identificacion[] | { results: Identificacion[] };

@Injectable({ providedIn: 'root' })
export class IdentificacionService extends BaseHttpService {
  // Lista finita y estable: una sola petición compartida para toda la sesión.
  private readonly list$ = this.get<IdentificacionResponse>(
    '/contenedor/identificacion/seleccionar/',
  ).pipe(
    map((res) => (Array.isArray(res) ? res : (res.results ?? []))),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  list(): Observable<Identificacion[]> {
    return this.list$;
  }
}
