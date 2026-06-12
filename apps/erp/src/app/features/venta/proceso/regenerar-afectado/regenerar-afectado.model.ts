/**
 * Resultado del proceso **Regenerar afectado**.
 *
 * El backend confirma la forma `{ actualizados: number }`: la cantidad de líneas
 * de documento cuyo estado de afectación se recalculó. Se mantiene opcional y se
 * lee con `pickAfectadosCount` (tolerante a otras formas) por si el contrato
 * cambia.
 */
export interface RegenerarAfectadoResult {
  /** Líneas cuyo estado de afectación se recalculó. */
  readonly actualizados?: number | null;
}

/**
 * Extrae un conteo mostrable de un response de forma desconocida, en orden de
 * preferencia (actualizados → afectados → total). Devuelve `null` si ninguno es
 * un número finito — en ese caso la consola muestra solo el éxito genérico.
 */
export function pickAfectadosCount(res: unknown): number | null {
  if (res === null || typeof res !== 'object') return null;
  const record = res as Record<string, unknown>;
  for (const key of ['actualizados', 'afectados', 'total'] as const) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
  }
  return null;
}
