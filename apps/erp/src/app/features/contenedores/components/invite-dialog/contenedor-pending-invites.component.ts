import { DatePipe, NgClass } from '@angular/common';
import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { I18nService, ToastService } from '@reddoc/core';
import {
  Contenedor,
  ContenedorInvitacionEstado,
  ContenedorInvitacionPendiente,
} from '../../models/contenedor.model';
import { ContenedorService } from '../../services/contenedor.service';
import type { AppDict } from '../../../../i18n';

@Component({
  selector: 'app-contenedor-pending-invites',
  standalone: true,
  imports: [DatePipe, NgClass],
  templateUrl: './contenedor-pending-invites.component.html',
})
export class ContenedorPendingInvitesComponent {
  private readonly contenedorService = inject(ContenedorService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  protected readonly t = this.i18n.t;

  readonly contenedor = input<Contenedor | null>(null);
  readonly refreshToken = input<number>(0);

  readonly isLoading = signal(false);
  readonly invitations = signal<ContenedorInvitacionPendiente[]>([]);

  readonly countLabel = computed(() => {
    const n = this.invitations().length;
    const labels = this.t().contenedores.invite.pending.count;
    return `${n} ${n === 1 ? labels.one : labels.other}`;
  });

  constructor() {
    effect(() => {
      this.refreshToken();
      const c = this.contenedor();
      if (c) this.loadInvitations(c.id);
    });
  }

  initials(invite: ContenedorInvitacionPendiente): string {
    const source =
      invite.usuario_invitado_nombre_corto?.trim() || invite.usuario_invitado_correo || '?';
    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  estadoLabel(estado: ContenedorInvitacionEstado): string {
    return this.t().contenedores.invite.pending.estados[estado] ?? estado;
  }

  estadoClass(estado: ContenedorInvitacionEstado): string {
    if (estado === 'A') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (estado === 'R') return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }

  private loadInvitations(contenedorId: number): void {
    this.isLoading.set(true);
    this.contenedorService
      .getPendingInvitations(contenedorId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.invitations.set(res.results ?? []);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          const toasts = this.t().contenedores.invite.pending.toasts.loadError;
          this.toastService.error(toasts.title, toasts.desc);
        },
      });
  }
}
