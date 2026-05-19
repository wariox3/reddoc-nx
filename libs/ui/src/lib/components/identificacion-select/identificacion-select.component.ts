import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Identificacion, IdentificacionService } from '@reddoc/core';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'lib-identificacion-select',
  standalone: true,
  imports: [SelectModule, FormsModule],
  template: `
    <p-select
      [inputId]="inputId()"
      [options]="options()"
      [ngModel]="value()"
      (ngModelChange)="onValueChange($event)"
      (onBlur)="onTouchedFn()"
      [placeholder]="placeholder()"
      [disabled]="disabled() || loading()"
      [invalid]="invalid()"
      [loading]="loading()"
      optionLabel="nombre"
      dataKey="id"
      appendTo="body"
      styleClass="w-full"
      [fluid]="true"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IdentificacionSelectComponent),
      multi: true,
    },
  ],
})
export class IdentificacionSelectComponent implements ControlValueAccessor, OnInit {
  private readonly identificacionService = inject(IdentificacionService);
  private readonly destroyRef = inject(DestroyRef);

  readonly placeholder = input<string>('Selecciona…');
  readonly inputId = input<string>('');
  readonly invalid = input<boolean>(false);

  readonly value = signal<Identificacion | null>(null);
  readonly disabled = signal(false);
  readonly options = signal<Identificacion[]>([]);
  readonly loading = signal(false);

  private onChangeFn: (value: Identificacion | null) => void = () => undefined;
  onTouchedFn: () => void = () => undefined;

  ngOnInit(): void {
    this.loading.set(true);
    this.identificacionService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.options.set(items);
          this.loading.set(false);
        },
        error: () => {
          this.options.set([]);
          this.loading.set(false);
        },
      });
  }

  writeValue(value: Identificacion | null): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: Identificacion | null) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onValueChange(next: Identificacion | null): void {
    this.value.set(next);
    this.onChangeFn(next);
  }
}
