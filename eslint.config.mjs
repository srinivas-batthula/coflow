// eslint.config.mjs
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import pluginPrettier from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';
import globals from 'globals';

export default [
  {
    ignores: [
      '**/node_modules/',
      '**/dist/',
      '**/build/',
      '**/.next/',
      '**/.vercel/',
      '**/coverage/',
    ],
  },

  // Base JS + Prettier
  js.configs.recommended,
  prettier,

  // Shared Prettier integration (frontend + backend)
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      'prettier/prettier': 'error', // Prettier errors will show in ESLint
    },
  },

  // Backend Server files
  {
    files: ['backend/**/*.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.node, // Node.js built-ins (process, module, etc.)
        ...globals.jest, // adds describe, it, expect, beforeEach, etc.
        ...globals.browser,
      },
    },
    rules: {
      // "no-console": "warn", // keep logs but flag in PRs
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // Frontend browser files
  {
    files: ['frontend/**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      '@next/next': nextPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true }, // allows JSX
      },
      globals: {
        ...globals.node, // give access to require/module (In config files)
        ...globals.browser, // window, document, fetch, localStorage, console, etc.
        process: 'readonly', // allow process.env usage
      },
    },
    rules: {
      'react/jsx-uses-react': 'off', // New JSX transform
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@next/next/no-html-link-for-pages': 'off', // for App Router
      '@next/next/no-img-element': 'warn', // suggest <Image />
    },
    settings: {
      react: { version: 'detect' },
    },
  },

  // Misc files (service-worker.js)
  {
    files: ['frontend/public/service-worker.js'],
    languageOptions: {
      globals: {
        ...globals.serviceworker, // self, clients, caches, etc.
      },
    },
  },
];
