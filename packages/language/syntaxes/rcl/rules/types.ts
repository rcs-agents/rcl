import type { BeginEndRule } from 'tmgrammar-toolkit';
import { scopesFor } from 'tmgrammar-toolkit';
import { allIdentifiers } from './identifiers.js';
import { allLiterals } from './literals.js';
import { R } from '../regex.js';

const scopes = scopesFor('rcl');

export const typeConversion: BeginEndRule = {
    key: 'type-conversion',
    scope: scopes.meta.type,
    begin: R.TYPE_CONVERSION_BEGIN,
    beginCaptures: {
        '1': { scope: scopes.punctuation.definition.generic.begin },
        '2': { scope: scopes.storage.type },
    },
    end: />/,
    endCaptures: {
        '0': { scope: scopes.punctuation.definition.generic.end },
    },
    patterns: [...allLiterals, ...allIdentifiers],
}; 