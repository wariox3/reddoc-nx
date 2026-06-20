/**
 * Calcula el rango de ids `[idDesde, idHasta]` de los hijos de un nivel del PUC.
 *
 * La jerarquía se codifica en el id: los grupos de una clase viven en
 * `clase·10 … clase·10+9`; las cuentas de un grupo en `grupo·100 … grupo·100+99`.
 */
export function calcularRangoIds(
  id: number,
  multiplicador: number,
  desplazamiento: number,
): { idDesde: number; idHasta: number } {
  const idDesde = id * multiplicador;
  return { idDesde, idHasta: idDesde + desplazamiento };
}
