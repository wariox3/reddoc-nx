import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador de grupo: el consecutivo hasta no puede ser menor que el desde.
 * Devuelve `{ consecutivosInvalidos: true }` a nivel del FormGroup.
 */
export function consecutivosOrdenValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const desde = group.get('consecutivo_desde')?.value;
    const hasta = group.get('consecutivo_hasta')?.value;
    if (desde != null && hasta != null && Number(hasta) < Number(desde)) {
      return { consecutivosInvalidos: true };
    }
    return null;
  };
}

/**
 * Validador de grupo: la fecha hasta no puede ser anterior a la fecha desde.
 * Devuelve `{ rangoFechasInvalido: true }` a nivel del FormGroup.
 */
export function rangoFechasValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const desde = group.get('fecha_desde')?.value as Date | null;
    const hasta = group.get('fecha_hasta')?.value as Date | null;
    if (desde && hasta && new Date(hasta).getTime() < new Date(desde).getTime()) {
      return { rangoFechasInvalido: true };
    }
    return null;
  };
}
