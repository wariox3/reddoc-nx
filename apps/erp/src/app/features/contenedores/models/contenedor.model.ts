import type { PaginatedResponse } from '@reddoc/core';

export interface Contenedor {
  id: number;
  schema_name: string;
  nombre: string;
  activo: boolean;
  dominio: string;
  telefono?: string;
  correo?: string;
  suscripcion_id?: number;
  suscripcion_fecha_fin?: string;
  suscripcion_frecuencia?: 'P' | 'M' | 'A';
  suscripcion_suscripcion_tipo_nombre?: string;
}

export type ContenedoresResponse = PaginatedResponse<Contenedor>;

export interface CreateContenedorRequest {
  nombre: string;
  schema_name: string;
  telefono: string;
  correo: string;
  suscripcion_tipo_id: number;
  frecuencia: string;
}
