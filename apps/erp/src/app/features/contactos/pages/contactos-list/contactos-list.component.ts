import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { finalize } from 'rxjs';
import {
  FilterStorageService,
  I18nService,
  TenantService,
  ToastService,
  type ColumnDef,
  type FilterCondition,
  type ListQuery,
  type SortSpec,
} from '@reddoc/core';
import {
  DataTableComponent,
  DataToolbarComponent,
  type PageChangeEvent,
  type RowAction,
  type RowActionInvokedEvent,
  type ToolbarAction,
} from '@reddoc/feature-base';
import { ContactoService } from '../../services/contacto.service';
import type { Contacto } from '../../models/contacto.model';
import type { AppDict } from '../../../../i18n';

/** Clave de localStorage para los filtros de esta página. Incluye `v1`. */
const CONTACTOS_FILTERS_STORAGE_KEY = 'contactos:filters:v1';

/** Acciones disponibles desde el menú de cada fila. */
const ROW_ACTIONS: readonly RowAction[] = [
  { id: 'edit', labelKey: 'common.actions.edit', iconClass: 'pi pi-pencil' },
  { id: 'delete', labelKey: 'common.actions.delete', iconClass: 'pi pi-trash', severity: 'danger' },
];

/** Acción primaria de la toolbar. */
const PRIMARY_ACTION: ToolbarAction = {
  id: 'new',
  labelKey: 'common.actions.new',
  iconClass: 'pi pi-plus',
};

/** Acciones secundarias (exportar, importar). */
const TRAILING_ACTIONS: readonly ToolbarAction[] = [
  { id: 'export', labelKey: 'common.actions.exportExcel', iconClass: 'pi pi-file-excel' },
  { id: 'import', labelKey: 'common.actions.import', iconClass: 'pi pi-upload' },
];

/**
 * Listado de contactos.
 *
 * Master administrativo en su propio feature (`features/contactos/`):
 * bounded context propio que albergará lógica de cliente/proveedor/empleado,
 * segmentación, historial transaccional, etc.
 *
 * Camino B del enfoque híbrido: feature directo que compone los building
 * blocks compartidos (`<lib-data-toolbar>` + `<lib-data-table>`) dentro de
 * un wrapper `.card`. No usa `EntityConfig`, registry, resolvers ni
 * navigation store.
 */
