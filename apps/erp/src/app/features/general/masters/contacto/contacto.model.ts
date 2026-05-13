/**
 * Contacto: cubre clientes, proveedores y empleados sobre el mismo recurso.
 * El backend discrimina internamente por los flags `cliente`, `proveedor`, `empleado`.
 */
export interface Contacto {
  readonly id: number;
  readonly nombre_corto: string;
  readonly numero_identificacion: string;
  readonly correo: string | null;
  readonly telefono: string | null;
  readonly cliente: boolean;
  readonly proveedor: boolean;
  readonly empleado: boolean;
  readonly activo: boolean;
}

/** Payload para crear o actualizar un contacto. */
export interface ContactoPayload {
  readonly nombre_corto: string;
  readonly numero_identificacion: string;
  readonly correo?: string | null;
  readonly telefono?: string | null;
  readonly cliente?: boolean;
  readonly proveedor?: boolean;
  readonly empleado?: boolean;
}

/** Forma cruda de la respuesta paginada del backend de contactos. */
export interface ContactoListResponse {
  readonly count: number;
  readonly results: readonly Contacto[];
}
