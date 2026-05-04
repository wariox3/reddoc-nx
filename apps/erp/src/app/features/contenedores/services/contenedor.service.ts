import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { CONTENEDORES_MOCK } from '../mocks/contenedores.mock';
import { ContenedoresResponse } from '../models/contenedor.model';

@Injectable({ providedIn: 'root' })
export class ContenedorService {
  getAccesos(): Observable<ContenedoresResponse> {
    return of(CONTENEDORES_MOCK).pipe(delay(800));
  }
}
