import { Movimiento, MovimientoTipo } from '../models/movimiento.model';

export interface MovimientoGroup {
  readonly key: string;
  readonly label: string;
  readonly items: readonly Movimiento[];
}

const MESES_LARGOS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const MESES_CORTOS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
];

const COP_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

export function parseLocalDate(yyyymmdd: string): Date {
  const [y, m, d] = yyyymmdd.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatMonto(valor: string | number): string {
  const n = typeof valor === 'string' ? Number(valor) : valor;
  return COP_FORMATTER.format(Number.isFinite(n) ? n : 0);
}

export function formatDia(fecha: string): string {
  return String(parseLocalDate(fecha).getDate());
}

export function formatMesCorto(fecha: string): string {
  return MESES_CORTOS[parseLocalDate(fecha).getMonth()];
}

export function formatMesLargo(fecha: string): string {
  const d = parseLocalDate(fecha);
  return `${MESES_LARGOS[d.getMonth()]} ${d.getFullYear()}`;
}

export function tipoLabel(tipo: MovimientoTipo): string {
  switch (tipo) {
    case 'factura':
      return 'Factura';
    case 'nota_credito':
      return 'Nota crédito';
    case 'ajuste':
      return 'Ajuste';
    default:
      return tipo;
  }
}

export function tipoIcon(tipo: MovimientoTipo): string {
  switch (tipo) {
    case 'nota_credito':
      return 'pi pi-replay';
    case 'ajuste':
      return 'pi pi-pencil';
    case 'factura':
    default:
      return 'pi pi-receipt';
  }
}

export function groupByMonth(movimientos: readonly Movimiento[]): MovimientoGroup[] {
  const buckets = new Map<string, { items: Movimiento[]; firstFecha: string }>();

  for (const m of movimientos) {
    const d = parseLocalDate(m.fecha);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.items.push(m);
    } else {
      buckets.set(key, { items: [m], firstFecha: m.fecha });
    }
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([key, { items, firstFecha }]) => ({
      key,
      label: formatMesLargo(firstFecha),
      items: items.sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : b.id - a.id)),
    }));
}
