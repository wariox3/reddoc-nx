import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@reddoc/core';

/** Mapa `nombreCampo → valor` que devuelve el endpoint. */
export type ConfiguracionCampos = Record<string, number>;

/**
 * Accede al endpoint `/general/configuracion/campos/` para leer valores de
 * configuración del sistema (UVT, salario mínimo, etc.) por su nombre de campo.
 */
@Injectable({ providedIn: 'root' })
export class ConfiguracionService extends BaseHttpService {
  getCampos(campos: readonly string[]): Observable<ConfiguracionCampos> {
    return this.get<ConfiguracionCampos>('/general/configuracion/campos/', {
      campos: campos.join(','),
    });
  }
}
