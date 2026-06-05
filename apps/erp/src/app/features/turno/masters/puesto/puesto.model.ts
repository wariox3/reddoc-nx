/**
 * Puesto: lugar físico de trabajo dentro del módulo de turnos (tiene dirección,
 * coordenadas y referencias a ciudad, centro de costo, contacto y programador).
 *
 * Shape de lectura del endpoint `POST /turno/puesto/lista/`. Los relacionales
 * viajan por ahora como id "pelado" (`*_id`); cuando el backend acompañe con un
 * `<campo>_nombre` se suman aquí y a las columnas. `latitud`/`longitud` llegan
 * como string por la serialización Decimal de Django.
 */
export interface Puesto {
  readonly id: number;
  readonly nombre: string;
  readonly direccion: string | null;
  readonly celular: string | null;
  readonly latitud: string | null;
  readonly longitud: string | null;
  readonly comentario: string | null;
  readonly estado_inactivo: boolean;
  readonly centro_costo_id: number | null;
  readonly ciudad_id: number | null;
  readonly contacto_id: number | null;
  readonly programador_id: number | null;
  /** Nombre legible del FK ciudad — presente en la respuesta de getById(). */
  readonly ciudad_nombre?: string | null;
  /** Nombre legible del FK contacto — presente en la respuesta de getById(). */
  readonly contacto_nombre?: string | null;
  /** Nombre legible del FK programador — presente en la respuesta de getById(). */
  readonly programador_nombre?: string | null;
}

/** Forma cruda de la respuesta paginada del backend de puestos. */
export interface PuestoListResponse {
  readonly count: number;
  readonly results: readonly Puesto[];
}

/** Write-model para create/update de puesto. */
export interface PuestoPayload {
  nombre: string;
  direccion: string | null;
  celular: string | null;
  latitud: string | null;
  longitud: string | null;
  comentario: string | null;
  ciudad: number | null;
  contacto: number | null;
  centro_costo: number | null;
  programador: number | null;
}
