import { Suscripcion } from '../models/suscripcion.model';
import { SuscripcionTipo } from '../models/suscripcion-tipo.model';
import { PeriodoPago } from '../models/pago.model';
import { annualTotal, displayedMonthly, parsePrecio } from '../pages/planes/utils/plan-pricing';
import { getSuscripcionStatus } from '../suscripcion.utils';

export interface CambioPlanCalculo {
  readonly saldoNoConsumido: number;
  readonly costoNuevoPlan: number;
  readonly totalAPagar: number;
  readonly requiereCobro: boolean;
  readonly esMismoPlan: boolean;
}

export function calcularSaldoNoConsumido(suscripcion: Suscripcion): number {
  if (suscripcion.frecuencia === 'P') return 0;
  const precio = parsePrecio(suscripcion.precio ?? '0');
  if (precio <= 0) return 0;
  const status = getSuscripcionStatus(suscripcion);
  if (status.expired) return 0;
  return Math.round((precio / 30) * status.left);
}

export function calcularCostoNuevoPlan(plan: SuscripcionTipo, periodo: PeriodoPago): number {
  return periodo === 'A' ? annualTotal(plan.precio) : displayedMonthly(plan.precio, false);
}

export function calcularCambioPlan(args: {
  readonly suscripcionActual: Suscripcion;
  readonly planNuevo: SuscripcionTipo;
  readonly periodoNuevo: PeriodoPago;
}): CambioPlanCalculo {
  const saldo = calcularSaldoNoConsumido(args.suscripcionActual);
  const costo = calcularCostoNuevoPlan(args.planNuevo, args.periodoNuevo);
  const total = Math.max(costo - saldo, 0);
  const esMismoPlan =
    args.suscripcionActual.suscripcion_tipo === args.planNuevo.id &&
    args.suscripcionActual.frecuencia === args.periodoNuevo;
  return {
    saldoNoConsumido: saldo,
    costoNuevoPlan: costo,
    totalAPagar: total,
    requiereCobro: total > 0,
    esMismoPlan,
  };
}
