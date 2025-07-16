import type { BeginEndRule, MatchRule, Rule } from 'tmgrammar-toolkit';
import { allIdentifiers } from './identifiers.js';
import { allLiterals } from './literals.js';
import { R } from '../regex.js';
import { typeTag } from './types.js';
import { scopes } from '../scopes.js';

const operators: MatchRule = {
    key: 'operators',
    scope: scopes.keywords.logical, // Using logical as the base operator scope
    match: R.OPERATORS,
};

const attributeAccess: BeginEndRule = {
    key: 'attribute-access',
    scope: scopes.meta.path,
    begin: R.DOT,
    beginCaptures: {
        '0': { scope: scopes.punctuation.accessor },
    },
    end: /(?=\s|[,)\]}])/,
    patterns: allIdentifiers,
};

export const groupedExpression: BeginEndRule = {
    key: 'grouped-expression',
    scope: scopes.meta.group,
    begin: /\(/,
    end: /\)/,
    patterns: [
        /* will be populated by the repository */
    ],
};

const singleLineExpression: BeginEndRule = {
    key: 'single-line-expression',
    scope: scopes.meta.interpolation,
    begin: R.SINGLE_LINE_EXPRESSION_BEGIN,
    beginCaptures: {
        '1': { scope: scopes.punctuation.interpolationBegin },
    },
    end: R.SINGLE_LINE_EXPRESSION_END,
    endCaptures: {
        '1': { scope: scopes.punctuation.interpolationEnd },
    },
    patterns: [...allLiterals],
};

const multiLineExpression: BeginEndRule = {
    key: 'multi-line-expression',
    scope: scopes.meta.interpolation,
    begin: R.MULTI_LINE_EXPRESSION_BEGIN,
    beginCaptures: {
        '1': { scope: scopes.punctuation.interpolationBegin },
    },
    end: R.MULTI_LINE_EXPRESSION_END,
    endCaptures: {
        '1': { scope: scopes.punctuation.interpolationEnd },
    },
    patterns: [...allLiterals],
};

export const allExpressions: Rule[] = [
    operators,
    attributeAccess,
    groupedExpression,
    singleLineExpression,
    multiLineExpression,
    typeTag,
    ...allLiterals,
];

// We need to recursively include all expression patterns inside the groupedExpression.
// This is a common pattern in TextMate grammars.
groupedExpression.patterns = allExpressions; 