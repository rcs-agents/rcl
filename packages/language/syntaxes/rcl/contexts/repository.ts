import type { BasicIncludePattern, Rule } from 'tmgrammar-toolkit';
import {
    allCollections,
    allComments,
    allExpressions,
    allFlows,
    allIdentifiers,
    allLiterals,
    allSections,
    allStrings,
    embeddedCode,
    importStatement,
    typeConversion,
} from '../rules/index.js';

function hasKey(rule: Rule): rule is Rule & { key: string } {
    if (!('key' in rule) || typeof rule.key !== 'string') {
        // This rule will be filtered out by hasKey
        return false;
    }
    return true;
}

export function toInclude(rule: Rule): BasicIncludePattern {
    if (!hasKey(rule)) {
        throw new Error(`Rule does not have a key and cannot be included in a repository. Rule: ${JSON.stringify(rule)}`);
    }
    return { include: `#${rule.key}` };
}

// Every rule that should be available in the grammar's repository.
export const allRules: Rule[] = [
    importStatement,
    ...allFlows,
    ...allLiterals,
    ...allIdentifiers,
    ...allExpressions,
    ...allStrings,
    embeddedCode,
    typeConversion,
    ...allComments,
    ...allCollections,
    ...allSections,
].filter(hasKey);


// Defines what can exist at the root of a file.
const fileContextRules: Rule[] = [
    importStatement,
    ...allSections,
    ...allComments,
];
export const fileContextIncludes: BasicIncludePattern[] = fileContextRules.map(toInclude);

// Defines what can be inside a section.
const sectionContextRules: Rule[] = [
    ...allLiterals,
    ...allIdentifiers,
    ...allCollections,
    ...allStrings,
    ...allFlows,
    ...allComments,
    embeddedCode,
    typeConversion,
    ...allSections, // for nested sections
];
export const sectionContextIncludes: BasicIncludePattern[] = sectionContextRules.map(toInclude);

// Defines what can be inside a collection (list, map).
const collectionContextRules: Rule[] = [
    ...allLiterals,
    ...allIdentifiers,
    ...allCollections, // for nested collections
    ...allComments,
];
export const collectionContextIncludes: BasicIncludePattern[] = collectionContextRules.map(toInclude);


// Defines what can be inside an expression (e.g., a grouped expression).
const expressionContextRules: Rule[] = [
    ...allExpressions,
    ...allLiterals,
    ...allIdentifiers,
    ...allComments,
    typeConversion,
];
export const expressionContextIncludes: BasicIncludePattern[] = expressionContextRules.map(toInclude); 