module.exports = {
  '*': [
    'prettier --cache --ignore-unknown --write',
    () => 'tsc -p tsconfig.diagnostics.json',
  ],
  '**/*.{ts,tsx,js,jsx,mjs,cjs}': 'eslint --cache --fix',
};
