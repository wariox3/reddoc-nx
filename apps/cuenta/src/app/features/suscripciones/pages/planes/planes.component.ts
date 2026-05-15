import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { getInitials, ToastService } from '@reddoc/core';
import { Suscripcion } from '../../models/suscripcion.model';
import {
  SUSCRIPCION_CATEGORIA_ERP,
  SUSCRIPCION_CATEGORIA_FACTURACION,
  SuscripcionTipo,
} from '../../models/suscripcion-tipo.model';
import { SuscripcionTiposService } from '../../services/suscripcion-tipos.service';

type Track = 'facturacion' | 'erp';

const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const ANNUAL_DISCOUNT = 0.1;
const STEP_LABELS = ['Plan', 'Pago', 'Confirmar'] as const;

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './planes.component.html',
})
export class PlanesComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tiposService = inject(SuscripcionTiposService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(true);
  readonly allPlanes = signal<SuscripcionTipo[]>([]);
  readonly suscripcionId = signal<number | null>(null);
  readonly suscripcion = signal<Suscripcion | null>(null);

  readonly step = signal<0 | 1 | 2>(0);
  readonly track = signal<Track>('facturacion');
  readonly annual = signal(false);
  readonly selectedPlanId = signal<number | null>(null);

  readonly stepLabels = STEP_LABELS;

  readonly visiblePlanes = computed(() => {
    const categoria =
      this.track() === 'facturacion'
        ? SUSCRIPCION_CATEGORIA_FACTURACION
        : SUSCRIPCION_CATEGORIA_ERP;
    return this.allPlanes().filter((p) => p.suscripcion_categoria_id === categoria);
  });

  readonly selectedPlan = computed<SuscripcionTipo | null>(() => {
    const id = this.selectedPlanId();
    if (id === null) return null;
    return this.allPlanes().find((p) => p.id === id) ?? null;
  });

  readonly clienteIniciales = computed(() => {
    const s = this.suscripcion();
    return s ? getInitials(s.cliente_nombre) : '';
  });

  readonly currentSuscripcionTipoId = computed(() => this.suscripcion()?.suscripcion_tipo ?? null);

  readonly canGoNext = computed(() => {
    if (this.step() === 0) return this.selectedPlanId() !== null;
    return true;
  });

  readonly stepHeader = computed<{ title: string; subtitle: string }>(() => {
    switch (this.step()) {
      case 0:
        return {
          title: 'Selecciona un plan',
          subtitle: 'Elige entre planes de Facturación o ERP y la frecuencia de facturación.',
        };
      case 1:
        return {
          title: 'Información de pago',
          subtitle: 'Ingresa los datos de tu tarjeta para procesar el pago de la suscripción.',
        };
      case 2:
      default:
        return {
          title: 'Confirma y activa',
          subtitle: 'Revisa el resumen antes de procesar el pago.',
        };
    }
  });

  readonly skeletonCells = [0, 1, 2, 3];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    this.suscripcionId.set(id);

    const navState = (history.state ?? {}) as { suscripcion?: Suscripcion };
    if (navState.suscripcion && navState.suscripcion.id === id) {
      this.suscripcion.set(navState.suscripcion);
      console.log('[planes] suscripción desde router state:', navState.suscripcion);
    } else {
      console.log('[planes] sin router state — context header oculto. id:', id);
    }

    this.tiposService
      .getClase(1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          console.log('[planes] respuesta API:', res);
          this.allPlanes.set([...res.results]);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('[planes] error:', err);
          this.isLoading.set(false);
          this.toast.error('Error', 'No se pudieron cargar los planes.');
        },
      });
  }

  setTrack(t: Track): void {
    this.track.set(t);
  }

  setAnnual(value: boolean): void {
    this.annual.set(value);
  }

  toggleAnnual(): void {
    this.annual.update((v) => !v);
  }

  selectPlan(plan: SuscripcionTipo): void {
    if (this.isCurrent(plan)) return;
    this.selectedPlanId.set(plan.id);
  }

  goNext(): void {
    if (!this.canGoNext()) return;
    if (this.step() < 2) {
      this.step.update((s) => (s + 1) as 0 | 1 | 2);
    }
  }

  goBack(): void {
    if (this.step() === 0) {
      this.router.navigate(['/suscripciones']);
      return;
    }
    this.step.update((s) => (s - 1) as 0 | 1 | 2);
  }

  tierName(plan: SuscripcionTipo): string {
    const space = plan.nombre.indexOf(' ');
    return space === -1 ? plan.nombre : plan.nombre.slice(0, space);
  }

  isPopular(plan: SuscripcionTipo): boolean {
    return plan.nombre.startsWith('Expansión');
  }

  isCurrent(plan: SuscripcionTipo): boolean {
    const tipoId = this.currentSuscripcionTipoId();
    return tipoId !== null && tipoId === plan.id;
  }

  isSelected(plan: SuscripcionTipo): boolean {
    return this.selectedPlanId() === plan.id;
  }

  displayedMonthly(plan: SuscripcionTipo): number {
    const base = Number(plan.precio);
    if (Number.isNaN(base)) return 0;
    return this.annual() ? Math.round(base * (1 - ANNUAL_DISCOUNT)) : Math.round(base);
  }

  annualTotal(plan: SuscripcionTipo): number {
    const base = Number(plan.precio);
    if (Number.isNaN(base)) return 0;
    return Math.round(base * (1 - ANNUAL_DISCOUNT) * 12);
  }

  formatCop(value: number): string {
    return COP.format(value);
  }
}
