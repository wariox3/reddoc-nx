import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { BaseHttpService, IdentificacionService, PaginatedResponse } from '@reddoc/core';
import {
  BillingProfile,
  BillingProfileDraft,
  BillingProfilePayload,
} from '../models/billing-profile.model';

/** Forma cruda del contacto tal como llega del backend. */
interface ContactoApi {
  readonly id: number;
  readonly numero_identificacion: string;
  readonly digito_verificacion: string | null;
  readonly nombre_corto: string;
  readonly direccion: string;
  readonly telefono: string;
  readonly correo: string;
  readonly identificacion: number;
  readonly ciudad: number;
  readonly ciudad_nombre: string;
  readonly usuario: number;
}

@Injectable({ providedIn: 'root' })
export class BillingProfilesService extends BaseHttpService {
  private readonly identificacionService = inject(IdentificacionService);

  list(): Observable<BillingProfile[]> {
    return forkJoin({
      page: this.get<PaginatedResponse<ContactoApi>>('/contenedor/contacto/lista-usuario/'),
      tipos: this.identificacionService.list(),
    }).pipe(
      map(({ page, tipos }) => {
        const tipoById = new Map(tipos.map((t) => [t.id, t.nombre] as const));
        return page.results.map<BillingProfile>((c) => ({
          id: c.id,
          tipo: tipoById.get(c.identificacion) ?? '',
          numero: c.numero_identificacion,
          nombre: c.nombre_corto,
          email: c.correo,
          telefono: c.telefono,
          direccion: c.direccion,
          ciudad: c.ciudad_nombre,
          ciudad_id: c.ciudad,
        }));
      }),
    );
  }

  create(draft: BillingProfileDraft): Observable<BillingProfile> {
    const { tipo, ciudad, payload } = this.prepare(draft);
    return this.post<{ id: number }>('/contenedor/contacto/', payload).pipe(
      map((res) => this.toView(res.id, draft, tipo, ciudad)),
    );
  }

  update(id: number, draft: BillingProfileDraft): Observable<BillingProfile> {
    const { tipo, ciudad, payload } = this.prepare(draft);
    return this.patch<{ id: number }>(`/contenedor/contacto/${id}/`, payload).pipe(
      map(() => this.toView(id, draft, tipo, ciudad)),
    );
  }

  remove(id: number): Observable<void> {
    return this.delete<void>(`/contenedor/contacto/${id}/`);
  }

  private prepare(draft: BillingProfileDraft): {
    tipo: { id: number; nombre: string };
    ciudad: { id: number; nombre: string };
    payload: BillingProfilePayload;
  } {
    const tipo = draft.identificacion;
    const ciudad = draft.ciudad;
    if (!tipo || !ciudad) {
      throw new Error('BillingProfileDraft inválido: identificacion y ciudad son obligatorias.');
    }
    return {
      tipo,
      ciudad,
      payload: {
        identificacion: tipo.id,
        numero_identificacion: draft.numero,
        nombre_corto: draft.nombre,
        correo: draft.email,
        telefono: draft.telefono,
        direccion: draft.direccion,
        ciudad: ciudad.id,
      },
    };
  }

  private toView(
    id: number,
    draft: BillingProfileDraft,
    tipo: { id: number; nombre: string },
    ciudad: { id: number; nombre: string },
  ): BillingProfile {
    return {
      id,
      tipo: tipo.nombre,
      numero: draft.numero,
      nombre: draft.nombre,
      email: draft.email,
      telefono: draft.telefono,
      direccion: draft.direccion,
      ciudad: ciudad.nombre,
      ciudad_id: ciudad.id,
    };
  }
}
