import type { MatchRule } from 'tmgrammar-toolkit';
import { R } from '../regex.js';
import { scopeGroups } from '../scopes.js';

/**
 * Space-separated identifiers (e.g., "BMW Customer Service", "My Brand")
 */
export const spaceSeparatedIdentifier: MatchRule = {
  key: 'space-separated-identifier',
  match: R.IDENTIFIER,
  scope: scopeGroups.identifiers.spaceSepar
};

/**
 * Attribute keys (lowercase identifiers followed by colon)
 */
export const attributeKey: MatchRule = {
  key: 'attribute-key',
  match: R.ATTRIBUTE_KEY,
  scope: scopeGroups.identifiers.attributeKey
};

/**
 * Section type identifiers (lowercase start)
 */
export const sectionType: MatchRule = {
  key: 'section-type',
  match: R.SECTION_TYPE,
  scope: scopeGroups.keywords.section
};

/**
 * All identifier rules
 */
export const allIdentifiers = [
	spaceSeparatedIdentifier,
	attributeKey,
	sectionType
]; 