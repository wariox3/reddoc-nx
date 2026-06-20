/**
 * Turno: jornada de trabajo del módulo Turno. Define el horario (`hora_inicio`,
 * `hora_fin`), las horas calculadas (totales, diurnas y nocturnas), un color para
 * identificarlo visualmente y su código.
 *
 * Shape de lectura de `POST /turno/turno/lista/` y `GET /turno/turno/:id/`.
 * `hora_inicio`/`hora_fin` viajan como string (`HH:MM` o `HH:MM:SS`) y `color`
 * como string hex (`#RRGGBB`).
 */
export interface Turno {
  readonly id: number;
  readonly nombre: string;
  readonly codigo: string;
  readonly hora_inicio: string | null;
  readonly hora_fin: string | null;
  readonly horas: number | null;
  readonly horas_diurnas: number | null;
  readonly horas_nocturnas: number | null;
  readonly color: string | null;
  readonly estado_inactivo: boolean;
}

/**
 * Write-model para create/update de turno.
 *
 * `estado_inactivo` no se captura en el formulario: lo gestiona el backend
 * (alta → activo).
 */
export interface TurnoPayload {
  nombre: string;
  codigo: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  horas: number | null;
  horas_diurnas: number | null;
  horas_nocturnas: number | null;
  color: string | null;
}
