import { BaseUsuario } from '@reddoc/core';

export interface Usuario extends BaseUsuario {
  nombre_corto: string | null;
  numero_identificacion: string | null;
  celular: string | null;
  idioma: string;
  is_active: boolean;
  fecha_creacion: string;
}

export interface RegisterRequest {
  nombre_corto: string;
  email: string;
  password: string;
  turnstile_token?: string;
}

export interface RegisteredUser {
  id: number;
  email: string;
  role: string;
  nombres: string;
  apellidos: string;
  numero_identificacion: string;
  is_verified: boolean;
}

export interface RegisterResponse {
  user: RegisteredUser;
  verification_link: string;
}
