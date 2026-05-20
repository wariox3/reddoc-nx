import { AbstractControl, FormGroup } from '@angular/forms';
import { NON_FIELD_KEY, NormalizedError } from './error-normalizer';

/** Mapa { campoBackend: nombreControl } para campos cuyo nombre difiere del control. */
export type ServerFieldMap = Record<string, string>;

export interface ApplyServerErrorsResult {
  /** Mensajes sin control asociado (campo desconocido o non_field_errors). */
  readonly unmatched: string[];
  /** true si al menos un control quedó marcado con `serverError`. */
  readonly appliedToForm: boolean;
}

/**
 * Mapea los errores por campo de un `NormalizedError` a los `FormControl` del formulario.
 * Cada control afectado recibe el error `serverError` con el mensaje del backend.
 */
export function applyServerErrors(
  form: FormGroup,
  error: NormalizedError,
  fieldMap: ServerFieldMap = {},
): ApplyServerErrorsResult {
  const unmatched: string[] = [];
  let appliedToForm = false;

  for (const [backendField, messages] of Object.entries(error.fieldErrors)) {
    if (messages.length === 0) continue;
    if (backendField === NON_FIELD_KEY) {
      unmatched.push(...messages);
      continue;
    }
    const control = form.get(fieldMap[backendField] ?? backendField);
    if (control) {
      control.setErrors({ ...control.errors, serverError: messages[0] });
      control.markAsTouched();
      appliedToForm = true;
    } else {
      unmatched.push(...messages);
    }
  }

  return { unmatched, appliedToForm };
}

/** Quita el error `serverError` de un control conservando el resto de errores. */
export function clearServerError(control: AbstractControl | null): void {
  if (!control?.hasError('serverError')) return;
  const rest = { ...control.errors };
  delete rest['serverError'];
  control.setErrors(Object.keys(rest).length > 0 ? rest : null);
}
