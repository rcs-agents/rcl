import type { BasicIncludePattern } from 'tmgrammar-toolkit';
import './collections.js';
import './expression.js';
import './sections.js';
import { allRules, fileContextIncludes } from './repository.js';

export const mainPatterns: BasicIncludePattern[] = fileContextIncludes;

export { allRules }; 