@Component({
  selector: 'app-contactos-list',
  standalone: true,
  imports: [DataTableComponent, DataToolbarComponent, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './contactos-list.component.html',
  styleUrl: './contactos-list.component.scss',
})
export class ContactosListComponent {
  // ── Colaboradores ─────────────────────────────────────────────────────────
  private readonly service = inject(ContactoService);
  private readonly filterStorage = inject(FilterStorageService);
  private readonly tenant = inject(TenantService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  protected readonly t = this.i18n.t;

  // ── Estado ────────────────────────────────────────────────────────────────
  protected readonly items = signal<readonly Contacto[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly isLoading = signal(false);
  protected readonly currentPage = signal(0);
  protected readonly pageSize = signal(25);
  protected readonly sort = signal<readonly SortSpec[]>([]);
  protected readonly selectedRows = signal<readonly Contacto[]>([]);
  protected readonly searchValue = signal('');
  protected readonly activeFilters = signal<readonly FilterCondition[]>(
    this.filterStorage.read(CONTACTOS_FILTERS_STORAGE_KEY),
  );

  // ── Derivados ─────────────────────────────────────────────────────────────
  protected readonly hasSelection = computed(() => this.selectedRows().length > 0);
  protected readonly rowActions = ROW_ACTIONS;
  protected readonly primaryAction = PRIMARY_ACTION;
  protected readonly trailingActions = TRAILING_ACTIONS;

  /** Columnas declaradas literalmente en el feature. */
  protected readonly columns: readonly ColumnDef[] = [
    {
      field: 'id',
      headerKey: 'entities.contacto.columns.id',
      type: 'number',
      width: '70px',
      align: 'right',
      sortable: true,
    },
    {
      field: 'nombre_corto',
      headerKey: 'entities.contacto.columns.nombre',
      type: 'text',
      sortable: true,
    },
    {
      field: 'numero_identificacion',
      headerKey: 'entities.contacto.columns.identificacion',
      type: 'text',
      sortable: true,
    },
    {
      field: 'correo',
      headerKey: 'entities.contacto.columns.correo',
      type: 'text',
    },
    {
      field: 'telefono',
      headerKey: 'entities.contacto.columns.telefono',
      type: 'text',
    },
  ];

  constructor() {
    this.loadList();
  }

  // ── Handlers del template ─────────────────────────────────────────────────

  protected onPageChange(event: PageChangeEvent): void {
    this.currentPage.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadList();
  }

  protected onSelectionChange(rows: unknown[]): void {
    this.selectedRows.set(rows as Contacto[]);
  }

  protected onRowAction(event: RowActionInvokedEvent): void {
    const contacto = event.row as Contacto;
    switch (event.actionId) {
      case 'edit':
        this.navigateToEdit(contacto.id);
        break;
      case 'delete':
        this.confirmRemove([contacto.id]);
        break;
    }
  }

  protected onToolbarAction(actionId: string): void {
    switch (actionId) {
      case 'new':
        this.router.navigate(this.buildRouteCommands('new'));
        break;
      case 'export':
        // TODO: implementar exportación a Excel
        break;
      case 'import':
        // TODO: implementar importación
        break;
    }
  }

  protected onSearchChange(value: string): void {
    this.searchValue.set(value);
    // TODO: aplicar búsqueda al query del backend cuando se conecte.
  }

  protected onRefresh(): void {
    this.loadList();
  }

  protected removeSelected(): void {
    const ids = this.selectedRows().map((c) => c.id);
    if (ids.length === 0) return;
    this.confirmRemove(ids);
  }

  // ── Internos ──────────────────────────────────────────────────────────────

  private loadList(): void {
    const query: ListQuery = {
      filters: this.activeFilters(),
      sort: this.sort(),
      page: this.currentPage(),
      pageSize: this.pageSize(),
    };

    this.isLoading.set(true);
    this.service
      .list(query)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.items.set(response.results);
          this.totalCount.set(response.count);
        },
        error: () => {
          this.items.set([]);
          this.totalCount.set(0);
          this.toast.error(
            this.t().common.toasts.loadError.title,
            this.t().common.toasts.loadError.desc,
          );
        },
      });
  }

  private confirmRemove(ids: readonly number[]): void {
    this.confirmation.confirm({
      header: this.t().common.confirms.deleteHeader,
      message: this.t().common.confirms.deleteMessage,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.t().common.actions.delete,
      rejectLabel: this.t().common.actions.cancel,
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.executeRemove(ids),
    });
  }

  private executeRemove(ids: readonly number[]): void {
    this.service
      .remove(ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success(
            this.t().common.toasts.deleteSuccess.title,
            this.t().common.toasts.deleteSuccess.desc,
          );
          this.selectedRows.set([]);
          this.loadList();
        },
        error: () => {
          this.toast.error(
            this.t().common.toasts.deleteError.title,
            this.t().common.toasts.deleteError.desc,
          );
        },
      });
  }

  private navigateToEdit(id: number): void {
    this.router.navigate(this.buildRouteCommands('edit', id));
  }

  /**
   * Construye los segmentos absolutos para `router.navigate` dentro del feature.
   * Resulta en `/t/<slug>/contactos/<...path>`.
   */
  private buildRouteCommands(...subPath: (string | number)[]): (string | number)[] {
    const slug = this.tenant.currentSlug();
    if (!slug) throw new Error('Cannot navigate without an active tenant slug.');
    return ['/t', slug, 'contactos', ...subPath];
  }
}
