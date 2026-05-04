import { BaseUsuario } from '@reddoc/core';

export interface Usuario extends BaseUsuario {
  name: string;
  apellidos: string | null;
  numero_identificacion: string | null;
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
