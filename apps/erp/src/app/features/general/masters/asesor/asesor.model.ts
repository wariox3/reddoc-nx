export interface Asesor {
  readonly id: number;
  readonly nombre_corto: string;
  readonly celular: string;
  readonly correo: string;
}

export interface AsesorPayload {
  nombre_corto: string;
  celular: string;
  correo: string;
}
