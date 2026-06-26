import { Component, DestroyRef, type OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { I18nService, TenantService, ToastService } from '@reddoc/core';
import { BreadcrumbComponent, type BreadcrumbItem } from '@reddoc/feature-base';
import type { AppDict } from '@erp/i18n';
import { ProgramacionService } from '../../programacion.service';
import { PROGRAMACION_LIST_PATH } from '../../programacion.constants';
import type {
  ProgramacionDetalleRead,
  ProgramacionDetalleResponse,
  ProgramacionFecha,
  ProgramacionFila,
} from '../../programacion.model';
import { ProgramacionGridComponent } from '../../components/programacion-grid/programacion-grid.component';

/** Cabecera legible de la programación para la ficha. */
interface CabeceraView {
  readonly numero: string | null;
  readonly fecha: Date | null;
  readonly identificacion: string | null;
  readonly contacto: string | null;
  readonly horas: number | null;
  readonly horasDiurnas: number | null;
  readonly horasNocturnas: number | null;
}

/** Datos del grid (calendario) ya normalizados para el componente. */
interface GridView {
  readonly fechas: readonly ProgramacionFecha[];
  readonly filas: readonly ProgramacionFila[];
}

/**
 * Normaliza una entrada cruda de `fechas` a `{ clave, etiqueta }`.
 *
 * TENTATIVO: el backend manda `fechas` vacío en el ejemplo. Tolera string ISO
 * (`'2026-06-01'`) u objeto (`{ fecha | clave | dia, dia | etiqueta }`); se ajusta
 * cuando se confirme el shape real.
 */
function toProgramacionFecha(raw: unknown, index: number): ProgramacionFecha {
  if (typeof raw === 'string') {
    const dia = raw.slice(8, 10).replace(/^0/, '');
    return { clave: raw, etiqueta: dia || raw };
  }
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const clave = String(obj['fecha'] ?? obj['clave'] ?? obj['dia'] ?? index);
    const etiqueta = String(obj['dia'] ?? obj['etiqueta'] ?? obj['fecha'] ?? index + 1);
    return { clave, etiqueta };
  }
  return { clave: String(index), etiqueta: String(index + 1) };
}

/**
 * Ficha (detalle) de una **programación** — solo lectura.
 *
 * Movimiento del módulo Turno. Llega desde el listado (`detalle/:id`). Replica
 * el shape visual de la ficha de documentos (factura de venta): encabezado con
 * volver + sección "Información general".
 *
 * WIP: la tabla de líneas / resumen aún no se arma. El shape de la respuesta de
 * `GET /turno/programacion/detalle/?documento=…` está pendiente de confirmar, así
 * que se loguea en consola y el mapeo de `CabeceraView` es tentativo.
 */
@Component({
  selector: 'app-programacion-detail',
  standalone: true,
  imports: [ButtonModule, BreadcrumbComponent, ProgramacionGridComponent],
  templateUrl: './programacion-detail.component.html',
  styleUrl: './programacion-detail.component.scss',
})
export class ProgramacionDetailComponent implements OnInit {
  private readonly service = inject(ProgramacionService);
  private readonly tenant = inject(TenantService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  protected readonly t = this.i18n.t;

  /** Id de la programación (route param `:id`, vía `withComponentInputBinding`). */
  readonly id = input<string>();

  protected readonly cabecera = signal<CabeceraView | null>(null);
  protected readonly grid = signal<GridView | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly notFound = signal(false);

  /** Migas: módulo Turno → listado de programaciones → registro abierto. */
  protected readonly breadcrumbItems = computed<readonly BreadcrumbItem[]>(() => {
    const slug = this.tenant.currentSlug();
    return [
      {
        label: this.t().modules.turno.name,
        routerLink: slug ? ['/t', slug, 'turno'] : undefined,
      },
      {
        label: this.t().entities.programacion.name,
        routerLink: slug ? ['/t', slug, ...PROGRAMACION_LIST_PATH] : undefined,
      },
      { label: `#${this.id() ?? ''}` },
    ];
  });

  ngOnInit(): void {
    const rawId = this.id();
    const id = rawId != null ? Number(rawId) : NaN;
    if (!Number.isFinite(id)) {
      this.isLoading.set(false);
      this.notFound.set(true);
      return;
    }
    this.loadDetalle(id);
  }

  protected onBack(): void {
    const slug = this.tenant.currentSlug();
    if (!slug) return;
    void this.router.navigate(['/t', slug, ...PROGRAMACION_LIST_PATH]);
  }

  /** Fecha larga de la cabecera (`20 de junio de 2026`). */
  protected formatFecha(date: Date | null): string {
    if (!date) return '—';
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  /**
   * Carga el detalle de la programación por el id del documento de la fila.
   *
   * El mapeo a `CabeceraView` es tentativo hasta confirmar el shape de la
   * respuesta (logueado en consola).
   */
  private loadDetalle(id: number): void {
    this.service
      .getDetalle(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detalle) => {
          console.log('[programacion-detail] detalle?documento=' + id + ':', detalle);
          const read = detalle as ProgramacionDetalleRead;
          this.cabecera.set({
            numero: read.numero ?? null,
            fecha: read.fecha ? new Date(read.fecha) : null,
            identificacion: read.tercero_numero_identificacion ?? null,
            contacto: read.contacto_nombre ?? null,
            horas: read.horas ?? null,
            horasDiurnas: read.horas_diurnas ?? null,
            horasNocturnas: read.horas_nocturnas ?? null,
          });
          this.grid.set(this.parseGrid(detalle));
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.notFound.set(true);
          this.toast.error(
            this.t().common.toasts.loadError.title,
            this.t().common.toasts.loadError.desc,
          );
        },
      });
  }

  /**
   * Normaliza la respuesta cruda al `GridView` que consume `app-programacion-grid`.
   * Defensivo: si `fechas`/`filas` no vienen como arreglos, cae a listas vacías
   * (el grid muestra su estado vacío).
   */
  private parseGrid(detalle: unknown): GridView {
    const raw = (detalle ?? {}) as Partial<ProgramacionDetalleResponse>;
    const fechas = Array.isArray(raw.fechas)
      ? raw.fechas.map((f, i) => toProgramacionFecha(f, i))
      : [];
    const filas = Array.isArray(raw.filas) ? (raw.filas as readonly ProgramacionFila[]) : [];
    return { fechas, filas };
  }
}
