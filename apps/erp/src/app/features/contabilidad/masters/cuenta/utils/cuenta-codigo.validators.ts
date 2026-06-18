import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validadores del código de cuenta (PUC). El código es una cadena de dígitos
 * que codifica la jerarquía contable, por eso debe tener longitud par y no
 * iniciar en `0`.
 */

/** El valor solo puede contener dígitos. */
export function soloDigitos(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null;
    return value && !/^\d+$/.test(value) ? { soloDigitos: true } : null;
  };
}

/** El valor debe tener un número par de caracteres. */
export function longitudPar(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null;
    return value && value.length % 2 !== 0 ? { longitudImpar: true } : null;
  };
}

/** El valor no puede iniciar con el carácter indicado. */
export function noIniciaCon(caracter: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null;
    return value && value.startsWith(caracter) ? { primerCaracterInvalido: true } : null;
  };
}
