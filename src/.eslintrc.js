module.exports = {
  extends: [
    'weseek',
    'weseek/typescript',
  ],
  env: {
    node: true,
  },
  rules: {
    'import/prefer-default-export': 'off',
    indent: [
      'error',
      2,
      {
        SwitchCase: 1,
        ArrayExpression: 'first',
        FunctionDeclaration: { body: 1, parameters: 2 },
        FunctionExpression: { body: 1, parameters: 2 },
      },
    ],
  },
};
