import type { PaginatedResponse } from '@reddoc/core';

export interface Contenedor {
  id: number;
  schema_name: string;
  nombre: string;
  activo: boolean;
  dominio: string;
}

export type ContenedoresResponse = PaginatedResponse<Contenedor>;

export interface TipoSuscripcion {
  id: number;
  nombre: string;
  precio: string;
  suscripcion_clase_id: number;
}

export type TiposSuscripcionResponse = PaginatedResponse<TipoSuscripcion>;

export interface CreateContenedorRequest {
  nombre: string;
  schema_name: string;
  telefono: string;
  correo: string;
  suscripcion_tipo_id: number;
}
