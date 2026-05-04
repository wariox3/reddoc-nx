import { Component, OnInit, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { AuthService } from '../../../auth/services/auth.service';
import { PerfilService } from '../../services/perfil.service';
import { extractErrorMessage } from '@reddoc/core';

@Component({
  selector: 'app-perfil-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, MessageModule, DividerModule],
  templateUrl: './perfil-form.component.html',
  styleUrl: './perfil-form.component.scss',
})
export class PerfilFormComponent implements OnInit {
  readonly saved = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly perfilService = inject(PerfilService);

  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isPristine = signal(true);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: [''],
    numero_identificacion: [''],
    email: [{ value: '', disabled: true }],
  });

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.form.patchValue({
        name: user.name ?? '',
        apellidos: user.apellidos ?? '',
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
    this.errorMessage.set(null);

    const { name, apellidos, numero_identificacion } = this.form.getRawValue();

    this.perfilService.updatePerfil({ name: name!, apellidos, numero_identificacion }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.form.markAsPristine();
        this.isPristine.set(true);
        this.saved.emit();
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, 'No se pudo guardar los cambios.'));
        this.isSaving.set(false);
      },
    });
  }

  get nameControl() {
    return this.form.controls.name;
  }
  get apellidosControl() {
    return this.form.controls.apellidos;
  }
  get identificacionControl() {
    return this.form.controls.numero_identificacion;
  }
}
