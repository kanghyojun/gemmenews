import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import solid from 'eslint-plugin-solid/configs/typescript';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    ...solid,
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
