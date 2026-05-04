import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../auth/services/auth.service';
import { ContenedorAcceso } from '../../models/contenedor.model';
import { ContenedorService } from '../../services/contenedor.service';
import { ROUTE_PATHS } from '../../../../core/constants/route-paths.constants';

@Component({
  selector: 'app-contenedores-list',
  standalone: true,
  imports: [],
  templateUrl: './contenedores-list.component.html',
  styleUrl: './contenedores-list.component.scss',
})
export class ContenedoresListComponent {
  private readonly contenedorService = inject(ContenedorService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

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

  readonly response = toSignal(this.contenedorService.getAccesos());

  readonly isLoading = computed(() => this.response() === undefined);

  readonly contenedores = computed(() => this.response()?.results ?? []);

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

  getUserName(): string {
    const email = this.currentUser()?.email ?? '';
    return email.split('@')[0];
  }

  enterContenedor(item: ContenedorAcceso): void {
    void item;
    this.router.navigateByUrl(ROUTE_PATHS.dashboard.root);
  }
}
