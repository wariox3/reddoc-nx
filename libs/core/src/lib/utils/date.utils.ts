/** Fecha de hoy con la hora puesta a medianoche (00:00:00.000) en zona local. */
export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Formatea un `Date` a `yyyy-MM-dd` usando las partes **locales** de la fecha.
 * Evita el corrimiento de día que produciría `toISOString()` (que pasa a UTC).
 */
export function toIsoDate(date: Date): string;
export function toIsoDate(date: Date | null | undefined): string | null;
export function toIsoDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Parsea `yyyy-MM-dd` a un `Date` local (sin corrimiento de zona horaria). */
export function fromIsoDate(value: string): Date;
export function fromIsoDate(value: string | null | undefined): Date | null;
export function fromIsoDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

/** Formatea la hora de un `Date` a `HH:mm`. */
export function toHora(date: Date): string;
export function toHora(date: Date | null | undefined): string | null;
export function toHora(date: Date | null | undefined): string | null {
  if (!date) return null;
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/** Parsea `HH:mm` a un `Date` (la fecha base es irrelevante: solo importa la hora). */
export function fromHora(value: string): Date;
export function fromHora(value: string | null | undefined): Date | null;
export function fromHora(value: string | null | undefined): Date | null {
  if (!value) return null;
  const [hours, minutes] = value.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/** Días enteros entre dos fechas (`b - a`), redondeado. */
export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
