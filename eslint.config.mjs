import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          // `@erp/*` es un alias intra-app de apps/erp para evitar
          // imports relativos profundos (`../../../../../i18n`) ahora que
          // los masters viven en `features/<modulo>/masters/<entity>/pages/<page>/`.
          // Se permite explícitamente porque el alias resuelve solo dentro de
          // apps/erp; el resto del monorepo no puede usarlo (no se declara
          // un alias equivalente para los otros apps).
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$', '^@erp/'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
];
