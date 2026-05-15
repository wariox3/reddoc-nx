import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BillingProfile, BillingProfileDraft } from '../models/billing-profile.model';

const MOCK_PROFILES: BillingProfile[] = [
  {
    id: 1,
    tipo: 'NIT',
    numero: '900.123.456-7',
    nombre: 'Distribuidora Andina S.A.S.',
    email: 'facturacion@distribuidoraandina.co',
    direccion: 'Calle 100 # 11-32, Oficina 502',
    ciudad: 'Bogotá D.C.',
    ciudad_id: 1,
  },
  {
    id: 2,
    tipo: 'CC',
    numero: '1.020.345.678',
    nombre: 'María Camila Restrepo',
    email: 'maria.restrepo@correo.co',
    direccion: 'Carrera 43A # 5-15, Apto 1102',
    ciudad: 'Medellín',
    ciudad_id: 2,
  },
];

@Injectable({ providedIn: 'root' })
export class BillingProfilesService {
  list(): Observable<BillingProfile[]> {
    return of(MOCK_PROFILES);
  }

  create(draft: BillingProfileDraft): Observable<BillingProfile> {
    const next: BillingProfile = {
      id: Date.now(),
      tipo: draft.tipo ?? 'CC',
      numero: draft.numero,
      nombre: draft.nombre,
      email: draft.email,
      direccion: draft.direccion,
      ciudad: draft.ciudad?.nombre ?? '',
      ciudad_id: draft.ciudad?.id,
    };
    return of(next);
  }
}
