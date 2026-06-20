import { NOVEDAD_TIPO_REFERENCIA_ID, NOVEDAD_TIPO_VACACIONES_ID } from './novedad.constants';

/**
 * Reglas de dominio del formulario de novedad — funciones puras, sin Angular.
 *
 * Centralizan la lógica condicional que en el legacy estaba dispersa con ids
 * mágicos en el componente. Al ser puras, son fáciles de testear y mueven la
 * decisión "qué muestra el formulario" fuera de la vista.
 */

/** ¿El tipo seleccionado es vacaciones? (habilita periodo + días disfrutados/dinero). */
export function esVacaciones(tipoId: number | null): boolean {
  return tipoId === NOVEDAD_TIPO_VACACIONES_ID;
}

/**
 * ¿Se debe ofrecer el selector de novedad de referencia? Solo para el tipo que la
 * usa y cuando ya hay un contrato elegido (la referencia se filtra por ambos).
 */
export function requiereReferencia(tipoId: number | null, contratoId: number | null): boolean {
  return tipoId === NOVEDAD_TIPO_REFERENCIA_ID && contratoId != null;
}
