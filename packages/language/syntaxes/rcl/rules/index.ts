//@index('./*', f => `export * from '${f.path}.ts'`)
export * from './collections.js'
export * from './comments.js'
export * from './embedded.js'
export * from './expressions.js'
export * from './flows.js'
export * from './identifiers.js'
export * from './imports.js'
export * from './keywords.js'
export * from './literals.js'
export * from './sections.js'
export * from './strings.js'
export * from './types.js'
//@endindex

// Export all rule collections
export { allLiterals } from './literals.js';
export { allIdentifiers } from './identifiers.js';
export { allKeywords } from './keywords.js';
export { allStrings } from './strings.js';
export { allEmbedded } from './embedded.js';
export { allFlows } from './flows.js';
export { allTypes } from './types.js';
export { allImports } from './imports.js';
export { allSections } from './sections.js';
export { allCollections } from './collections.js';
export { allExpressions } from './expressions.js';
export { allComments } from './comments.js';

// Combined export of all rules for easy use
import { allLiterals } from './literals.js';
import { allIdentifiers } from './identifiers.js';
import { allKeywords } from './keywords.js';
import { allStrings } from './strings.js';
import { allEmbedded } from './embedded.js';
import { allFlows } from './flows.js';
import { allTypes } from './types.js';
import { allImports } from './imports.js';
import { allSections } from './sections.js';
import { allCollections } from './collections.js';
import { allExpressions } from './expressions.js';
import { allComments } from './comments.js';

export const allRules = [
    ...allComments,
    ...allKeywords,
    ...allLiterals,
    ...allIdentifiers,
    ...allStrings,
    ...allEmbedded,
    ...allTypes,
    ...allFlows,
    ...allImports,
    ...allSections,
    ...allCollections,
    ...allExpressions,
];