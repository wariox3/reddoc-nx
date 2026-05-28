export interface Suscripcion {
  readonly id: number;
  readonly cliente: number;
  readonly cliente_nombre: string;
  readonly usuario: number;
  readonly suscripcion_tipo: number;
  readonly suscripcion_tipo_nombre: string;
  readonly fecha_inicio: string;
  readonly fecha_fin: string;
  readonly frecuencia: string;
  readonly precio: string;
}
