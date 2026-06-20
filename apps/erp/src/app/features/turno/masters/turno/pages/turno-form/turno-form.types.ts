/**
 * Valor crudo del formulario de turno.
 *
 * `hora_inicio`/`hora_fin` son strings `HH:MM` (input `type="time"`);
 * `horas`/`horas_diurnas`/`horas_nocturnas` son numéricos (input `type="number"`,
 * `number | null` vía `NumberValueAccessor`); `color` es el hex del input
 * `type="color"`.
 */
export interface TurnoFormRawValue {
  codigo: string | null;
  nombre: string | null;
  hora_inicio: string | null;
  hora_fin: string | null;
  horas: number | null;
  horas_diurnas: number | null;
  horas_nocturnas: number | null;
  /** Hex del picker nativo — siempre presente (el control nunca queda vacío). */
  color: string;
}
