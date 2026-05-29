export default {
  displayName: 'core',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/libs/core',
  moduleNameMapper: {
    // `theme/reddoc-preset.ts` importa este subpath vía export-map wildcard
    // (`./*`), que la resolución node10 de jest no entiende.
    '^@primeuix/themes/aura$': '<rootDir>/../../node_modules/@primeuix/themes/dist/aura/index.mjs',
  },
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
        // Transpile-only: el type-check completo lo hacen `build` y `lint`.
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
