import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import type { PaginatedResponse } from '../models/pagination.model';
import type { ContenedorAccess } from './tenant.types';

export interface ContenedorAccessService {
  getAccesos(): Observable<PaginatedResponse<ContenedorAccess>>;
}

export const CONTENEDOR_ACCESS_SERVICE = new InjectionToken<ContenedorAccessService>(
  'ContenedorAccessService',
);
