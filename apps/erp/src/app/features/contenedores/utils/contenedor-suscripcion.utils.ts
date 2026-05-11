export function isSuscripcionExpired(fecha: string | undefined): boolean {
  if (!fecha) return false;
  return new Date(fecha) < new Date();
}

export function isSuscripcionExpiringSoon(fecha: string | undefined): boolean {
  if (!fecha) return false;
  const days = (new Date(fecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 30;
}

export function getSuscripcionExpiryLabel(fecha: string | undefined): string {
  if (!fecha) return '';
  if (isSuscripcionExpired(fecha)) return 'Vencida';
  const days = Math.ceil((new Date(fecha).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days <= 7) return `Vence en ${days}d`;
  return `Vence ${new Date(fecha).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}
