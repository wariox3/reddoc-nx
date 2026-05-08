import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, startWith, switchMap } from 'rxjs';
import { I18nService } from '@reddoc/core';
import { AuthService } from '../../../auth/services/auth.service';
import { Contenedor } from '../../models/contenedor.model';
import { ContenedorService } from '../../services/contenedor.service';
import { ContenedoresCreateDialogComponent } from '../../components/create-dialog/contenedores-create-dialog.component';
import { ROUTE_PATHS } from '../../../../core/constants/route-paths.constants';
import type { AppDict } from '../../../../i18n';

@Component({
  selector: 'app-contenedores-list',
  standalone: true,
  imports: [ContenedoresCreateDialogComponent],
  templateUrl: './contenedores-list.component.html',
  styleUrl: './contenedores-list.component.scss',
})
export class ContenedoresListComponent {
  private readonly contenedorService = inject(ContenedorService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  protected readonly t = this.i18n.t;

  readonly showCreate = signal(false);

  private readonly reload$ = new Subject<void>();

  private readonly gradients = [
    ['#0f4c75', '#1b6ca8'],
    ['#2d6a4f', '#52b788'],
    ['#6d28d9', '#a78bfa'],
    ['#9d174d', '#f472b6'],
    ['#92400e', '#fbbf24'],
    ['#1e3a5f', '#0ea5e9'],
    ['#065f46', '#34d399'],
    ['#7f1d1d', '#f87171'],
  ];

  readonly currentUser = this.authService.currentUser;

  readonly response = toSignal(
    this.reload$.pipe(
      startWith(undefined),
      switchMap(() => this.contenedorService.getAccesos()),
    ),
  );

  readonly isLoading = computed(() => this.response() === undefined);

  readonly contenedores = computed(() => this.response()?.results ?? []);

  readonly searchQuery = signal('');

  readonly filteredContenedores = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.contenedores();
    return this.contenedores().filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.schema_name.toLowerCase().includes(q) ||
        c.dominio.toLowerCase().includes(q),
    );
  });

  readonly skeletonItems = Array.from({ length: 6 });

  getAvatarLabel(nombre: string): string {
    return nombre
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  getAvatarGradient(nombre: string): string {
    const hash = nombre.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const [from, to] = this.gradients[hash % this.gradients.length];
    return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
  }

  onContenedorCreated(): void {
    this.showCreate.set(false);
    this.reload$.next();
  }

  enterContenedor(item: Contenedor): void {
    void item;
    this.router.navigateByUrl(ROUTE_PATHS.dashboard.root);
  }
}
