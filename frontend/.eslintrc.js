module.exports = {
  root: true,
  extends: ['plugin:@typescript-eslint/recommended', 'expo'],
  ignorePatterns: ['/dist/*'],
  rules: {
    'import/no-unresolved': 0,
  },
}
