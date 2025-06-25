import type { Rule, BeginEndRule } from 'tmgrammar-toolkit';
import { scopesFor } from 'tmgrammar-toolkit';
import { R } from '../regex.js';
import { allIdentifiers } from './identifiers.js';

const scopes = scopesFor('rcl');

const flowRule: BeginEndRule = {
    key: 'flow-rule',
    scope: scopes.meta.block,
    begin: R.FLOW_RULE_BEGIN,
    beginCaptures: {
        '1': { scope: scopes.entity.name.function },
        '2': { scope: scopes.keyword.operator.logical },
    },
    end: R.FLOW_RULE_END,
    patterns: [
        ...allIdentifiers,
    ],
};

export const allFlows: Rule[] = [flowRule];
