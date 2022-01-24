module.exports = {
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
  },
  env: {
    jest: true,
  },
  extends: [
    'weseek',
  ],
};
