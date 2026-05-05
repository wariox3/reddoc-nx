import { BaseUsuario } from '@reddoc/core';

export interface Usuario extends BaseUsuario {
  name: string;
  apellidos: string | null;
  numero_identificacion: string | null;
}
