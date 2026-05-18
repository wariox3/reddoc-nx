import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { EstadoPago } from '../../models/pago.model';
import { SuscripcionPagoService } from '../../services/suscripcion-pago.service';
import { WOMPI_REF_STORAGE_KEY } from '../../utils/wompi-payload';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 30000;

type UiEstado = 'cargando' | 'aprobado' | 'rechazado' | 'pendiente' | 'sin-referencia' | 'error';

@Component({
  selector: 'app-pago-resultado',
  standalone: true,
  templateUrl: './pago-resultado.component.html',
  host: { class: 'block' },
})
export class PagoResultadoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pagoService = inject(SuscripcionPagoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly estado = signal<UiEstado>('cargando');
  readonly mensaje = signal<string | null>(null);
  readonly transactionId = signal<string | null>(null);
  readonly referencia = signal<string | null>(null);
  readonly suscripcionId = signal<number | null>(null);

  readonly titulo = computed(() => {
    switch (this.estado()) {
      case 'aprobado':
        return '¡Pago aprobado!';
      case 'rechazado':
        return 'Pago rechazado';
      case 'pendiente':
        return 'Tu pago está en revisión';
      case 'sin-referencia':
        return 'No encontramos la transacción';
      case 'error':
        return 'No pudimos verificar el pago';
      case 'cargando':
      default:
        return 'Procesando tu pago';
    }
  });

  readonly subtitulo = computed(() => {
    switch (this.estado()) {
      case 'aprobado':
        return 'Tu suscripción ya está activa. Recibirás un correo con el comprobante.';
      case 'rechazado':
        return 'No se pudo procesar el cobro. Podés intentar con otro método de pago.';
      case 'pendiente':
        return 'Estamos esperando la confirmación del banco. Te avisaremos por correo cuando se acredite.';
      case 'sin-referencia':
        return 'Volvé al listado de suscripciones e intentá nuevamente desde el wizard.';
      case 'error':
        return 'Verificá el estado del pago en unos minutos o contactá a soporte si el cobro aparece en tu banco.';
      case 'cargando':
      default:
        return 'Estamos confirmando con el procesador, no cierres esta ventana.';
    }
  });

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;
    const wompiId = qp.get('id');
    const refFromUrl = qp.get('ref');
    const refFromStorage =
      typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(WOMPI_REF_STORAGE_KEY) : null;
    const referencia = refFromUrl ?? refFromStorage;

    this.transactionId.set(wompiId);
    this.referencia.set(referencia);

    if (!referencia) {
      this.estado.set('sin-referencia');
      return;
    }

    this.poll(referencia, Date.now());
  }

  irASuscripciones(): void {
    this.limpiarStorage();
    this.router.navigate(['/suscripciones']);
  }

  reintentar(): void {
    this.limpiarStorage();
    this.router.navigate(['/suscripciones']);
  }

  private poll(referencia: string, startedAt: number): void {
    this.pagoService
      .consultarPago(referencia)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.mensaje.set(res.mensaje ?? null);
          if (res.transaction_id) this.transactionId.set(res.transaction_id);
          if (res.suscripcion_id) this.suscripcionId.set(res.suscripcion_id);
          const ui = this.mapEstado(res.estado);
          if (ui !== 'cargando') {
            this.estado.set(ui);
            if (ui === 'aprobado') this.limpiarStorage();
            return;
          }
          if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
            this.estado.set('pendiente');
            return;
          }
          setTimeout(() => this.poll(referencia, startedAt), POLL_INTERVAL_MS);
        },
        error: () => {
          if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
            this.estado.set('error');
            return;
          }
          setTimeout(() => this.poll(referencia, startedAt), POLL_INTERVAL_MS);
        },
      });
  }

  private mapEstado(estado: EstadoPago): UiEstado {
    switch (estado) {
      case 'approved':
        return 'aprobado';
      case 'declined':
      case 'voided':
        return 'rechazado';
      case 'error':
        return 'error';
      case 'pending':
      default:
        return 'cargando';
    }
  }

  private limpiarStorage(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(WOMPI_REF_STORAGE_KEY);
    }
  }
}
