function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysUntilExpiry(fecha: string): number {
  const ms = parseLocalDate(fecha).getTime() - startOfToday().getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function isSuscripcionExpired(fecha: string | undefined): boolean {
  if (!fecha) return false;
  return daysUntilExpiry(fecha) < 0;
}

export function isSuscripcionExpiringSoon(fecha: string | undefined): boolean {
  if (!fecha) return false;
  const days = daysUntilExpiry(fecha);
  return days >= 0 && days <= 30;
}

export function getSuscripcionExpiryLabel(fecha: string | undefined): string {
  if (!fecha) return '';
  const days = daysUntilExpiry(fecha);
  if (days < 0) return 'Vencida';
  if (days === 0) return 'Vence hoy';
  if (days <= 7) return `Vence en ${days}d`;
  const date = parseLocalDate(fecha);
  return `Vence ${date.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}
