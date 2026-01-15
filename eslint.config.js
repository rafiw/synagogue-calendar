import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactNative from 'eslint-plugin-react-native';

export default [
  // Base config for all files
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'dist/**',
      'android/**',
      'ios/**',
      '__mocks__/**',
      '__tests__/**',
      '*.config.js',
      '*.config.cjs',
      '*.setup.js',
      '*.setup.cjs',
      'babel.config.cjs',
      'metro.config.cjs',
      'jest.config.cjs',
      'tailwind.config.js',
      'commitlint.config.js',
      'eslint.config.js',
      '.yarn/**',
    ],
  },
  // JavaScript files - basic rules only
  {
    files: ['**/*.js', '**/*.jsx'],
    ...eslint.configs.recommended,
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  // TypeScript files - full type-aware linting
  ...tseslint.configs.recommendedTypeChecked.map(config => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx'],
  })),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react,
      // 'react-hooks': reactHooks,
      'react-native': reactNative,
    },
    rules: {
      // React rules
      'react/jsx-uses-react': 'off', // Not needed in React 17+
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off', // Using TypeScript for prop validation
      'react/jsx-no-target-blank': 'error',
      'react/jsx-key': 'error',

      // React Hooks rules
      // ...reactHooks.configs.recommended.rules,

      // React Native rules
      'react-native/no-unused-styles': 'warn',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-color-literals': 'off', // Can be strict, disable if needed

      // TypeScript specific
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'off', // Too strict for existing codebase
      '@typescript-eslint/prefer-optional-chain': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'off', // Can be too strict
      '@typescript-eslint/strict-boolean-expressions': 'off', // Can be too strict for some cases
      '@typescript-eslint/no-unsafe-assignment': 'off', // Stylistic - too strict
      '@typescript-eslint/no-unsafe-member-access': 'off', // Stylistic - too strict
      '@typescript-eslint/no-unsafe-argument': 'off', // Stylistic - too strict
      '@typescript-eslint/no-unsafe-call': 'off', // Stylistic - too strict
      '@typescript-eslint/no-unsafe-return': 'off', // Stylistic - too strict

      // General code quality
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'prefer-const': 'error',
      'no-var': 'error',
      'no-duplicate-imports': 'error',
      'no-unused-expressions': 'off', // Handled by TypeScript
      '@typescript-eslint/no-unused-expressions': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  }
];
