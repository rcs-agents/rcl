import type { MatchRule } from 'tmgrammar-toolkit';
import { R } from '../regex.js';
import { scopes } from '../scopes.js';

/**
 * Space-separated identifiers (e.g., "BMW Customer Service", "My Brand")
 */
export const spaceSeparatedIdentifier: MatchRule = {
  key: 'space-separated-identifier',
  match: R.IDENTIFIER,
  scope: scopes.identifiers.spaceSepar
};

/**
 * Attribute keys (lowercase identifiers followed by colon)
 */
export const attributeKey: MatchRule = {
  key: 'attribute-key',
  match: R.ATTRIBUTE_KEY,
  scope: scopes.identifiers.attributeKey
};

/**
 * Section type identifiers (lowercase start)
 */
export const sectionType: MatchRule = {
  key: 'section-type',
  match: R.SECTION_TYPE,
  scope: scopes.keywords.section
};

/**
 * All identifier rules
 */
export const allIdentifiers = [
	spaceSeparatedIdentifier,
	attributeKey,
	sectionType
]; 