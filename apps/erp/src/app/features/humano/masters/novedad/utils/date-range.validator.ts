import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador de grupo que verifica `desde <= hasta` entre dos controles de fecha
 * (`Date | null`). Si alguno está vacío no valida (deja que el `required` de cada
 * control se encargue). El error se publica a nivel de grupo con la clave
 * `${hastaKey}Rango` para no colisionar cuando hay más de un rango en el mismo
 * formulario (p. ej. fechas del periodo además de las fechas base).
 *
 * Factoría reutilizable y sin estado — candidata a promover a `@reddoc/core` si
 * otro master la necesita.
 */
export function dateRangeValidator(desdeKey: string, hastaKey: string): ValidatorFn {
  const errorKey = `${hastaKey}Rango`;
  return (group: AbstractControl): ValidationErrors | null => {
    const desde = group.get(desdeKey)?.value as Date | null;
    const hasta = group.get(hastaKey)?.value as Date | null;
    if (!desde || !hasta) return null;
    return desde.getTime() > hasta.getTime() ? { [errorKey]: true } : null;
  };
}
