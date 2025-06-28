import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import prettier from 'eslint-config-prettier'

export default [
	// Base JavaScript recommended rules
	js.configs.recommended,

	// TypeScript files
	{
		files: ['**/*.ts', '**/*.tsx'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				project: './tsconfig.json',
			},
		},
		plugins: {
			'@typescript-eslint': tseslint,
		},
		rules: {
			// Use TypeScript ESLint recommended rules directly
			...tseslint.configs.recommended.rules,
			// Override specific rules
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-non-null-assertion': 'warn',
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{
					prefer: 'type-imports',
				},
			],

			// General rules
			'no-undef': 'off',
			'no-console': 'warn',
			'no-debugger': 'error',
			'prefer-const': 'error',
			'prefer-template': 'error',
			'object-shorthand': 'error',
			'no-var': 'error',

			// Style rules (will be overridden by Prettier)
			indent: ['error', 'tab'],
			quotes: ['error', 'single', { avoidEscape: true }],
			semi: ['error', 'never'],
			'comma-dangle': ['error', 'es5'],
		},
	},

	// Test files - relax some rules
	{
		files: ['**/*.test.ts', '**/*.spec.ts'],
		rules: {
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'no-console': 'off',
		},
	},

	// Prettier config (disables conflicting formatting rules)
	prettier,

	// Global ignores
	{
		ignores: [
			'dist/',
			'node_modules/',
			'coverage/',
			'*.config.js',
			'*.config.mjs',
		],
	},
]
