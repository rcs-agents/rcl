import type { BeginEndRule, Rule } from 'tmgrammar-toolkit';
import { scopesFor } from 'tmgrammar-toolkit';
import { R } from '../regex.js';

const scopes = scopesFor('rcl');

export const indentedList: BeginEndRule = {
    key: 'indented-list',
    scope: scopes.meta.block,
    begin: R.INDENTED_LIST_ITEM_PREFIX,
    end: /(?=\n)/,
    patterns: [],
};

export const explicitMap: BeginEndRule = {
    key: 'explicit-map',
    scope: scopes.meta.braces,
    begin: R.EXPLICIT_MAP_BEGIN,
    end: R.EXPLICIT_MAP_END,
    patterns: [],
};

export const inlineList: BeginEndRule = {
    key: 'inline-list',
    scope: scopes.meta.brackets,
    begin: R.LSQUARE,
    end: R.RSQUARE,
    patterns: [],
};

export const allCollections: Rule[] = [indentedList, explicitMap, inlineList]; 