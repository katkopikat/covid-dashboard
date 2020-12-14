module.exports = {
  extends: ['airbnb-typescript/base'],
  parserOptions: {
    project: './tsconfig.json',
  },
  env: {
    browser: true,
    node: true,
  },
  rules: {
    '@typescript-eslint/lines-between-class-members': [
      'error',
      'always',
      { 'exceptAfterSingleLine': true },
    ]
  },
};
