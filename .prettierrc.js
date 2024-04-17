/** @type {import("prettier").Config} */
const config = {
    endOfLine: 'lf',
    tabWidth: 4,
    printWidth: 80,
    useTabs: false,
    singleQuote: true,
    plugins: ['prettier-plugin-packagejson'],
    trailingComma: 'all',
    semi: true,
};

module.exports = config;
