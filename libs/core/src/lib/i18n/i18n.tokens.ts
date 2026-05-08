import { InjectionToken } from '@angular/core';
import type { Lang } from './i18n.types';

export const I18N_DICTIONARIES = new InjectionToken<Record<Lang, unknown>>('I18N_DICTIONARIES');
