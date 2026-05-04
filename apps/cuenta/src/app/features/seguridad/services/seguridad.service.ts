import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@reddoc/core';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints.constants';

@Injectable({ providedIn: 'root' })
export class SeguridadService extends BaseHttpService {
  cambiarClave(claveActual: string, claveNueva: string): Observable<{ cambio: boolean }> {
    return this.post<{ cambio: boolean }>(API_ENDPOINTS.seguridad.cambiarClave, {
      clave_actual: claveActual,
      clave_nueva: claveNueva,
    });
  }
}
