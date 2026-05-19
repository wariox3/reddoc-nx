const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export const ANNUAL_DISCOUNT = 0.1;

export function formatCop(value: number): string {
  return COP.format(value);
}

export function parsePrecio(precio: string): number {
  const n = Number(precio);
  return Number.isNaN(n) ? 0 : n;
}

export function displayedMonthly(precio: string, annual: boolean): number {
  const base = parsePrecio(precio);
  return annual ? Math.round(base * (1 - ANNUAL_DISCOUNT)) : Math.round(base);
}

export function annualTotal(precio: string): number {
  const base = parsePrecio(precio);
  return Math.round(base * (1 - ANNUAL_DISCOUNT) * 12);
}
