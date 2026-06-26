import { Component, computed, inject, input, output } from '@angular/core';
import { I18nService } from '@reddoc/core';
import type { AppDict } from '@erp/i18n';
import type { ProgramacionFecha, ProgramacionFila } from '../../programacion.model';

/** Grupo de filas que comparten `documento_detalle_id` — un puesto. */
interface GrupoFilas {
  readonly documentoDetalleId: number;
  readonly puestoId: number | null;
  readonly puestoNombre: string | null;
  readonly items: readonly ProgramacionFila[];
}

/**
 * Identidad de un grupo (puesto) que el grid emite al pedir sus empleados.
 * Lo consume el padre para abrir el modal correspondiente.
 */
export interface ProgramacionGrupoRef {
  readonly documentoDetalleId: number;
  readonly puestoId: number | null;
  readonly puestoNombre: string | null;
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

  /** Pide ver los empleados de un grupo (puesto). El padre abre el modal. */
  readonly verEmpleados = output<ProgramacionGrupoRef>();

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
          items: [fila],
        });
      }
    }
    return result;
  });

  /**
   * Columnas totales para el `colspan` de la fila de grupo y el empty state:
   * 2 fijas izquierda (empleado, ct) + días + 4 resumen (HD, HN, C, A) +
   * 2 reservadas para opciones por fila.
   */
  protected readonly colspan = computed(() => 2 + this.fechas().length + 4 + 2);

  /** Emite la identidad del puesto (la agrupación) para abrir el modal. */
  protected onVerEmpleados(grupo: GrupoFilas): void {
    this.verEmpleados.emit({
      documentoDetalleId: grupo.documentoDetalleId,
      puestoId: grupo.puestoId,
      puestoNombre: grupo.puestoNombre,
    });
  }

  /** Código del turno del día (`fila.dias[clave].turno_codigo`), con fallback `—`. */
  protected celda(fila: ProgramacionFila, clave: string): string {
    return fila.dias[clave]?.turno_codigo ?? '—';
  }

  /** `true` si el día es festivo (para resaltarlo sutilmente). */
  protected esFestivo(fila: ProgramacionFila, clave: string): boolean {
    return fila.dias[clave]?.festivo ?? false;
  }

  /** Total de horas diurnas de la fila (suma de los días). */
  protected horasDiurnas(fila: ProgramacionFila): number {
    return this.sumarHoras(fila, 'horas_diurnas');
  }

  /** Total de horas nocturnas de la fila (suma de los días). */
  protected horasNocturnas(fila: ProgramacionFila): number {
    return this.sumarHoras(fila, 'horas_nocturnas');
  }

  private sumarHoras(fila: ProgramacionFila, campo: 'horas_diurnas' | 'horas_nocturnas'): number {
    return Object.values(fila.dias).reduce((acc, celda) => acc + (celda?.[campo] ?? 0), 0);
  }

  /** Normaliza un número resumen a texto (`—` si viene vacío). */
  protected resumen(value: number | null | undefined): string {
    return value === null || value === undefined ? '—' : String(value);
  }
}
