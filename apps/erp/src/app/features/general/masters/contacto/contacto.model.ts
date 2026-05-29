/**
 * Contacto: cubre clientes, proveedores y empleados sobre el mismo recurso.
 * El backend discrimina internamente por los flags `cliente`, `proveedor`, `empleado`.
 *
 * Shape de lectura: los relacionales viajan como `<campo>_id` + `<campo>_nombre`.
 * En escritura (`ContactoPayload`) los mismos campos se envían sin sufijo.
 */
export interface Contacto {
  readonly id: number;
  readonly numero_identificacion: string;
  readonly digito_verificacion: string | null;
  readonly nombre_corto: string;
  readonly nombre1: string | null;
  readonly nombre2: string | null;
  readonly apellido1: string | null;
  readonly apellido2: string | null;
  readonly direccion: string | null;
  readonly barrio: string | null;
  readonly codigo_ciuu: string | null;
  readonly codigo_postal: string | null;
  readonly identificacion_abreviatura: string | null;
  readonly telefono: string | null;
  readonly celular: string | null;
  readonly correo: string | null;
  readonly correo_facturacion_electronica: string | null;
  readonly cliente: boolean;
  readonly proveedor: boolean;
  readonly empleado: boolean;
  readonly conductor: boolean;
  readonly numero_cuenta: string | null;
  readonly numero_licencia: string | null;
  readonly fecha_vence_licencia: string | null;
  readonly identificacion_id: number;
  readonly identificacion_nombre: string;
  readonly ciudad_id: number;
  readonly ciudad_nombre: string;
  readonly tipo_persona_id: number;
  readonly tipo_persona_nombre: string;
  readonly responsabilidad_id: number;
  readonly responsabilidad_nombre: string;
  readonly regimen_id: number | null;
  readonly asesor_id: number | null;
  readonly precio_id: number | null;
  readonly plazo_pago_id: number | null;
  readonly plazo_pago_proveedor_id: number | null;
  readonly banco_id: number | null;
  readonly banco_nombre: string | null;
  readonly cuenta_banco_clase_id: number | null;
  readonly activo?: boolean;
}

/** Payload para crear o actualizar un contacto. */
export interface ContactoPayload {
  readonly tipo_persona: number | null;
  readonly responsabilidad: number | null;
  readonly identificacion: number | null;
  readonly numero_identificacion: string;
  readonly digito_verificacion: string | null;
  readonly nombre_corto: string | null;
  readonly nombre1: string | null;
  readonly nombre2: string | null;
  readonly apellido1: string | null;
  readonly apellido2: string | null;
  readonly telefono: string | null;
  readonly celular: string | null;
  readonly ciudad: number | null;
  readonly direccion: string | null;
  readonly barrio: string | null;
  readonly correo: string | null;
  readonly cliente: boolean;
  readonly proveedor: boolean;
  readonly empleado: boolean;
  readonly plazo_pago: number | null;
  readonly precio: number | null;
  readonly asesor: number | null;
  readonly correo_facturacion_electronica: string | null;
  readonly banco: number | null;
  readonly numero_cuenta: string | null;
  readonly cuenta_banco_clase: number | null;
  readonly plazo_pago_proveedor: number | null;
}

/** Forma cruda de la respuesta paginada del backend de contactos. */
export interface ContactoListResponse {
  readonly count: number;
  readonly results: readonly Contacto[];
}

/**
 * Respuesta del endpoint de importación masiva.
 * Shape provisional: crece cuando el backend defina su contrato final.
 */
export interface ContactoImportResult {
  readonly imported_count: number;
  readonly errors?: ReadonlyArray<{
    readonly row: number;
    readonly field?: string;
    readonly message: string;
  }>;
}
