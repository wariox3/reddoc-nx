import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { ToastService } from './toast.service';
import { normalizeHttpError } from '../utils/error-normalizer';
import { applyServerErrors, ServerFieldMap } from '../utils/form-errors';

/**
 * Maneja el error de un submit HTTP de forma uniforme para cualquier formulario.
 *
 * - Errores de validación (400/422): los errores por campo se marcan inline en el
 *   `FormGroup`; lo que no se asocie a un campo (o un error general) va a un toast.
 * - Errores no-validación (500, 403, etc.): no hace nada — ya los muestra el interceptor.
 */
@Injectable({ providedIn: 'root' })
export class FormErrorService {
  private readonly toast = inject(ToastService);

  /**
   * @param form       FormGroup al que se aplican los errores por campo.
   * @param err        Error capturado en el `subscribe`.
   * @param errorTitle Título del toast para los errores no asociados a un campo.
   * @param fieldMap   Opcional: mapea nombres de campo del backend a nombres de control.
   */
  handle(form: FormGroup, err: unknown, errorTitle: string, fieldMap?: ServerFieldMap): void {
    if (!(err instanceof HttpErrorResponse)) return;

    const normalized = normalizeHttpError(err);
    if (normalized.kind !== 'validation') return;

    const { unmatched, appliedToForm } = applyServerErrors(form, normalized, fieldMap);
    if (appliedToForm && unmatched.length === 0) return;

    const detail = unmatched.length > 0 ? unmatched.join(' ') : normalized.message;
    this.toast.error(errorTitle, detail);
  }
}
