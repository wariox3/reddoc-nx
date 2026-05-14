import { NgClass } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteSelectEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { I18nService, ToastService, extractErrorMessage } from '@reddoc/core';
import { AuthService } from '../../../auth/services/auth.service';
import { Contenedor, ContenedorMember, UserSearchResult } from '../../models/contenedor.model';
import { ContenedorService } from '../../services/contenedor.service';
import type { AppDict } from '../../../../i18n';

const ROLE_ORDER: Record<number, number> = {
  1: 0, // propietario
  2: 1, // administrador
  3: 2, // usuario
};

const ROL_ID_DEFAULT = 3;

@Component({
  selector: 'app-contenedor-invite-form',
  standalone: true,
  imports: [NgClass, FormsModule, ButtonModule, AutoCompleteModule],
  templateUrl: './contenedor-invite-form.component.html',
})
export class ContenedorInviteFormComponent implements OnInit {
  private readonly contenedorService = inject(ContenedorService);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  protected readonly t = this.i18n.t;

  readonly contenedor = input<Contenedor | null>(null);

  readonly autocompleteValue = signal<UserSearchResult | string>('');
  readonly selectedUser = computed(() => {
    const v = this.autocompleteValue();
    return typeof v === 'object' && v !== null ? v : null;
  });

  readonly userSuggestions = signal<UserSearchResult[]>([]);
  readonly isSearching = signal(false);
  readonly isSending = signal(false);
  readonly isLoadingMembers = signal(false);
  readonly members = signal<ContenedorMember[]>([]);
  readonly pendingRemoveId = signal<number | null>(null);
  readonly removingId = signal<number | null>(null);

  readonly currentUserId = computed(() => this.authService.currentUser()?.id ?? null);

  readonly sortedMembers = computed(() =>
    [...this.members()].sort((a, b) => {
      const r = (ROLE_ORDER[a.rol_id ?? 99] ?? 99) - (ROLE_ORDER[b.rol_id ?? 99] ?? 99);
      if (r !== 0) return r;
      return (a.usuario_nombre_corto ?? a.usuario_email).localeCompare(
        b.usuario_nombre_corto ?? b.usuario_email,
      );
    }),
  );

  readonly memberCountLabel = computed(() => {
    const n = this.members().length;
    const labels = this.t().contenedores.invite.members.count;
    return `${n} ${n === 1 ? labels.one : labels.other}`;
  });

  ngOnInit(): void {
    const c = this.contenedor();
    if (c) this.loadMembers(c.id);
  }

  initials(member: ContenedorMember): string {
    const source = member.usuario_nombre_corto?.trim() || member.usuario_email || '?';
    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  userInitials(user: UserSearchResult): string {
    return (user.nombre_corto || user.email)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  isYou(member: ContenedorMember): boolean {
    const me = this.currentUserId();
    return me !== null && member.usuario_id === me;
  }

  canRemove(member: ContenedorMember): boolean {
    return member.rol_id !== 1 && !this.isYou(member);
  }

  roleLabel(rolId: number | null): string {
    const roles = this.t().contenedores.invite.members.roles;
    if (rolId === 1) return roles.propietario;
    if (rolId === 2) return roles.administrador;
    return roles.usuario;
  }

  monogramClass(member: ContenedorMember): string {
    return member.rol_id === 1
      ? 'bg-amber-100 text-amber-800'
      : 'bg-[rgba(20,48,73,0.06)] text-brand-navy';
  }

  rowClass(member: ContenedorMember): string {
    return member.rol_id === 1 ? 'bg-amber-50/40' : '';
  }

  pillClass(rolId: number | null): string {
    if (rolId === 1) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (rolId === 2) return 'bg-sky-50 text-sky-700 border-sky-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  }

  searchUsers(event: AutoCompleteCompleteEvent): void {
    if (event.query.length < 3) {
      this.userSuggestions.set([]);
      return;
    }
    this.isSearching.set(true);
    this.contenedorService
      .searchUsers(event.query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => {
          this.userSuggestions.set(r);
          this.isSearching.set(false);
        },
        error: () => {
          this.userSuggestions.set([]);
          this.isSearching.set(false);
        },
      });
  }

  onUserSelected(event: AutoCompleteSelectEvent): void {
    this.autocompleteValue.set(event.value as UserSearchResult);
  }

  onSubmit(): void {
    const c = this.contenedor();
    const user = this.selectedUser();
    if (!c || !user || this.isSending()) return;

    this.isSending.set(true);
    this.contenedorService
      .sendInvitation({ cliente_id: c.id, usuario_id: user.id, rol_id: ROL_ID_DEFAULT })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSending.set(false);
          const toasts = this.t().contenedores.invite.toasts.sent;
          this.toastService.success(toasts.title, toasts.desc);
          this.autocompleteValue.set('');
          this.userSuggestions.set([]);
          this.loadMembers(c.id);
        },
        error: (err) => {
          this.isSending.set(false);
          const toasts = this.t().contenedores.invite.toasts.sendError;
          this.toastService.error(toasts.title, extractErrorMessage(err, toasts.desc));
        },
      });
  }

  requestRemove(member: ContenedorMember): void {
    this.pendingRemoveId.set(member.id);
  }

  cancelRemove(): void {
    this.pendingRemoveId.set(null);
  }

  confirmRemove(member: ContenedorMember): void {
    const c = this.contenedor();
    if (!c || this.removingId() !== null) return;

    this.removingId.set(member.id);
    this.contenedorService
      .removeMember(member.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.removingId.set(null);
          this.pendingRemoveId.set(null);
          const toasts = this.t().contenedores.invite.toasts.removed;
          this.toastService.success(toasts.title, toasts.desc);
          this.loadMembers(c.id);
        },
        error: () => {
          this.removingId.set(null);
          const toasts = this.t().contenedores.invite.toasts.removeError;
          this.toastService.error(toasts.title, toasts.desc);
        },
      });
  }

  private loadMembers(contenedorId: number): void {
    this.isLoadingMembers.set(true);
    this.contenedorService
      .getMembers(contenedorId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.members.set(res.results ?? []);
          this.isLoadingMembers.set(false);
        },
        error: () => {
          this.isLoadingMembers.set(false);
          const toasts = this.t().contenedores.invite.toasts.loadError;
          this.toastService.error(toasts.title, toasts.desc);
        },
      });
  }
}
