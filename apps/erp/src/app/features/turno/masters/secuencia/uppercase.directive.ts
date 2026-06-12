import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * Fuerza a mayúsculas el contenido de un input mientras se escribe, conservando
 * la posición del cursor. Actualiza el `FormControl` asociado (ReactiveForms)
 * para que el valor del modelo también quede en uppercase, no solo la vista.
 *
 * Se usa en los inputs de código de la secuencia (código, días del mes y de
 * semana), combinado con `maxlength="10"` en el template.
 */
@Directive({
  selector: 'input[appUppercase]',
  standalone: true,
})
export class UppercaseDirective {
  private readonly host = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly ngControl = inject(NgControl, { optional: true });

  @HostListener('input')
  onInput(): void {
    const input = this.host.nativeElement;
    const upper = input.value.toUpperCase();
    if (input.value === upper) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;

    if (this.ngControl?.control) {
      this.ngControl.control.setValue(upper);
    }
    input.value = upper;
    if (start !== null && end !== null) input.setSelectionRange(start, end);
  }
}
