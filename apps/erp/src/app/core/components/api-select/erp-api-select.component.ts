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
import { HttpClient, HttpParams } from '@angular/common/http';
import { ENVIRONMENT, PaginatedResponse } from '@reddoc/core';
import { SelectModule } from 'primeng/select';

export interface ErpSelectOption {
  readonly id: number;
  readonly nombre: string;
}

@Component({
  selector: 'app-api-select',
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
      [fluid]="true"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ErpApiSelectComponent),
      multi: true,
    },
  ],
})
export class ErpApiSelectComponent implements ControlValueAccessor, OnInit {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(ENVIRONMENT).apiUrl;
  private readonly destroyRef = inject(DestroyRef);

  readonly endpoint = input.required<string>();
  readonly params = input<Record<string, string>>({});
  readonly inputId = input<string>('');
  readonly placeholder = input<string>('Selecciona…');
  readonly invalid = input<boolean>(false);

  readonly value = signal<ErpSelectOption | null>(null);
  readonly disabled = signal(false);
  readonly options = signal<ErpSelectOption[]>([]);
  readonly loading = signal(false);

  private onChangeFn: (value: ErpSelectOption | null) => void = () => undefined;
  onTouchedFn: () => void = () => undefined;

  ngOnInit(): void {
    const rawParams = this.params();
    let httpParams = new HttpParams();
    for (const [key, val] of Object.entries(rawParams)) {
      httpParams = httpParams.set(key, val);
    }

    this.loading.set(true);
    this.http
      .get<PaginatedResponse<ErpSelectOption>>(`${this.baseUrl}${this.endpoint()}`, {
        params: httpParams,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.options.set(res.results);
          this.loading.set(false);
        },
        error: () => {
          this.options.set([]);
          this.loading.set(false);
        },
      });
  }

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
  }
}
