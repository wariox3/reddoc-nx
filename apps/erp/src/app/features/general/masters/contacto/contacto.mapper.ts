import type { Contacto, ContactoPayload } from './contacto.model';
import type { ContactoFormRawValue } from './pages/contacto-form/contacto-form.types';
import { TIPO_PERSONA } from './contacto.constants';
import { construirNombreCorto } from './utils/nombre-corto.util';

/**
 * Adapta el read-model (`Contacto`) a los valores que espera el reactive form.
 *
 * Los selects/autocompletes guardan `ErpSelectOption` ({ id, nombre }), por lo
 * que los `*_id` + `*_nombre` del backend se reagrupan en objetos. Cuando el
 * `*_nombre` no viene en la respuesta (caso de catálogos que se cargan aparte),
 * se manda string vacío y el componente del select lo resuelve.
 */
export function contactoToFormValue(c: Contacto): Partial<ContactoFormRawValue> {
  return {
    tipo_persona: { id: c.tipo_persona_id, nombre: c.tipo_persona_nombre },
    regimen: c.regimen_id !== null ? { id: c.regimen_id, nombre: '' } : null,
    identificacion: { id: c.identificacion_id, nombre: c.identificacion_nombre },
    numero_identificacion: c.numero_identificacion,
    nombre_corto: c.nombre_corto,
    nombre1: c.nombre1 ?? '',
    nombre2: c.nombre2 ?? '',
    apellido1: c.apellido1 ?? '',
    apellido2: c.apellido2 ?? '',
    telefono: c.telefono ?? '',
    celular: c.celular ?? '',
    ciudad: { id: c.ciudad_id, nombre: c.ciudad_nombre },
    direccion: c.direccion ?? '',
    barrio: c.barrio ?? '',
    correo: c.correo ?? '',
    cliente: c.cliente,
    proveedor: c.proveedor,
    empleado: c.empleado,
    plazo_pago: c.plazo_pago_id !== null ? { id: c.plazo_pago_id, nombre: '' } : null,
    precio: c.precio_id !== null ? { id: c.precio_id, nombre: '' } : null,
    asesor: c.asesor_id !== null ? { id: c.asesor_id, nombre: '' } : null,
    correo_facturacion_electronica: c.correo_facturacion_electronica ?? '',
    banco: c.banco_id !== null ? { id: c.banco_id, nombre: c.banco_nombre ?? '' } : null,
    numero_cuenta: c.numero_cuenta ?? '',
    cuenta_banco_clase:
      c.cuenta_banco_clase_id !== null ? { id: c.cuenta_banco_clase_id, nombre: '' } : null,
    plazo_pago_proveedor:
      c.plazo_pago_proveedor_id !== null
        ? { id: Number(c.plazo_pago_proveedor_id), nombre: '' }
        : null,
  };
}

/**
 * Construye el write-model (`ContactoPayload`) a partir del valor crudo del form.
 *
 * Reglas:
 * - Si es persona natural, el `nombre_corto` se construye desde nombres/apellidos
 *   (en jurídica el usuario lo ingresa directo).
 * - Los strings vacíos se normalizan a `null` para no enviar campos vacíos al
 *   backend.
 * - Los selects exponen sólo su `id` (o `null` si no hay selección).
 */
export function formValueToPayload(v: ContactoFormRawValue): ContactoPayload {
  const esNatural = v.tipo_persona?.id === TIPO_PERSONA.NATURAL;
  const nombreCorto = esNatural
    ? construirNombreCorto({
        nombre1: v.nombre1,
        nombre2: v.nombre2,
        apellido1: v.apellido1,
        apellido2: v.apellido2,
      })
    : (v.nombre_corto ?? '');

  return {
    tipo_persona: v.tipo_persona?.id ?? null,
    regimen: v.regimen?.id ?? null,
    identificacion: v.identificacion?.id ?? null,
    numero_identificacion: v.numero_identificacion ?? '',
    digito_verificacion: v.digito_verificacion || null,
    nombre_corto: nombreCorto || null,
    nombre1: v.nombre1 || null,
    nombre2: v.nombre2 || null,
    apellido1: v.apellido1 || null,
    apellido2: v.apellido2 || null,
    telefono: v.telefono || null,
    celular: v.celular || null,
    ciudad: v.ciudad?.id ?? null,
    direccion: v.direccion || null,
    barrio: v.barrio || null,
    correo: v.correo || null,
    cliente: v.cliente ?? false,
    proveedor: v.proveedor ?? false,
    empleado: v.empleado ?? false,
    plazo_pago: v.plazo_pago?.id ?? null,
    precio: v.precio?.id ?? null,
    asesor: v.asesor?.id ?? null,
    correo_facturacion_electronica: v.correo_facturacion_electronica || null,
    banco: v.banco?.id ?? null,
    numero_cuenta: v.numero_cuenta || null,
    cuenta_banco_clase: v.cuenta_banco_clase?.id ?? null,
    plazo_pago_proveedor: v.plazo_pago_proveedor?.id ?? null,
  };
}
