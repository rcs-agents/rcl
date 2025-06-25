import type { BeginEndRule } from 'tmgrammar-toolkit';
import { scopesFor } from 'tmgrammar-toolkit';
import { R } from '../regex.js';

const scopes = scopesFor('rcl');

export const embeddedCode: BeginEndRule = {
    key: 'embedded-code',
    scope: scopes.markup.raw.block,
    begin: R.EMBEDDED_CODE_BEGIN,
    beginCaptures: {
        '1': { scope: scopes.punctuation.definition.keyword },
        '2': { scope: scopes.entity.name.tag },
    },
    end: R.EMBEDDED_CODE_END,
    endCaptures: {
        '1': { scope: scopes.punctuation.definition.keyword },
    },
    patterns: [
        {
            include: 'source.js',
        },
    ],
}; 