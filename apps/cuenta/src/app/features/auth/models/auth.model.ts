import { BaseUsuario } from '@reddoc/core';

export interface Usuario extends BaseUsuario {
  nombre_corto: string | null;
  numero_identificacion: string | null;
  celular: string | null;
  idioma: string;
  is_active: boolean;
  fecha_creacion: string;
}
