import type { Puesto, PuestoPayload } from './puesto.model';
import type { PuestoFormRawValue } from './pages/puesto-form/puesto-form.types';

export function puestoToFormValue(p: Puesto): Partial<PuestoFormRawValue> {
  return {
    nombre: p.nombre,
    direccion: p.direccion ?? '',
    celular: p.celular ?? '',
    latitud: p.latitud ?? '',
    longitud: p.longitud ?? '',
    comentario: p.comentario ?? '',
    ciudad: p.ciudad_id != null ? { id: p.ciudad_id, nombre: '' } : null,
    contacto: p.contacto_id != null ? { id: p.contacto_id, nombre: '' } : null,
    centroCosto: p.centro_costo_id != null ? { id: p.centro_costo_id, nombre: '' } : null,
    programador: p.programador_id != null ? { id: p.programador_id, nombre: '' } : null,
  };
}

export function formValueToPayload(v: PuestoFormRawValue): PuestoPayload {
  return {
    nombre: v.nombre ?? '',
    direccion: v.direccion || null,
    celular: v.celular || null,
    latitud: v.latitud || null,
    longitud: v.longitud || null,
    comentario: v.comentario || null,
    ciudad: v.ciudad?.id ?? null,
    contacto: v.contacto?.id ?? null,
    centro_costo: v.centroCosto?.id ?? null,
    programador: v.programador?.id ?? null,
  };
}
