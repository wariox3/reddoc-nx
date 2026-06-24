/**
 * Programación: movimiento del módulo de turnos.
 *
 * Shape de lectura de `POST /turno/programacion/lista/` y
 * `GET /turno/programacion/:id/`.
 *
 * TODO: el shape está vacío a propósito (solo `id`). Sumar los campos reales
 * cuando se defina qué contiene la programación.
 */
export interface Programacion {
  readonly id: number;
}
