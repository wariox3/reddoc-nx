import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '@reddoc/core';
import { SuscripcionCardComponent } from './components/suscripcion-card/suscripcion-card.component';
import { Suscripcion } from './models/suscripcion.model';
import { getSuscripcionStatus } from './suscripcion.utils';
import { SuscripcionesService } from './services/suscripciones.service';

@Component({
  selector: 'app-suscripciones',
  standalone: true,
  imports: [SuscripcionCardComponent],
  templateUrl: './suscripciones.component.html',
})
export class SuscripcionesComponent implements OnInit {
  private readonly suscripcionesService = inject(SuscripcionesService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(true);
  readonly suscripciones = signal<Suscripcion[]>([]);
  readonly activasCount = computed(
    () => this.suscripciones().filter((s) => !getSuscripcionStatus(s).expired).length,
  );

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.isLoading.set(true);
    this.suscripcionesService
      .getSuscripciones()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.suscripciones.set([...res.results]);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.toast.error('Error', 'No se pudieron cargar tus suscripciones.');
        },
      });
  }
}
