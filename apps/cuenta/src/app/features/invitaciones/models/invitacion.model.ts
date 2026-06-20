import type { PaginatedResponse } from '@reddoc/core';

export type InvitacionEstado = 'P' | 'A' | 'R';

export interface InvitacionPendiente {
  id: number;
  cliente: number;
  cliente_nombre: string;
  usuario: number;
  usuario_nombre_corto: string | null;
  usuario_correo: string;
  usuario_invitado: number;
  rol: number;
  rol_nombre: string;
  estado: InvitacionEstado;
  fecha: string;
}

export type InvitacionesPendientesResponse = PaginatedResponse<InvitacionPendiente>;
