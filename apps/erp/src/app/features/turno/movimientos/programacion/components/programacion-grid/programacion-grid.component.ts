import { Component, computed, inject, input } from '@angular/core';
import { I18nService } from '@reddoc/core';
import type { AppDict } from '@erp/i18n';
import type { ProgramacionFecha, ProgramacionFila } from '../../programacion.model';

/** Grupo de filas que comparten `documento_detalle_id` (sección de la tabla). */
interface GrupoFilas {
  readonly documentoDetalleId: number;
  readonly puestoId: number | null;
  readonly puestoNombre: string | null;
  readonly contratoNombre: string | null;
  readonly items: readonly ProgramacionFila[];
}

/**
 * Grid (calendario de turnos) del detalle de programación — **presentacional**.
 *
 * Componente dedicado a este movimiento (no reutiliza la tabla de venta, solo su
 * diseño): un `<table>` propio con header sticky, columnas de día dinámicas
 * (desde `fechas`) y filas **agrupadas por `documento_detalle_id`** mediante una
 * fila-separadora por grupo.
 *
 * Es "tonto": recibe `fechas` + `filas` por input y no tiene HTTP ni estado de
 * negocio. Solo lectura por ahora (sin checkbox ni acciones; se sumarán luego).
 */
@Component({
  selector: 'app-programacion-grid',
  standalone: true,
  templateUrl: './programacion-grid.component.html',
  styleUrl: './programacion-grid.component.scss',
})
export class ProgramacionGridComponent {
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);
  protected readonly t = this.i18n.t;

  /** Columnas de día del calendario (ya normalizadas a `{ clave, etiqueta }`). */
  readonly fechas = input.required<readonly ProgramacionFecha[]>();

  /** Filas del calendario (se agrupan por `documento_detalle_id`). */
  readonly filas = input.required<readonly ProgramacionFila[]>();

  /** Filas agrupadas por `documento_detalle_id` para renderizar separadores. */
  protected readonly grupos = computed<readonly GrupoFilas[]>(() => {
    const result: GrupoFilas[] = [];
    for (const fila of this.filas()) {
      const last = result[result.length - 1];
      if (last && last.documentoDetalleId === fila.documento_detalle_id) {
        (last.items as ProgramacionFila[]).push(fila);
      } else {
        result.push({
          documentoDetalleId: fila.documento_detalle_id,
          puestoId: fila.puesto_id,
          puestoNombre: fila.puesto_nombre,
          contratoNombre: fila.contrato_nombre,
          items: [fila],
        });
      }
    }
    return result;
  });

  /**
   * Columnas totales para el `colspan` de la fila de grupo y el empty state:
   * 2 fijas izquierda (empleado, ct) + días + 4 fijas derecha (HD, HN, C, A).
   */
  protected readonly colspan = computed(() => 2 + this.fechas().length + 4);

  /** Valor visible de una celda de día (`fila.dias[clave]`), con fallback `—`. */
  protected celda(fila: ProgramacionFila, clave: string): string {
    const value = fila.dias[clave];
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    return '—';
  }

  /** Normaliza un número/valor resumen a texto (`—` si viene vacío). */
  protected resumen(value: number | null | undefined): string {
    return value === null || value === undefined ? '—' : String(value);
  }
}
