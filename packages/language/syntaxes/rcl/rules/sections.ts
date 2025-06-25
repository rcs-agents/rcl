import type { BeginEndRule, MatchRule, Rule } from 'tmgrammar-toolkit';
import { scopesFor } from 'tmgrammar-toolkit';
import { R } from '../regex.js';

const scopes = scopesFor('rcl');

const sectionKeywords: MatchRule = {
    key: 'section-keywords',
    scope: scopes.meta.block,
    match: R.SECTION_TYPE,
};

const messageSectionKeywords: MatchRule = {
    key: 'message-section-keywords',
    scope: scopes.storage.type.class,
    match: R.MESSAGE_SECTION_TYPE,
};

const reservedSectionNames: MatchRule = {
    key: 'reserved-section-names',
    scope: scopes.entity.name.class('predefined'),
    match: R.RESERVED_SECTION_NAMES,
};

export const section: BeginEndRule = {
    key: 'section',
    scope: scopes.meta.block,
    begin: R.SECTION_BEGIN,
    beginCaptures: {
        '1': { scope: scopes.storage.type.class }, // sectionType
        '2': { scope: scopes.entity.name.class }, // sectionName
        '3': { scope: scopes.entity.name.class('predefined') }, // reservedName
    },
    end: R.SECTION_END,
    patterns: [],
};

export const allSections: Rule[] = [sectionKeywords, messageSectionKeywords, reservedSectionNames, section];
