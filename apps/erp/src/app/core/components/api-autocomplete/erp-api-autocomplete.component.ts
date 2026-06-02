import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewChild,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ErpSelectDataService, ErpSelectOption } from '@erp/core/data/erp-select-data.service';

@Component({
  selector: 'app-api-autocomplete',
  standalone: true,
  imports: [AutoCompleteModule, FormsModule],
  template: `
    <p-autocomplete
      [inputId]="inputId()"
      [ngModel]="value()"
      (onSelect)="onValueChange($event.value)"
      (onClear)="onValueChange(null)"
      (onBlur)="onTouchedFn()"
      [suggestions]="suggestions()"
      (completeMethod)="onSearch($event)"
      (onFocus)="onFocusInput()"
      optionLabel="nombre"
      dataKey="id"
      [forceSelection]="true"
      [minLength]="minLength()"
      [delay]="delay()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [invalid]="invalid()"
      [fluid]="true"
      [showClear]="true"
      appendTo="body"
      autocomplete="off"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ErpApiAutocompleteComponent),
      multi: true,
    },
  ],
})
export class ErpApiAutocompleteComponent implements ControlValueAccessor {
  private readonly dataService = inject(ErpSelectDataService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(AutoComplete) private readonly ac?: AutoComplete;

  readonly endpoint = input.required<string>();
  readonly searchParam = input<string>('search');
  readonly inputId = input<string>('');
  readonly placeholder = input<string>('Buscar…');
  readonly invalid = input<boolean>(false);
  readonly minLength = input<number>(2);
  readonly delay = input<number>(400);

  readonly value = signal<ErpSelectOption | null>(null);
  readonly disabled = signal(false);
  readonly suggestions = signal<ErpSelectOption[]>([]);

  private onChangeFn: (value: ErpSelectOption | null) => void = () => undefined;
  onTouchedFn: () => void = () => undefined;
  private skipNextFocus = false;

  writeValue(value: ErpSelectOption | null): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: ErpSelectOption | null) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onValueChange(next: ErpSelectOption | null): void {
    this.value.set(next);
    this.onChangeFn(next);
    if (next !== null) this.skipNextFocus = true;
  }

  onFocusInput(): void {
    if (this.skipNextFocus) {
      this.skipNextFocus = false;
      return;
    }
    if (this.suggestions().length > 0) {
      this.ac?.show();
      return;
    }
    this.dataService
      .fetchOptions(this.endpoint())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (options) => {
          this.suggestions.set(options);
          setTimeout(() => this.ac?.show());
        },
        error: () => this.suggestions.set([]),
      });
  }

  onSearch(event: AutoCompleteCompleteEvent): void {
    const query = event.query?.trim() ?? '';
    this.dataService
      .fetchOptions(this.endpoint(), { [this.searchParam()]: query })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (options) => this.suggestions.set(options),
        error: () => this.suggestions.set([]),
      });
  }
}
