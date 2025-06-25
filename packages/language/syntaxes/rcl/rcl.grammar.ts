import type { Grammar } from 'tmgrammar-toolkit';
import { schema } from 'tmgrammar-toolkit';
import { allRules, mainPatterns } from './contexts/index.js';

export const rclGrammar: Grammar = {
    $schema: schema,
    name: 'rcl',
    scopeName: 'source.rcl',
    fileTypes: ['rcl'],
    patterns: mainPatterns,
    repositoryItems: allRules,
}; 