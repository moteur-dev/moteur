import shared from '../../eslint.shared-config.js';

export default [
  ...shared,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        require: 'readonly',
        fetch: 'readonly',
        NodeJS: 'readonly',
      },
    },
  },
];