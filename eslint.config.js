import stylistic from '@stylistic/eslint-plugin';
import stylisticJs from '@stylistic/eslint-plugin-js';
import stylisticTs from '@stylistic/eslint-plugin-ts';

import node from '@vercel/style-guide/eslint/node';
import typescript from '@vercel/style-guide/eslint/typescript';

export default [
    {
        root: true,
        extends: [node, typescript],
        plugins: {
            '@stylistic': stylistic,
            '@stylistic-js': stylisticJs,
            '@stylistic-ts': stylisticTs,
        },
        rules: {
            '@stylistic/indent': ['error', 4],
            '@stylistic/ts/brace-style': [
                'error',
                'allman',
                { allowSingleLine: true },
            ],
        },
    },
];
