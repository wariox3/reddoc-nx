import { Injectable, computed, inject, signal } from '@angular/core';
import { I18N_DICTIONARIES } from './i18n.tokens';
import { DEFAULT_LANG, Lang, STORAGE_KEY, SUPPORTED_LANGS } from './i18n.types';

@Injectable({ providedIn: 'root' })
export class I18nService<TDict = unknown> {
  private readonly dicts = inject<Record<Lang, TDict>>(I18N_DICTIONARIES);
  private readonly _lang = signal<Lang>(this.readStoredLang());

  readonly lang = this._lang.asReadonly();
  readonly t = computed<TDict>(() => this.dicts[this._lang()]);

  setLang(lang: Lang): void {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    this._lang.set(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  }

  toggle(): void {
    this.setLang(this._lang() === 'es' ? 'en' : 'es');
  }

  private readStoredLang(): Lang {
    if (typeof localStorage === 'undefined') return DEFAULT_LANG;
    const stored = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED_LANGS.includes(stored as Lang) ? (stored as Lang) : DEFAULT_LANG;
  }
}
