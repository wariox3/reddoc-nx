import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import type { MenuItem } from 'primeng/api';
import { I18nService } from '@reddoc/core';
import type { ToolbarAction } from './data-toolbar.types';

/**
 * Toolbar/header tonto para listados. Composición pura: recibe inputs,
 * emite eventos. No conoce HTTP, dominio ni la tabla bajo la cual vive.
 *
 * Diseñado para componerse con `<lib-data-table>` dentro de un wrapper
 * `.card` del feature page (ver `apps/erp/src/app/features/contactos/`).
 *
 * Layout (una sola fila, densidad calmada de ERP administrativo):
 *
 *   [search] [filtros] ←spacer→ [delete N] │ [trailing...] [refresh] [primary]
 *
 * Pasos comunes:
 *  - `searchEnabled` → input de búsqueda con icono e indicador de clear.
 *  - `filtersEnabled` → botón "Filtros" con badge de count; aparece "Limpiar"
 *    cuando `activeFiltersCount > 0`.
 *  - `deleteSelectedEnabled` + `deleteSelectedCount > 0` → botón danger
 *    contextual a la izquierda del divisor.
 *  - `trailingActions` → array declarativo (exportar, importar, etc.).
 *  - `refreshEnabled` → ícono-solo con tooltip.
 *  - `primaryAction` → un botón destacado a la derecha (Nuevo).
 *
 * Para casos especiales que no cubre este toolbar, el feature page puede:
 *  - Pasar la acción como una más en `trailingActions` y manejarla por id.
 *  - Componer un botón propio al lado de `<lib-data-toolbar>` dentro de la card.
 *  - Ignorar este componente y armar su HTML.
 */
@Component({
  selector: 'lib-data-toolbar',
  standalone: true,
  imports: [CommonModule, TooltipModule, MenuModule],
  templateUrl: './data-toolbar.component.html',
  styleUrl: './data-toolbar.component.scss',
})
export class DataToolbarComponent {
  // ── Búsqueda ──────────────────────────────────────────────────────────────
  readonly searchEnabled = input<boolean>(false);
  readonly searchValue = input<string>('');
  readonly searchPlaceholderKey = input<string>('common.search.placeholder');
  readonly search = output<string>();

  // ── Filtros ───────────────────────────────────────────────────────────────
  readonly filtersEnabled = input<boolean>(false);
  readonly activeFiltersCount = input<number>(0);
  readonly filtersToggle = output<void>();
  readonly filtersClear = output<void>();

  // ── Refresh ───────────────────────────────────────────────────────────────
  readonly refreshEnabled = input<boolean>(false);
  readonly refresh = output<void>();

  // ── Delete contextual ─────────────────────────────────────────────────────
  readonly deleteSelectedEnabled = input<boolean>(false);
  readonly deleteSelectedCount = input<number>(0);
  readonly deleteSelected = output<void>();

  // ── Acciones declarativas ────────────────────────────────────────────────
  readonly primaryAction = input<ToolbarAction | null>(null);
  readonly trailingActions = input<readonly ToolbarAction[]>([]);
  readonly actionInvoked = output<string>();

  // ── Colaboradores ─────────────────────────────────────────────────────────
  private readonly i18n = inject<I18nService<unknown>>(I18nService);

  // ── API protegida (template) ──────────────────────────────────────────────

  protected toMenuItems(children: readonly ToolbarAction[]): MenuItem[] {
    return children.map((child) => ({
      label: this.translate(child.labelKey),
      icon: child.iconClass,
      command: () => this.actionInvoked.emit(child.id),
    }));
  }

  protected onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.emit(value);
  }

  protected clearSearch(): void {
    this.search.emit('');
  }

  /**
   * Resuelve una clave i18n con notación de punto contra el diccionario activo.
   * Devuelve la clave misma si no existe — facilita detectar faltantes en dev.
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
}
