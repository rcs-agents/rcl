import type { MatchRule, BeginEndRule } from 'tmgrammar-toolkit';
import { R } from '../regex.js';
import { scopes } from '../scopes.js';

/**
 * Flow rule names (e.g., ":start", "Welcome")
 */
export const flowRuleName: MatchRule = {
  key: 'flow-rule-name',
  match: /([A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9])))*)\s*:/,
  scope: scopes.identifiers.flowRuleName
};

/**
 * Flow arrow operators (->)
 */
export const flowArrow: MatchRule = {
  key: 'flow-arrow',
  match: R.ARROW,
  scope: scopes.keywords.arrow
};

/**
 * Flow operands (targets after arrows)
 */
export const flowOperand: MatchRule = {
  key: 'flow-operand',
  match: /(:([_a-zA-Z][\w_]*|"[^"\\]*")|"[^"]*"|[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9])))*)/,
  scope: scopes.identifiers.flowTarget
};

/**
 * Flow transitions (complete arrow-based transitions)
 */
export const flowTransition: BeginEndRule = {
  key: 'flow-transition',
  begin: /(?=\s*(:([_a-zA-Z][\w_]*|"[^"\\]*")|"[^"]*"|[A-Z]([A-Za-z0-9-_]|(\s(?=[A-Z0-9])))*)\s*->)/,
  end: /(?=^(?![ \t]))/m,
  scope: scopes.meta.flowTransition,
  patterns: [
    { include: '#flow-arrow' },
    { include: '#flow-operand' },
    { include: '#with-clause' },
    { include: '#when-clause' }
  ]
};

/**
 * When clauses in flow rules
 */
export const whenClause: BeginEndRule = {
  key: 'when-clause',
  begin: R.WHEN_KW,
  end: /(?=^(?![ \t]))/m,
  scope: scopes.meta.whenClause,
  beginCaptures: {
    '0': { name: scopes.keywords.flow }
  },
  patterns: [
    { include: '#flow-condition' },
    { include: '#flow-transition' }
  ]
};

/**
 * With clauses in flow rules
 */
export const withClause: BeginEndRule = {
  key: 'with-clause',
  begin: R.WITH_KW,
  end: /(?=^(?![ \t]))/m,
  scope: scopes.meta.withClause,
  beginCaptures: {
    '0': { name: scopes.keywords.flow }
  },
  patterns: [
    { include: '#flow-parameter' },
    { include: '#attribute-key' }
  ]
};

/**
 * All flow rules
 */
export const allFlows = [
    flowRuleName,
    flowArrow,
    flowOperand,
    flowTransition,
    whenClause,
    withClause
];
