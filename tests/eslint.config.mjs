/**
 * @file tests/eslint.config.mjs
 * @description Orquestador de Calidad para el Espejo de Calidad (Tests).
 *              Este es el ÚNICO lugar autorizado en el monorepo para 
 *              ejecutar reglas de ESLint específicas de Jest.
 * @version 1.0 - Sovereign Mirror Standard
 * @author Staff Engineer - MetaShark Tech
 */

import baseConfig from '../eslint.config.mjs';
import tseslint from 'typescript-eslint';
import jestPlugin from 'eslint-plugin-jest';

export default tseslint.config(
  // 1. Herencia de la Constitución del Monorepo
  ...baseConfig,

  {
    // 2. Perímetro de Auditoría (Todo el workspace de tests)
    files: ['**/*.ts', '**/*.tsx'],
    
    // 3. Registro del Motor de Pruebas
    plugins: {
      jest: jestPlugin,
    },

    // 4. Configuración del Entorno Criptográfico de Pruebas
    languageOptions: {
      globals: {
        ...jestPlugin.environments.globals.globals,
      },
    },

    /**
     * @pilar X: Higiene en Tests.
     * Definimos las reglas innegociables para mantener el Espejo de Calidad prístino.
     */
    rules: {
      ...jestPlugin.configs.recommended.rules,
      
      // Prohibimos tests enfocados (.only) para evitar falsos positivos en el CI/CD
      'jest/no-focused-tests': 'error',
      
      // Prohibimos títulos idénticos para garantizar trazabilidad forense de errores
      'jest/no-identical-title': 'error',
      
      // Forzamos el uso de 'expect' para que no existan tests "vacíos"
      'jest/expect-expect': 'error',

      // Permitimos que los tests usen 'any' en casos extremos de mocking, 
      // pero recomendamos el uso de 'unknown'
      '@typescript-eslint/no-explicit-any': 'warn',

      // Desactivamos la regla de variables no usadas para los 'args' de los mocks
      '@typescript-eslint/no-unused-vars': [
        'error',
        { 
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        },
      ],
    },
  },

  {
    // 5. Exclusiones de Infraestructura
    ignores: [
      '**/test-output/**',
      '**/coverage/**',
      '**/jest.setup.ts'
    ],
  }
);