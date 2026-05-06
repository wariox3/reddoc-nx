import {
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ENVIRONMENT } from '@reddoc/core';

declare global {
  interface Window {
    turnstile: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

@Component({
  selector: 'app-turnstile',
  standalone: true,
  template: `<div #turnstileContainer></div>`,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
})
export class TurnstileComponent implements OnDestroy {
  readonly siteKey = input(inject(ENVIRONMENT).turnstileSiteKey);
  readonly theme = input<'light' | 'dark' | 'auto'>('auto');
  readonly size = input<'normal' | 'flexible' | 'compact'>('flexible');

  readonly verified = output<string>();
  readonly expired = output<void>();
  readonly errored = output<void>();

  readonly token = signal<string | null>(null);

  private readonly container = viewChild.required<ElementRef<HTMLElement>>('turnstileContainer');
  private widgetId: string | null = null;

  constructor() {
    afterNextRender(() => {
      this.loadScript().then(() => this.renderWidget());
    });
  }

  reset(): void {
    if (this.widgetId && window.turnstile) {
      window.turnstile.reset(this.widgetId);
    }
    this.token.set(null);
  }

  ngOnDestroy(): void {
    if (this.widgetId && window.turnstile) {
      window.turnstile.remove(this.widgetId);
      this.widgetId = null;
    }
  }

  private renderWidget(): void {
    if (!window.turnstile) return;

    const container = this.container().nativeElement;

    this.widgetId = window.turnstile.render(container, {
      sitekey: this.siteKey(),
      theme: this.theme(),
      size: this.size(),
      callback: (token: string) => {
        this.token.set(token);
        this.verified.emit(token);
      },
      'expired-callback': () => {
        this.token.set(null);
        this.expired.emit();
      },
      'error-callback': () => {
        this.token.set(null);
        this.errored.emit();
      },
    });
  }

  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.turnstile) {
        resolve();
        return;
      }

      const existing = document.querySelector(`script[src="${TURNSTILE_SCRIPT_URL}"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve());
        return;
      }

      const script = document.createElement('script');
      script.src = TURNSTILE_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Turnstile script'));
      document.head.appendChild(script);
    });
  }
}
