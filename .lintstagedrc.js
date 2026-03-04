module.exports = {
  '**/*.{ts,tsx}': (filenames) => [
    `eslint --fix ${filenames.join(' ')}`,
  ],
  '**/*.{json,md}': (filenames) => [
    `prettier --write ${filenames.join(' ')}`,
  ],
};
