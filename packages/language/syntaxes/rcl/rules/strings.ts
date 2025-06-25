import type { BeginEndRule } from 'tmgrammar-toolkit';
import { regex, scopesFor } from 'tmgrammar-toolkit';
import { R } from '../regex.js';

const scopes = scopesFor('rcl');

const multiLineString: BeginEndRule = {
    key: 'multi-line-string',
    scope: scopes.string.quoted('multiline'),
    begin: regex.oneOf([
        R.MULTILINE_STR_TRIM_LEAD_ONE_NL_END,
        R.MULTILINE_STR_TRIM_LEAD_NO_NL_END,
        R.MULTILINE_STR_KEEP_LEAD_ONE_NL_END,
        R.MULTILINE_STR_KEEP_ALL,
    ]),
    end: R.MULTILINE_STRING_END,
    patterns: [
        // content of the multiline string, can have other patterns here
    ],
};

export const allStrings = [multiLineString]; 