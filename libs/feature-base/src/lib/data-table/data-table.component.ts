import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import type { MenuItem, SortMeta } from 'primeng/api';
import { I18nService, type ColumnDef, type SortSpec } from '@reddoc/core';
import type { PageChangeEvent, RowAction, RowActionInvokedEvent } from './data-table.types';
import { multiSortMetaToSpecs, sortSpecsEqual } from './sort.util';

/**
 * Componente "tonto" de tabla de datos.
 *
 * Recibe todo por inputs concretos y emite eventos. **No** conoce:
 *   - HTTP ni gateway
 *   - `EntityConfig`, `ModuleConfig` ni nada del framework configuracional
 *   - El módulo activo, la entidad activa, los permisos
 *
 * Es el building block compartido por:
 *   - Páginas de masters (`features/<x>/pages/<y>-list/...`)
 *   - `BaseDocumentListComponent` que lo compone internamente
 *
 * El único acoplamiento es con `I18nService` para traducir claves de columna y
 * de acciones. Eso es aceptable porque el dict es genérico (`unknown`) y solo
 * lo usa para resolver strings.
 */
@Component({
  selector: 'lib-data-table',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, MenuModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent {
  // ── Inputs requeridos ─────────────────────────────────────────────────────
  readonly columns = input.required<readonly ColumnDef[]>();
  readonly items = input.required<readonly unknown[]>();

  // ── Inputs opcionales ─────────────────────────────────────────────────────
  readonly totalCount = input<number>(0);
  readonly loading = input<boolean>(false);
  readonly pageSize = input<number>(25);
  readonly currentPage = input<number>(0);
  readonly rowsPerPageOptions = input<readonly number[]>([10, 25, 50, 100]);
  readonly selectionMode = input<'none' | 'multiple'>('none');
  readonly selectedRows = input<readonly unknown[]>([]);
  /**
   * Ordenamiento activo (controlado por el host). Refleja el estado en los
   * iconos de los headers tras recargar o rehidratar desde storage.
   */
  readonly sort = input<readonly SortSpec[]>([]);
  readonly rowActions = input<readonly RowAction[]>([]);
  readonly dataKey = input<string>('id');
  readonly emptyTitleKey = input<string>('common.list.empty.title');
  readonly emptySubKey = input<string>('common.list.empty.sub');
  readonly rowMenuLabelKey = input<string>('common.actions.menuLabel');

  // ── Outputs ───────────────────────────────────────────────────────────────
  readonly pageChange = output<PageChangeEvent>();
  readonly sortChange = output<readonly SortSpec[]>();
  readonly selectionChange = output<unknown[]>();
  readonly rowActionInvoked = output<RowActionInvokedEvent>();

  // ── Colaboradores ─────────────────────────────────────────────────────────
  private readonly i18n = inject<I18nService<unknown>>(I18nService);

  // ── Derivados expuestos al template ───────────────────────────────────────
  protected readonly hasSelection = computed(() => this.selectionMode() !== 'none');

  /**
   * PrimeNG requiere arrays mutables en sus inputs `[value]`, `[selection]`
   * y `[rowsPerPageOptions]`. Los inputs del componente son `readonly` para
   * proteger a los consumidores; los exponemos como copias mutables aquí.
   */
  protected readonly mutableItems = computed(() => [...this.items()]);
  protected readonly mutableSelection = computed(() => [...this.selectedRows()]);
  protected readonly mutableRowsPerPage = computed(() => [...this.rowsPerPageOptions()]);

  /**
   * `sort` (contrato propio) traducido al formato `SortMeta[]` de PrimeNG.
   * `asc` → `order: 1`, `desc` → `order: -1`.
   */
  protected readonly primeSort = computed<SortMeta[]>(() =>
    this.sort().map((spec) => ({ field: spec.field, order: spec.direction === 'desc' ? -1 : 1 })),
  );

  // ── API protegida (template) ──────────────────────────────────────────────

  /**
   * Lee un campo arbitrario de una fila.
   * Las filas se tipan como `unknown` porque cada consumidor sabe su shape;
   * este componente solo proyecta los campos declarados por `columns`.
   */
  protected readValue(row: unknown, field: string): unknown {
    if (row === null || typeof row !== 'object') return null;
    return (row as Record<string, unknown>)[field];
  }

  /**
   * Construye los `MenuItem` de PrimeNG para una fila concreta a partir
   * de las acciones declaradas y su predicado `visibleFor`.
   */
  protected buildRowMenuItems(row: unknown): MenuItem[] {
    return this.rowActions()
      .filter((action) => action.visibleFor?.(row) ?? true)
      .map((action) => ({
        label: this.translate(action.labelKey),
        icon: action.iconClass,
        styleClass: action.severity === 'danger' ? 'lib-data-table__menu-item--danger' : undefined,
        command: () => this.rowActionInvoked.emit({ actionId: action.id, row }),
      }));
  }

  /**
   * Resuelve una clave i18n con notación de punto contra el diccionario activo.
   * Si la clave no existe devuelve la clave misma — facilita detectar
   * traducciones faltantes en desarrollo.
   */
  protected translate(key: string): string {
    const dict = this.i18n.t();
    const parts = key.split('.');
    let current: unknown = dict;
    for (const part of parts) {
      if (current === null || typeof current !== 'object') return key;
      current = (current as Record<string, unknown>)[part];
    }
    return typeof current === 'string' ? current : key;
  }

  protected onPageEvent(event: { first: number; rows: number }): void {
    const nextPage = Math.floor(event.first / event.rows);
    if (nextPage === this.currentPage() && event.rows === this.pageSize()) return;
    this.pageChange.emit({ page: nextPage, pageSize: event.rows });
  }

  protected onSelectionEvent(rows: unknown[] | unknown): void {
    this.selectionChange.emit(Array.isArray(rows) ? rows : [rows]);
  }

  /**
   * Traduce el evento de ordenamiento multi-columna de PrimeNG
   * (`multiSortMeta`) al contrato `SortSpec[]` y lo emite.
   *
   * PrimeNG dispara `onSort` también al inicializar `[multiSortMeta]`; el guard
   * evita re-emitir (y recargar) cuando el orden no cambió respecto al input.
   */
  protected onSortEvent(event: { multiSortMeta?: SortMeta[] | null }): void {
    const specs = multiSortMetaToSpecs(event.multiSortMeta);
    if (sortSpecsEqual(this.sort(), specs)) return;
    this.sortChange.emit(specs);
  }
}
