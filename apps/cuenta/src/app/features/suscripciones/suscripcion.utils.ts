import { Suscripcion } from './models/suscripcion.model';

export type SuscripcionTone = 'success' | 'warn' | 'danger';

export interface SuscripcionStatus {
  readonly tone: SuscripcionTone;
  readonly badgeText: string;
  readonly used: number;
  readonly total: number;
  readonly left: number;
  readonly pct: number;
  readonly expired: boolean;
}

const FRECUENCIA_LABELS: Record<string, string> = {
  P: 'Prueba',
  M: 'Mensual',
  A: 'Anual',
};

const parseISO = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const daysBetween = (a: Date, b: Date): number =>
  Math.round((b.getTime() - a.getTime()) / 86400000);

export function getSuscripcionStatus(s: Suscripcion): SuscripcionStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = parseISO(s.fecha_inicio);
  const end = parseISO(s.fecha_fin);

  const total = Math.max(daysBetween(start, end), 1);
  const used = Math.max(daysBetween(start, today), 0);
  const left = daysBetween(today, end);
  const pct = Math.min(Math.max((used / total) * 100, 0), 100);

  let tone: SuscripcionTone;
  let badgeText: string;

  if (left < 0) {
    tone = 'danger';
    badgeText = 'Vencida';
  } else if (s.frecuencia === 'P') {
    tone = left <= 7 ? 'warn' : 'success';
    badgeText = 'Período de prueba';
  } else if (left <= 7) {
    tone = 'warn';
    badgeText = 'Por renovar';
  } else {
    tone = 'success';
    badgeText = 'Activa';
  }

  return { tone, badgeText, used, total, left: Math.max(left, 0), pct, expired: left < 0 };
}

export function getSuscripcionFrecuenciaLabel(f: string): string {
  return FRECUENCIA_LABELS[f] ?? f;
}

export function formatSuscripcionPct(pct: number): string {
  return `${Math.round(pct)}%`;
}

export function formatSuscripcionId(id: number): string {
  return `#${String(id).padStart(4, '0')}`;
}

export function formatSuscripcionFechaFin(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}
