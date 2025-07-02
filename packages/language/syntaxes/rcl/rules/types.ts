import { scopesFor } from 'tmgrammar-toolkit';
import type { MatchRule, BeginEndRule } from 'tmgrammar-toolkit';
import { R } from '../regex.js';

const scopes = scopesFor('rcl');

/**
 * Type tag with value (e.g., <time 10:00>, <email user@domain.com>)
 */
export const typeTagWithValue: BeginEndRule = {
  key: 'type-tag-with-value',
  begin: R.LT,
  end: R.GT,
  scope: 'meta.type-tag.rcl',
  beginCaptures: {
    '0': { name: scopes.punctuation.definition('tag-begin') }
  },
  endCaptures: {
    '0': { name: scopes.punctuation.definition('tag-end') }
  },
  patterns: [
    { include: '#type-name' },
    { include: '#type-value' },
    { include: '#type-modifier' }
  ]
};

/**
 * Type names (time, email, phone, url, etc.)
 */
export const typeName: MatchRule = {
  key: 'type-name',
  match: /\b(email|phone|msisdn|url|time|t|datetime|date|dt|zipcode|zip|duration|ttl)\b/,
  scope: scopes.storage.type
};

/**
 * Type values inside type tags
 */
export const typeValue: MatchRule = {
  key: 'type-value',
  match: R.TYPE_TAG_VALUE_CONTENT,
  scope: 'string.unquoted.type.value.rcl'
};

/**
 * Type modifiers (optional, required, etc.)
 */
export const typeModifier: MatchRule = {
  key: 'type-modifier',
  match: R.TYPE_TAG_MODIFIER_CONTENT,
  scope: scopes.storage.modifier
};

/**
 * All type rules
 */
// Create alias for backward compatibility
export const typeTag = typeTagWithValue;

export const allTypes = [
   typeTagWithValue,
   typeName,
   typeValue,
   typeModifier
]; 