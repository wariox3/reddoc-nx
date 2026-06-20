import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import type { BreadcrumbItem } from '../breadcrumb/breadcrumb.types';

/**
 * Shell de página de listado: breadcrumb + card con cabecera (título) y un cuerpo
 * donde la botonera va **encima** de la tabla embebida en su propio recuadro con
 * borde sutil.
 *
 * Es "tonto" como el resto de building blocks: recibe `breadcrumb`/`title` y
 * **proyecta** la botonera y la tabla por slots. No conoce HTTP ni dominio; cada
 * página le pasa su `<lib-data-toolbar toolbar>` y `<lib-data-table table>` ya
 * configurados, y deja sus modales (filtros, confirm, import) fuera del shell por
 * ser overlays. El total de registros lo muestra el paginador de la tabla.
 *
 * ```html
 * <lib-list-shell [breadcrumb]="breadcrumbItems()" [title]="...">
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
}
