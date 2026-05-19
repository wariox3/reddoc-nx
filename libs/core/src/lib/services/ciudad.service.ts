import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Ciudad } from '../models/ciudad.model';
import { BaseHttpService } from './base-http.service';

type CiudadResponse = Ciudad[] | { results: Ciudad[] };

@Injectable({ providedIn: 'root' })
export class CiudadService extends BaseHttpService {
  search(query: string): Observable<Ciudad[]> {
    const params = query ? { search: query } : undefined;
    return this.get<CiudadResponse>('/contenedor/ciudad/seleccionar/', params).pipe(
      map((res) => (Array.isArray(res) ? res : (res.results ?? []))),
    );
  }
}
