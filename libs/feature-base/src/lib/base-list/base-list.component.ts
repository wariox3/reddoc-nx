import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ConfirmationService, type MenuItem } from 'primeng/api';
import { finalize } from 'rxjs';
import {
  ENTITY_DATA_GATEWAY,
  EntityFilterStorageService,
  I18nService,
  MissingModuleContextError,
  ModuleNavigationStore,
  TenantService,
  ToastService,
  type ColumnDef,
  type DocumentEntityConfig,
  type EntityConfig,
  type FilterCondition,
  type ListQuery,
  type MasterEntityConfig,
  type SortSpec,
} from '@reddoc/core';

/**
 * Tamaño de página default. Se reemplaza por un valor del `EntityConfig`
 * cuando agreguemos `paginationDefaults` en una fase posterior.
 */
const DEFAULT_PAGE_SIZE = 25;

/** Entidades sobre las que el `BaseListComponent` opera (excluye utilities). */
type ListableEntityConfig = DocumentEntityConfig | MasterEntityConfig;

/**
 * Componente base de listado para entidades documentales y maestras.
 *
 * Responsabilidades:
 *  - Lee el `EntityConfig` activo vía `input.required` (resuelto por router).
 *  - Carga datos paginados desde `EntityDataGateway`.
 *  - Restaura filtros del usuario desde `EntityFilterStorageService`
 *    (clave versionada por `entity.schemaVersion`).
 *  - Renderiza la tabla con columnas declaradas en `entity.columns`.
 *  - Muestra acciones de toolbar y de fila según `entity.capabilities`.
 *
 * Lo que NO hace:
 *  - HTTP directo (delega en `ENTITY_DATA_GATEWAY` — DIP).
 *  - Conocer el módulo activo via parseo de URL (lee el `ModuleNavigationStore`).
 *  - Renderizar formularios o detalles (eso es BaseForm/BaseDetail).
 */
@Component({
  selector: 'lib-base-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, MenuModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './base-list.component.html',
  styleUrl: './base-list.component.scss',
})
export class BaseListComponent {
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
  /** Entidad activa inyectada por `activeEntityResolver` vía router binding. */
  readonly entity = input.required<EntityConfig>();

  // ── Estado interno ────────────────────────────────────────────────────────
  protected readonly items = signal<unknown[]>([]);
  protected readonly totalCount = signal(0);
  protected readonly isLoading = signal(false);
  protected readonly currentPage = signal(0);
  protected readonly pageSize = signal(DEFAULT_PAGE_SIZE);
  protected readonly sort = signal<readonly SortSpec[]>([]);
  protected readonly selectedRows = signal<unknown[]>([]);
  protected readonly activeFilters = signal<readonly FilterCondition[]>([]);

  // ── Derivados ─────────────────────────────────────────────────────────────
  /**
   * Estrecha la entidad activa a los kinds que soportan CRUD.
   * Si por error de routing llega una utility, lanza — fail-fast.
   */
  protected readonly listableEntity = computed<ListableEntityConfig>(() => {
    const current = this.entity();
    if (current.kind === 'utility') {
      throw new Error(
        `BaseListComponent cannot render utility entity '${current.id}'. Check routing.`,
      );
    }
    return current;
  });

  protected readonly columns = computed<readonly ColumnDef[]>(() => this.listableEntity().columns);
  protected readonly capabilities = computed(() => this.listableEntity().capabilities);
  protected readonly hasSelection = computed(() => this.selectedRows().length > 0);

  /** Id del módulo activo según el `ModuleNavigationStore`. */
  protected readonly activeModuleId = computed(() => {
    const moduleConfig = this.navigation.activeModule();
    if (!moduleConfig) throw new MissingModuleContextError();
    return moduleConfig.id;
  });

  constructor() {
    // Cuando cambia la entidad (navegación entre entidades del mismo módulo),
    // restauramos los filtros guardados y recargamos la lista.
    effect(() => {
      const currentEntity = this.entity();
      const moduleId = this.activeModuleId();
      const storedFilters = this.filterStorage.read(moduleId, currentEntity);
      this.activeFilters.set(storedFilters);
      this.selectedRows.set([]);
      this.currentPage.set(0);
      this.loadList();
    });
  }

  // ── API protegida (consumida por el template) ─────────────────────────────

  /** Acceso seguro a un campo arbitrario de la fila. */
  protected readValue(row: unknown, field: string): unknown {
    if (row === null || typeof row !== 'object') return null;
    return (row as Record<string, unknown>)[field];
  }

  protected buildRowMenuItems(row: unknown): MenuItem[] {
    const caps = this.capabilities();
    const id = this.extractId(row);
    const items: MenuItem[] = [];

    if (caps.canEdit && id !== null) {
      items.push({
        label: this.translate('common.actions.edit'),
        icon: 'pi pi-pencil',
        command: () => this.navigateToEdit(id),
      });
    }
    if (caps.canDelete && id !== null) {
      if (items.length > 0) items.push({ separator: true });
      items.push({
        label: this.translate('common.actions.delete'),
        icon: 'pi pi-trash',
        command: () => this.confirmRemove([id]),
      });
    }
    return items;
  }

  protected navigateToNew(): void {
    this.router.navigate(this.buildRouteCommands(this.listableEntity().routes.new));
  }

  protected onPageChange(event: { first: number; rows: number }): void {
    const nextPage = Math.floor(event.first / event.rows);
    if (nextPage === this.currentPage() && event.rows === this.pageSize()) return;
    this.currentPage.set(nextPage);
    this.pageSize.set(event.rows);
    this.loadList();
  }

  protected onSelectionChange(rows: unknown[]): void {
    this.selectedRows.set(rows);
  }

  protected removeSelected(): void {
    const ids = this.selectedRows()
      .map((row) => this.extractId(row))
      .filter((id): id is string | number => id !== null);
    if (ids.length === 0) return;
    this.confirmRemove(ids);
  }

  /**
   * Resuelve una clave i18n con notación de punto.
   * Si la clave no existe, devuelve la clave misma — facilita detectar
   * faltantes de traducción en desarrollo.
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

  // ── Internos ─────────────────────────────────────────────────────────────

  private loadList(): void {
    const query: ListQuery = {
      filters: this.activeFilters(),
      sort: this.sort(),
      page: this.currentPage(),
      pageSize: this.pageSize(),
    };

    this.isLoading.set(true);
    this.gateway
      .list(this.listableEntity(), query)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isLoading.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.items.set([...response.results]);
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
      .remove(this.listableEntity(), ids)
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
    this.router.navigate([...this.buildRouteCommands(this.listableEntity().routes.edit), id]);
  }

  /**
   * Construye los segmentos absolutos de ruta para navegación interna,
   * a partir de un `routePath` declarado en `entity.routes`.
   *
   * `routePath = 'master/contacto/list'` →
   *   ['/t', '<slug>', '<moduleId>', 'master', 'contacto', 'list']
   *
   * Centralizar esto evita duplicar la lógica de prefijo en cada llamada
   * a `router.navigate` y mantiene una única convención de URL.
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
