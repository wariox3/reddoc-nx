import { Component, computed, inject, input, output, viewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Menu, MenuModule } from 'primeng/menu';
import type { MenuItem } from 'primeng/api';
import { I18nService } from '@reddoc/core';
import type { AppDict } from '@erp/i18n';

/**
 * Botonera de acciones de un documento en su **vista de detalle**: Aprobar,
 * Imprimir y un dropdown "Opciones" (hoy con "Archivos"). Compartida por todas las
 * fichas de detalle (servicio, factura de venta y futuras).
 *
 * Es **presentacional**: renderiza los botones y emite eventos; cada ficha decide
 * qué hacer. Los botones se deshabilitan según el estado del documento vía los
 * inputs `can*` (todos habilitados por default; las fichas los cablearán a su estado).
 */
@Component({
  selector: 'app-document-detail-actions',
  standalone: true,
  imports: [ButtonModule, MenuModule],
  templateUrl: './document-detail-actions.component.html',
  styleUrl: './document-detail-actions.component.scss',
})
export class DocumentDetailActionsComponent {
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);
  protected readonly t = this.i18n.t;

  /** Habilita cada acción. Default `true`; las fichas los atan al estado del documento. */
  readonly canAprobar = input<boolean>(true);
  readonly canImprimir = input<boolean>(true);
  readonly canArchivos = input<boolean>(true);

  readonly aprobar = output<void>();
  readonly imprimir = output<void>();
  readonly archivos = output<void>();

  private readonly menu = viewChild.required<Menu>('menu');

  /**
   * Entradas del dropdown "Opciones". `computed` (ref estable salvo cambio real de
   * idioma o de `canArchivos`) para no recrear el array en cada CD — eso provoca
   * que `p-menu` pierda el primer click.
   */
  protected readonly opcionesMenu = computed<MenuItem[]>(() => [
    {
      label: this.t().documentActions.detail.archivos,
      icon: 'pi pi-folder',
      disabled: !this.canArchivos(),
      command: () => this.archivos.emit(),
    },
  ]);

  protected toggleOpciones(event: Event): void {
    this.menu().toggle(event);
  }
}
