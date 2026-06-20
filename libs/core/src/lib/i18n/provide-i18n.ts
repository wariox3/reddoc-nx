import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { I18N_DICTIONARIES } from './i18n.tokens';
import type { Lang } from './i18n.types';

export function provideI18n<TDict>(dictionaries: Record<Lang, TDict>): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: I18N_DICTIONARIES, useValue: dictionaries }]);
}
