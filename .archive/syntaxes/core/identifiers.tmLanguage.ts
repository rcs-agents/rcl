/**
 * Identifiers TextMate Grammar
 */

import {
  scopesFor,
  type MatchRule,
  type Rule,
} from 'tmgrammar-toolkit';

const scopes = scopesFor('rcl');

const agentSectionIdentifier: MatchRule = {
  key: 'agent-section-identifier',
  scope: scopes.entity.name.section.agent,
  match: /^\s*(agent)\s+([A-Z][A-Za-z0-9\s]*[A-Za-z0-9])/,
  captures: {
    '1': { scope: scopes.keyword.control.section.agent },
    '2': { scope: scopes.entity.name.section.agent },
  },
};

const sectionIdentifier: MatchRule = {
  key: 'section-identifier',
  scope: scopes.entity.name.section,
  match: /^\s*([A-Z][A-Za-z0-9\s]*[A-Za-z0-9])(?=\s*$)/,
};

const typedSectionIdentifier: MatchRule = {
  key: 'typed-section-identifier',
  scope: scopes.entity.name.type.section,
  match: /^\s*(config|defaults|messages|flows|actions|shortcuts)\s+([A-Z][A-Za-z0-9\s]*[A-Za-z0-9])/,
  captures: {
    '1': { scope: scopes.keyword.control.section },
    '2': { scope: scopes.entity.name.section },
  },
};

const properNounVariable: MatchRule = {
  key: 'proper-noun-variable',
  scope: scopes.variable.other.propernoun,
  match: /\b([A-Z][A-Za-z0-9]*(?:\s+[A-Z][A-Za-z0-9]*)?)\b/,
};

const attributeVariable: MatchRule = {
  key: 'attribute-variable',
  scope: scopes.variable.other.attribute,
  match: /\b([a-z][a-zA-Z0-9_]*)\b/,
};

const functionName: MatchRule = {
  key: 'function-name',
  scope: scopes.entity.name.function,
  match: /\b([A-Z][A-Za-z0-9\s]*[A-Za-z0-9])\b(?=\s*\()/,
};

const referenceVariable: MatchRule = {
  key: 'reference-variable',
  scope: scopes.variable.other.reference,
  match: /\$([A-Z][A-Za-z0-9\s]*[A-Za-z0-9])/,
  captures: {
    '1': { scope: scopes.variable.other.reference.rcl },
  },
};

export const identifiers: Rule = {
  key: 'identifiers',
  patterns: [
    agentSectionIdentifier,
    sectionIdentifier,
    typedSectionIdentifier,
    properNounVariable,
    attributeVariable,
    functionName,
    referenceVariable,
  ],
}; 