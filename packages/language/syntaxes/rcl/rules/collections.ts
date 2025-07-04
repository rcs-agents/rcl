import { scopesFor } from 'tmgrammar-toolkit';
import type { MatchRule, BeginEndRule, IncludeRule } from 'tmgrammar-toolkit';
import { R } from '../regex.js';

const scopes = scopesFor({
    suffix: 'rcl',
    allowScopeExtension: false
});

/**
 * Indented list items with hyphens
 * Examples:
 *   - item1
 *   - item2
 */
export const indentedListItem: MatchRule = {
    key: 'indented-list-item',
    match: /(-)\s*(.+)/,
    scope: 'meta.list.item.rcl'
};

/**
 * Indented list container (for including patterns)
 * Examples:
 * - item1
 * - item2
 * - item3
 */
export const indentedList: IncludeRule = {
    key: 'indented-list',
    patterns: [
        indentedListItem
    ]
};

/**
 * Parentheses lists (tuple-style)
 * Examples: (item1, item2, item3), ("red", "green", "blue")
 */
export const parenthesesList: BeginEndRule = {
    key: 'parentheses-list',
    begin: /\(/,
    end: /\)/,
    scope: 'meta.list.parentheses.rcl',
    beginCaptures: {
        '0': { scope: scopes.punctuation.section.parens.begin }
    },
    endCaptures: {
        '0': { scope: scopes.punctuation.section.parens.end }
    },
    patterns: [
        { include: '#list-content' }
    ]
};

/**
 * Inline lists (comma-separated without parentheses)
 * Examples: item1, item2, item3
 */
export const inlineList: BeginEndRule = {
    key: 'inline-list',
    begin: /\[/,
    end: /\]/,
    scope: 'meta.list.inline.rcl',
    beginCaptures: {
        '0': { scope: scopes.punctuation.section.brackets.begin }
    },
    endCaptures: {
        '0': { scope: scopes.punctuation.section.brackets.end }
    },
    patterns: [
        { include: '#list-content' }
    ]
};

/**
 * Explicit maps/objects with braces
 * Examples: {key1: value1, key2: value2}
 */
export const explicitMap: BeginEndRule = {
    key: 'explicit-map',
    begin: /\{/,
    end: /\}/,
    scope: scopes.meta.mapping,
    beginCaptures: {
        '0': { scope: scopes.punctuation.section.braces.begin }
    },
    endCaptures: {
        '0': { scope: scopes.punctuation.section.braces.end }
    },
    patterns: [
        { include: '#map-content' }
    ]
};

/**
 * Mapped type definitions
 * Examples: phoneNumbers list of (label, <phone number>):
 */
export const mappedType: BeginEndRule = {
    key: 'mapped-type',
    begin: /([A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9])))*)\s+(list)\s+(of)\s*\(/,
    end: /\)(\s*:)/,
    scope: 'meta.type.mapped.rcl',
    beginCaptures: {
        '1': { scope: scopes.entity.name.type },
        '4': { scope: scopes.keyword.other },
        '5': { scope: scopes.keyword.other }
    },
    endCaptures: {
        '0': { scope: scopes.punctuation.definition('type-end') }
    },
    patterns: [
        { include: '#map-content' }
    ]
};

/**
 * Comma separator for lists and objects
 */
export const comma: MatchRule = {
    key: 'comma',
    scope: scopes.punctuation.separator.comma,
    match: R.COMMA
};

export const allCollections = [
    mappedType,
    parenthesesList,
    explicitMap,
    inlineList,
    indentedList,
    indentedListItem,
    comma
]; 