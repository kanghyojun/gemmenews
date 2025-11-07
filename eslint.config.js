import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import solid from 'eslint-plugin-solid/configs/typescript';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    ...solid,
    plugins: {
      ...solid.plugins,
      import: importPlugin,
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',

      // SolidJS specific rules
      'solid/reactivity': 'warn',
      'solid/no-destructure': 'warn',
      'solid/prefer-for': 'warn',

      // Import rules
      'import/no-relative-parent-imports': 'off', // We'll use a custom depth check instead
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['**/../../*'],
          message: 'Deep relative imports (3+ levels) are not allowed. Use path aliases instead: @/* for drizzle/, ~/* for src/'
        }]
      }],

      // General best practices
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    ignores: [
      'dist/**',
      '.output/**',
      '.vinxi/**',
      'node_modules/**',
      'drizzle/migrations/**',
      '*.config.js',
      '*.config.ts',
    ],
  }
);
