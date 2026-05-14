import type { PaginatedResponse } from '@reddoc/core';

export type ContenedorRol = 'propietario' | 'administrador' | 'usuario';

export interface ContenedorMember {
  id: number;
  usuario_id: number;
  usuario_nombre_corto: string | null;
  usuario_email: string;
  cliente_id: number;
  rol_id: number | null;
}

export type ContenedorMembersResponse = PaginatedResponse<ContenedorMember>;

export interface SendInviteRequest {
  cliente_id: number;
  usuario_id: number;
  rol_id: number;
}

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

export interface UserSearchResult {
  readonly id: number;
  readonly nombre_corto: string | null;
  readonly email: string;
}
