import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { finalize } from 'rxjs';
import {
  ENTITY_DATA_GATEWAY,
  EntityFilterStorageService,
  I18nService,
  MissingModuleContextError,
  ModuleNavigationStore,
  TenantService,
  ToastService,
  buildEntityStorageKey,
  type DocumentEntityConfig,
  type FilterCondition,
  type ListQuery,
  type SortSpec,
} from '@reddoc/core';
import { DataTableComponent } from '../data-table/data-table.component';
import type {
  PageChangeEvent,
  RowAction,
  RowActionInvokedEvent,
} from '../data-table/data-table.types';

/** Tamaño de página default mientras `DocumentEntityConfig` no exponga `paginationDefaults`. */
const DEFAULT_PAGE_SIZE = 25;

/**
 * Componente base de listado para **documentos transaccionales** del framework
 * configuracional (camino A — ver docs/architecture).
 *
 * Recibe el `DocumentEntityConfig` por input (resuelto por `activeDocumentResolver`)
 * y compone `<lib-data-table>` con columnas, filtros y capacidades derivadas
 * del config.
 *
 * Responsabilidades:
 *  - Cargar datos paginados desde `EntityDataGateway`.
 *  - Restaurar filtros del usuario desde `EntityFilterStorageService`
 *    (clave versionada por `entity.schemaVersion`).
 *  - Mostrar acciones de toolbar y de fila según `capabilities`.
 *  - Navegar a las rutas `new` / `edit` / `detail` del documento.
 *
 * Lo que NO hace:
 *  - HTTP directo (delega en `ENTITY_DATA_GATEWAY` — DIP).
 *  - Conocer el módulo activo desde el URL (lee el `ModuleNavigationStore`).
 *  - Renderizar el form ni el detalle.
 */
