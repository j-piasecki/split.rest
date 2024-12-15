module.exports = {
  root: true,
  extends: ['plugin:@typescript-eslint/recommended', 'expo'],
  ignorePatterns: ['/dist/*'],
  plugins: ['@tanstack/eslint-plugin-query'],
  rules: {
    'import/no-unresolved': 0,
    'curly': ['error', 'all'],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'react-native',
            importNames: ['Text'],
            message: 'Please use Text from @components/Text instead.',
          },
        ],
      },
    ],
  },
}
