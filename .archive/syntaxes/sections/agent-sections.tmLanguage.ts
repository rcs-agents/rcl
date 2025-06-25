/**
 * Agent Sections TextMate Grammar
 */

import {
  scopesFor,
  type BeginEndRule,
  type Rule,
} from 'tmgrammar-toolkit';

const scopes = scopesFor('rcl');

const agentBlockDefinition: BeginEndRule = {
  key: 'agent-block-definition',
  scope: scopes.meta.section.agent,
  begin: /^\s*(agent)\s+([A-Z][A-Za-z0-9\s]*[A-Za-z0-9])\s*$/,
  beginCaptures: {
    '1': { scope: scopes.keyword.control.section },
    '2': { scope: scopes.entity.name.section.agent },
  },
  end: /^(?=\S)(?!\s*#)/,
  patterns: [
    { include: '#section-level-patterns' },
  ],
};

export const agentSections: Rule = {
  key: 'agent-sections',
  patterns: [
    agentBlockDefinition,
  ],
}; 