@Component({
  selector: 'lib-base-document-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, ConfirmDialogModule, DataTableComponent],
  providers: [ConfirmationService],
  templateUrl: './base-document-list.component.html',
  styleUrl: './base-document-list.component.scss',
})
export class BaseDocumentListComponent {
  // ── Colaboradores inyectados ──────────────────────────────────────────────
  private readonly gateway = inject(ENTITY_DATA_GATEWAY);
  private readonly filterStorage = inject(EntityFilterStorageService);
  private readonly navigation = inject(ModuleNavigationStore);
  private readonly tenant = inject(TenantService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject<I18nService<unknown>>(I18nService);

  // ── Inputs ────────────────────────────────────────────────────────────────
  /** Documento activo inyectado por `activeDocumentResolver` vía router binding. */
  readonly document = input.required<DocumentEntityConfig>();

  // ── Estado interno ────────────────────────────────────────────────────────
  protected readonly items = signal<readonly unknown[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly isLoading = signal(false);
  protected readonly currentPage = signal(0);
  protected readonly pageSize = signal(DEFAULT_PAGE_SIZE);
  protected readonly sort = signal<readonly SortSpec[]>([]);
  protected readonly selectedRows = signal<readonly unknown[]>([]);
  protected readonly activeFilters = signal<readonly FilterCondition[]>([]);

  // ── Derivados ─────────────────────────────────────────────────────────────
  protected readonly columns = computed(() => this.document().columns);
  protected readonly capabilities = computed(() => this.document().capabilities);
  protected readonly hasSelection = computed(() => this.selectedRows().length > 0);

  /** Acciones disponibles desde el menú de cada fila, derivadas de capabilities. */
  protected readonly rowActions = computed<readonly RowAction[]>(() => {
    const caps = this.capabilities();
    const actions: RowAction[] = [];
    if (caps.canEdit) {
      actions.push({ id: 'edit', labelKey: 'common.actions.edit', iconClass: 'pi pi-pencil' });
    }
    if (caps.canDelete) {
      actions.push({
        id: 'delete',
        labelKey: 'common.actions.delete',
        iconClass: 'pi pi-trash',
        severity: 'danger',
      });
    }
    return actions;
  });

  /** Id del módulo activo según el `ModuleNavigationStore`. */
  protected readonly activeModuleId = computed(() => {
    const moduleConfig = this.navigation.activeModule();
    if (!moduleConfig) throw new MissingModuleContextError();
    return moduleConfig.id;
  });

  constructor() {
    // Cuando cambia el documento (navegación entre documentos del mismo módulo),
    // restauramos los filtros guardados y recargamos la lista.
    effect(() => {
      const currentDocument = this.document();
      const moduleId = this.activeModuleId();
      const storageKey = buildEntityStorageKey(moduleId, currentDocument);
      const storedFilters = this.filterStorage.read(storageKey);
      this.activeFilters.set(storedFilters);
      this.selectedRows.set([]);
      this.currentPage.set(0);
      this.loadList();
    });
  }

  // ── Handlers del template ─────────────────────────────────────────────────

  protected onPageChange(event: PageChangeEvent): void {
    this.currentPage.set(event.page);
    this.pageSize.set(event.pageSize);
    this.loadList();
  }

  protected onSelectionChange(rows: unknown[]): void {
    this.selectedRows.set(rows);
  }

  protected onRowAction(event: RowActionInvokedEvent): void {
    const id = this.extractId(event.row);
    if (id === null) return;
    switch (event.actionId) {
      case 'edit':
        this.navigateToEdit(id);
        break;
      case 'delete':
        this.confirmRemove([id]);
        break;
    }
  }

  protected navigateToNew(): void {
    this.router.navigate(this.buildRouteCommands(this.document().routes.new));
  }

  protected removeSelected(): void {
    const ids = this.selectedRows()
      .map((row) => this.extractId(row))
      .filter((id): id is string | number => id !== null);
    if (ids.length === 0) return;
    this.confirmRemove(ids);
  }

  /** Resuelve una clave i18n con notación de punto. */
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

  // ── Internos ──────────────────────────────────────────────────────────────

  private loadList(): void {
    const query: ListQuery = {
      filters: this.activeFilters(),
      sort: this.sort(),
      page: this.currentPage(),
      pageSize: this.pageSize(),
    };

    this.isLoading.set(true);
    this.gateway
      .list(this.document(), query)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.items.set(response.results);
          this.totalCount.set(response.totalCount);
        },
        error: () => {
          this.items.set([]);
          this.totalCount.set(0);
          this.toast.error(
            this.translate('common.toasts.loadError.title'),
            this.translate('common.toasts.loadError.desc'),
          );
        },
      });
  }

  private confirmRemove(ids: readonly (string | number)[]): void {
    this.confirmation.confirm({
      message: this.translate('common.confirms.deleteMessage'),
      header: this.translate('common.confirms.deleteHeader'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate('common.actions.delete'),
      rejectLabel: this.translate('common.actions.cancel'),
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.executeRemove(ids),
    });
  }

  private executeRemove(ids: readonly (string | number)[]): void {
    this.gateway
      .remove(this.document(), ids)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toast.success(
            this.translate('common.toasts.deleteSuccess.title'),
            this.translate('common.toasts.deleteSuccess.desc'),
          );
          this.selectedRows.set([]);
          this.loadList();
        },
        error: () => {
          this.toast.error(
            this.translate('common.toasts.deleteError.title'),
            this.translate('common.toasts.deleteError.desc'),
          );
        },
      });
  }

  private navigateToEdit(id: string | number): void {
    this.router.navigate([...this.buildRouteCommands(this.document().routes.edit), id]);
  }

  /**
   * Construye los segmentos absolutos de ruta para navegación interna,
   * a partir de un `routePath` declarado en `document.routes`.
   *
   * `routePath = 'documento/factura-compra/list'` →
   *   ['/t', '<slug>', '<moduleId>', 'documento', 'factura-compra', 'list']
   */
  private buildRouteCommands(routePath: string): (string | number)[] {
    const slug = this.tenant.currentSlug();
    if (!slug) throw new Error('Cannot navigate without an active tenant slug.');
    return ['/t', slug, this.activeModuleId(), ...routePath.split('/').filter(Boolean)];
  }

  private extractId(row: unknown): string | number | null {
    if (row === null || typeof row !== 'object') return null;
    const candidate = (row as Record<string, unknown>)['id'];
    if (typeof candidate === 'string' || typeof candidate === 'number') {
      return candidate;
    }
    return null;
  }
}
