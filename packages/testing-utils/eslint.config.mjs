import baseConfig from '../../eslint.config.mjs';
import jsoncParser from 'jsonc-eslint-parser';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    languageOptions: {
      parser: jsoncParser,
    },
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}'],
          // CORRECCIÓN: Ignoramos dependencias implícitas o de peer
          ignoredDependencies: ['tslib', 'react-dom', 'react'],
        },
      ],
    },
  },
  {
    ignores: ['**/out-tsc', '**/dist'],
  },
];
