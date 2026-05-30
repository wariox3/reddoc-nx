export default {
  displayName: 'feature-base',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/libs/feature-base',
  moduleNameMapper: {
    // El barrel de `@reddoc/core` arrastra el preset de tema, que importa este
    // subpath vía export-map wildcard (`./*`). La resolución node10 de jest no
    // lo entiende, así que lo apuntamos al artefacto real.
    '^@primeuix/themes/aura$': '<rootDir>/../../node_modules/@primeuix/themes/dist/aura/index.mjs',
  },
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
        // Transpile-only: el type-check completo lo hacen `build` y `lint`.
        // Evita que `tsc` (node10) falle al resolver export-maps de PrimeNG que
        // sí resuelve el bundler de la app.
        isolatedModules: true,
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
