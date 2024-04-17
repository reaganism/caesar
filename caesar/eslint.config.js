import stylistic from '@stylistic/eslint-plugin';
import stylisticJs from '@stylistic/eslint-plugin-js';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import { resolve } from 'path';

import node from '@vercel/style-guide/eslint/node';
import typescript from '@vercel/style-guide/eslint/typescript';

const project = resolve(__dirname, 'tsconfig.json');

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
            // We intentionally use dependencies that aren't listed since they're provided upstream.
            'import/no-extraneous-dependencies': 'off',
        },
        parserOptions: {
            project,
        },
        settings: {
            'import/resolver': {
                typescript: {
                    project,
                },
            },
        },
    },
];
