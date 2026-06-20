export type MovimientoTipo = 'factura' | 'nota_credito' | 'ajuste' | string;

export interface Movimiento {
  readonly id: number;
  readonly evento_pago: number;
  readonly tipo: MovimientoTipo;
  readonly concepto: string;
  readonly valor: string;
  readonly fecha: string;
  readonly fecha_vence: string | null;
  readonly cliente: number | null;
  readonly cliente_nombre?: string;
}
