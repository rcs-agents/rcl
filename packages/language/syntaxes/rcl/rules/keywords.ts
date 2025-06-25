import type { MatchRule } from 'tmgrammar-toolkit';
import { scopes } from 'tmgrammar-toolkit';
import { R } from '../regex.js';

export const importKeyword: MatchRule = {
    key: 'import-keyword',
    scope: scopes.keyword.control.import('rcl'),
    match: R.IMPORT_KW,
};

export const asKeyword: MatchRule = {
    key: 'as-keyword',
    scope: scopes.keyword.control('rcl'),
    match: R.AS_KW,
};

export const allKeywords = [importKeyword, asKeyword]; 