import type { BeginEndRule, Rule } from 'tmgrammar-toolkit';
import { scopesFor } from 'tmgrammar-toolkit';
import { stringLiteral } from './literals.js';
import { R } from '../regex.js';

const scopes = scopesFor('rcl');

export const importAlias: Rule = {
    key: 'import-alias',
    scope: scopes.variable.other.readwrite,
    match: R.IDENTIFIER,
};

export const importStatement: BeginEndRule = {
    key: 'import-statement',
    scope: scopes.meta.block('import'),
    begin: R.IMPORT_KW,
    beginCaptures: {
        '0': { scope: scopes.keyword.control.import },
    },
    end: /(?=\n)/,
    patterns: [
        importAlias,
        stringLiteral,
    ],
}; 