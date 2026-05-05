import { BaseUsuario } from '@reddoc/core';

export interface Usuario extends BaseUsuario {
  nombre_corto: string | null;
  numero_identificacion: string | null;
  celular: string | null;
  idioma: string;
  imagen: string | null;
  imagen_thumbnail: string | null;
  is_verified: boolean;
  fecha_creacion: string;
}
