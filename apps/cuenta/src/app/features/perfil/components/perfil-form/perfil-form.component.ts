import { Component, OnInit, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { AuthService } from '../../../auth/services/auth.service';
import { PerfilService } from '../../services/perfil.service';
import { ToastService, extractErrorMessage } from '@reddoc/core';

@Component({
  selector: 'app-perfil-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, DividerModule],
  templateUrl: './perfil-form.component.html',
})
export class PerfilFormComponent implements OnInit {
  readonly saved = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly perfilService = inject(PerfilService);
  private readonly toast = inject(ToastService);

  readonly isSaving = signal(false);
  readonly isPristine = signal(true);

  readonly form = this.fb.group({
    nombre_corto: [''],
    celular: ['', Validators.required],
    numero_identificacion: ['', Validators.required],
    email: [{ value: '', disabled: true }],
  });

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.form.patchValue({
        nombre_corto: user.nombre_corto ?? '',
        celular: user.celular ?? '',
        numero_identificacion: user.numero_identificacion ?? '',
        email: user.email,
      });
      this.form.markAsPristine();
      this.isPristine.set(true);
    }

    this.form.valueChanges.subscribe(() => {
      this.isPristine.set(this.form.pristine);
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const { nombre_corto, celular, numero_identificacion } = this.form.getRawValue();

    this.perfilService.updatePerfil({ nombre_corto, celular, numero_identificacion }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.form.markAsPristine();
        this.isPristine.set(true);
        this.saved.emit();
      },
      error: (err) => {
        this.toast.error('Error', extractErrorMessage(err, 'No se pudo guardar los cambios.'));
        this.isSaving.set(false);
      },
    });
  }

  get nombreCortoControl() {
    return this.form.controls.nombre_corto;
  }
  get celularControl() {
    return this.form.controls.celular;
  }
  get identificacionControl() {
    return this.form.controls.numero_identificacion;
  }
}
