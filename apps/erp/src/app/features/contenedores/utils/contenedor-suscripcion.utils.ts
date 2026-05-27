function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function isSuscripcionExpired(fecha: string | undefined): boolean {
  if (!fecha) return false;
  return parseLocalDate(fecha) < new Date();
}

export function isSuscripcionExpiringSoon(fecha: string | undefined): boolean {
  if (!fecha) return false;
  const days = (parseLocalDate(fecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 30;
}

export function getSuscripcionExpiryLabel(fecha: string | undefined): string {
  if (!fecha) return '';
  if (isSuscripcionExpired(fecha)) return 'Vencida';
  const date = parseLocalDate(fecha);
  const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days <= 7) return `Vence en ${days}d`;
  return `Vence ${date.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}
