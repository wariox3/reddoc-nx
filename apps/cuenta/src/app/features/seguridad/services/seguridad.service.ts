import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@reddoc/core';

@Injectable({ providedIn: 'root' })
export class SeguridadService extends BaseHttpService {
  cambiarClave(claveActual: string, claveNueva: string): Observable<{ cambio: boolean }> {
    return this.post<{ cambio: boolean }>('/seguridad/usuario/cambiar-clave/', {
      clave_actual: claveActual,
      clave_nueva: claveNueva,
    });
  }
}
