import { Component, DestroyRef, type OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import {
  I18nService,
  INICIALES_DIA_SEMANA_ES,
  TenantService,
  ToastService,
  fromIsoDate,
} from '@reddoc/core';
import { BreadcrumbComponent, type BreadcrumbItem } from '@reddoc/feature-base';
import type { AppDict } from '@erp/i18n';
import {
  FestivoService,
  type Festivo,
} from '@erp/features/general/masters/festivo/festivo.service';
import { ProgramacionService } from '../../programacion.service';
import { PROGRAMACION_LIST_PATH } from '../../programacion.constants';
import type {
  ProgramacionDetalleResponse,
  ProgramacionFecha,
  ProgramacionFila,
} from '../../programacion.model';
import {
  ProgramacionGridComponent,
  type ProgramacionGrupoRef,
} from '../../components/programacion-grid/programacion-grid.component';
import { ProgramacionAplicarModalComponent } from '../../components/programacion-aplicar-modal/programacion-aplicar-modal.component';

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

/** Convierte un string ISO `YYYY-MM-DD` a la columna normalizada del grid. */
function toProgramacionFecha(iso: string, _index: number): ProgramacionFecha {
  const date = fromIsoDate(iso);
  const dow = date ? date.getDay() : 0;
  return {
    clave: iso,
    etiqueta: iso.slice(8, 10).replace(/^0/, ''),
    inicial: INICIALES_DIA_SEMANA_ES[dow],
    finDeSemana: dow === 0 || dow === 6,
  };
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
  imports: [
    ButtonModule,
    BreadcrumbComponent,
    ProgramacionGridComponent,
    ProgramacionAplicarModalComponent,
  ],
  templateUrl: './programacion-detail.component.html',
  styleUrl: './programacion-detail.component.scss',
})
export class ProgramacionDetailComponent implements OnInit {
  private readonly service = inject(ProgramacionService);
  private readonly festivoService = inject(FestivoService);
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

  /** Modal de aplicar programación (se abre desde el botón del grupo del grid). */
  protected readonly aplicarModalVisible = signal(false);
  protected readonly aplicarGrupo = signal<ProgramacionGrupoRef | null>(null);

  private readonly festivos = signal<readonly Festivo[]>([]);

  /** Set de fechas ISO festivas del período — para resaltar columnas en el grid. */
  protected readonly festivoClaves = computed<ReadonlySet<string>>(() => {
    const set = new Set<string>();
    for (const f of this.festivos()) set.add(f.fecha);
    return set;
  });

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

  /** Abre el modal de aplicar programación emitido por el grid. */
  protected onAplicarProgramacion(grupo: ProgramacionGrupoRef): void {
    this.aplicarGrupo.set(grupo);
    this.aplicarModalVisible.set(true);
  }

  /** Tras aplicar la programación, recarga el detalle para reflejar los cambios. */
  protected onApplied(): void {
    const id = Number(this.id());
    if (Number.isFinite(id)) this.loadDetalle(id);
  }

  /** Fecha larga de la cabecera (`20 de junio de 2026`). */
  protected formatFecha(date: Date | null): string {
    if (!date) return '—';
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  private cargarFestivos(anio: number, mes: number): void {
    this.festivoService
      .getDelMes(anio, mes)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => this.festivos.set(list),
        error: () => this.festivos.set([]),
      });
  }

  private loadDetalle(id: number): void {
    this.service
      .getDetalle(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detalle) => {
          const res = detalle as ProgramacionDetalleResponse;
          const now = new Date();
          this.cargarFestivos(now.getFullYear(), now.getMonth() + 1);
          // La respuesta real no incluye cabecera del documento; se muestra vacía.
          this.cabecera.set({
            numero: null,
            fecha: null,
            identificacion: null,
            contacto: null,
            horas: null,
            horasDiurnas: null,
            horasNocturnas: null,
          });
          this.grid.set(this.parseGrid(res));
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

  private parseGrid(res: ProgramacionDetalleResponse): GridView {
    const fechas = res.fechas.map((f, i) => toProgramacionFecha(f, i));
    return { fechas, filas: res.filas };
  }
}
