import { Component, inject } from '@angular/core';
import { I18nService, Lang } from '@reddoc/core';

@Component({
  selector: 'lib-language-toggle',
  standalone: true,
  templateUrl: './language-toggle.component.html',
  styleUrl: './language-toggle.component.scss',
})
export class LanguageToggleComponent {
  private readonly i18n = inject(I18nService);

  readonly lang = this.i18n.lang;

  setLang(lang: Lang): void {
    this.i18n.setLang(lang);
  }
}
