export type Lang = 'es' | 'en';

export const SUPPORTED_LANGS: readonly Lang[] = ['es', 'en'] as const;

export const DEFAULT_LANG: Lang = 'es';

export const STORAGE_KEY = 'reddoc-lang';
