import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService, FileDownloadService, PaginatedResponse } from '@reddoc/core';
import { Movimiento } from '../models/movimiento.model';

@Injectable({ providedIn: 'root' })
export class FacturacionService extends BaseHttpService {
  private readonly fileDownload = inject(FileDownloadService);

  getMovimientos(page = 1): Observable<PaginatedResponse<Movimiento>> {
    return this.get<PaginatedResponse<Movimiento>>('/contenedor/movimiento/lista-usuario/', {
      page,
    });
  }

  imprimirMovimiento(id: number): Observable<void> {
    return this.fileDownload.download(`/contenedor/movimiento/${id}/imprimir/`, {
      fallbackFilename: `movimiento-${id}.pdf`,
    });
  }
}
