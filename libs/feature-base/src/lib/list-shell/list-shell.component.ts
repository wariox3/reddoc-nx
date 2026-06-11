import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { I18nService } from '@reddoc/core';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import type { BreadcrumbItem } from '../breadcrumb/breadcrumb.types';

/**
 * Shell de página de listado: breadcrumb + card con cabecera (título + contador)
 * y un cuerpo donde la botonera va **encima** de la tabla embebida en su propio
 * recuadro con borde sutil.
 *
 * Es "tonto" como el resto de building blocks: recibe `breadcrumb`/`title`/`count`
 * y **proyecta** la botonera y la tabla por slots. No conoce HTTP ni dominio; cada
 * página le pasa su `<lib-data-toolbar toolbar>` y `<lib-data-table table>` ya
 * configurados, y deja sus modales (filtros, confirm, import) fuera del shell por
 * ser overlays.
 *
 * ```html
 * <lib-list-shell [breadcrumb]="breadcrumbItems()" [title]="..." [count]="totalCount()">
 *   <lib-data-toolbar toolbar ... />
 *   <lib-data-table   table   ... />
 * </lib-list-shell>
 * ```
 */
@Component({
  selector: 'lib-list-shell',
  standalone: true,
  imports: [BreadcrumbComponent],
  templateUrl: './list-shell.component.html',
  styleUrl: './list-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListShellComponent {
  /** Trail de migajas ya traducido; se delega al `<lib-breadcrumb>` interno. */
  readonly breadcrumb = input.required<readonly BreadcrumbItem[]>();
  /** Título de la lista (ya traducido por el host). */
  readonly title = input.required<string>();
  /**
   * Total de registros. Cuando es `null` no se muestra el contador; cuando es un
   * número se pinta `"N registros"` bajo el título.
   */
  readonly count = input<number | null>(null);
  /** Clave i18n de la palabra que acompaña al contador. */
  readonly recordsLabelKey = input<string>('common.list.records');

  private readonly i18n = inject<I18nService<unknown>>(I18nService);

  /**
   * Resuelve una clave i18n con notación de punto contra el diccionario activo.
   * Mismo helper que `data-table`/`data-toolbar`; si la clave no existe devuelve
   * la clave misma.
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
