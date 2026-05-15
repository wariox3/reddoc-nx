import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { Ciudad, CiudadService } from '@reddoc/core';

@Component({
  selector: 'lib-ciudad-autocomplete',
  standalone: true,
  imports: [AutoCompleteModule, FormsModule],
  template: `
    <div class="relative w-full">
      <i
        class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-[0.78rem] text-brand-muted pointer-events-none z-10"
        aria-hidden="true"
      ></i>
      <p-autocomplete
        [inputId]="inputId()"
        [ngModel]="value()"
        (ngModelChange)="onValueChange($event)"
        (onBlur)="onTouchedFn()"
        [suggestions]="suggestions()"
        (completeMethod)="onSearch($event)"
        [optionLabel]="'nombre'"
        [forceSelection]="true"
        [minLength]="2"
        [delay]="300"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [invalid]="invalid()"
        [fluid]="true"
        [showClear]="true"
        appendTo="body"
        autocomplete="off"
        styleClass="w-full"
        inputStyleClass="w-full !pl-9"
      >
        <ng-template pTemplate="item" let-ciudad>
          <div class="flex items-center gap-2 py-0.5">
            <i class="pi pi-map-marker text-[0.7rem] text-brand-muted"></i>
            <span class="text-[0.85rem] text-brand-text">{{ ciudad.nombre }}</span>
          </div>
        </ng-template>
        <ng-template pTemplate="empty">
          <span class="block px-3 py-2 text-[0.78rem] text-brand-muted">
            Sin resultados. Sigue escribiendo.
          </span>
        </ng-template>
      </p-autocomplete>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CiudadAutocompleteComponent),
      multi: true,
    },
  ],
})
export class CiudadAutocompleteComponent implements ControlValueAccessor {
  private readonly ciudadService = inject(CiudadService);
  private readonly destroyRef = inject(DestroyRef);

  readonly placeholder = input<string>('Buscar ciudad…');
  readonly inputId = input<string>('');
  readonly invalid = input<boolean>(false);

  readonly value = signal<Ciudad | null>(null);
  readonly disabled = signal(false);
  readonly suggestions = signal<Ciudad[]>([]);

  private onChangeFn: (value: Ciudad | null) => void = () => undefined;
  onTouchedFn: () => void = () => undefined;

  writeValue(value: Ciudad | null): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: Ciudad | null) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onValueChange(next: Ciudad | null): void {
    this.value.set(next);
    this.onChangeFn(next);
  }

  onSearch(event: AutoCompleteCompleteEvent): void {
    const query = event.query?.trim() ?? '';
    this.ciudadService
      .search(query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => this.suggestions.set(items),
        error: () => this.suggestions.set([]),
      });
  }
}
