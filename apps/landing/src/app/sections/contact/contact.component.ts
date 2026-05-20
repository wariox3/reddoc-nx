import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { I18nService } from '../../i18n/i18n.service';
import { environment } from '../../../environments/environment';

const CODIGO_PROYECTO = 8;

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  readonly t = inject(I18nService).t;
  private readonly http = inject(HttpClient);

  readonly submitted = signal(false);
  readonly loading = signal(false);

  readonly today = this.makeReqId();

  readonly form = signal({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });

  update<K extends keyof ReturnType<typeof this.form>>(key: K, value: string): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  submit(event: Event): void {
    event.preventDefault();
    if (this.loading()) return;

    const { name, email, phone, company, message } = this.form();
    this.loading.set(true);

    this.http
      .post(environment.leadEndpoint, {
        nombre: name,
        correo: email,
        telefono: phone,
        empresa: company,
        descripcion: message,
        codigoProyecto: CODIGO_PROYECTO,
      })
      .subscribe({
        next: () => {
          this.submitted.set(true);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  private makeReqId(): string {
    const d = new Date();
    const y = d.getFullYear().toString().slice(2);
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}${m}${day}`;
  }
}
