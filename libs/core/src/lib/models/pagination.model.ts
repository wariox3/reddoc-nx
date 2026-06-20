/**
 * Envelope de paginación estándar del backend (DRF).
 *
 * **Toda** respuesta de listado del API tiene este shape, sea master o no
 * (`/lista/`, `/seleccionar/`, catálogos…). Es el único tipo de respuesta
 * paginada del front: no definir variantes por entidad — usar
 * `PaginatedResponse<MiEntidad>`.
 */
export interface PaginatedResponse<T> {
  readonly count: number;
  readonly next: string | null;
  readonly previous: string | null;
  readonly results: readonly T[];
}
