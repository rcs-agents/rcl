/**
 * Main RCL TextMate grammar assembly
 */

// Import all pattern repositories
import { commentsRepository } from './patterns/comments.js';
import { collectionsRepository } from './patterns/collections.js';
import { embeddedExpressionsRepository } from './patterns/embedded.js';
import { expressionsRepository } from './patterns/expressions.js';
import { flowControlRepository } from './patterns/flow-control.js';
import { flowRulesRepository } from './patterns/flow-rules.js';
import { keywordsRepository } from './patterns/keywords.js';
import { multilineStringsRepository } from './patterns/multiline-strings.js';
import { primitivesRepository } from './patterns/primitives.js';
import { referencesRepository } from './patterns/references.js';
import { sectionsRepository } from './patterns/sections.js';
import { typeConversionsRepository } from './patterns/type-conversions.js';

// Import all context rules
import { fileContext } from './contexts/file-context.js';
import {
	flowContextRepository,
} from './contexts/flow-context.js';
import { propertyContextRepository } from './contexts/property-context.js';
import { sectionContextRepository } from './contexts/section-context.js';

const allRulesFromRepos = [
	...Object.values(commentsRepository),
	...Object.values(primitivesRepository),
	...Object.values(referencesRepository),
	...Object.values(embeddedExpressionsRepository),
	...Object.values(sectionsRepository),
	...Object.values(flowRulesRepository),
	...Object.values(collectionsRepository),
	...Object.values(multilineStringsRepository),
	...Object.values(typeConversionsRepository),
	...Object.values(keywordsRepository),
	...Object.values(expressionsRepository),
	...Object.values(flowControlRepository),
];

const allContextRules: any[] = [
	fileContext,
	...Object.values(sectionContextRepository),
	...Object.values(propertyContextRepository),
	...Object.values(flowContextRepository),
];

const repositoryItems: any[] = [...allRulesFromRepos, ...allContextRules];

export const rclGrammar: any = {
	$schema: "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
	name: 'RCL',
	scopeName: 'source.rcl',
	fileTypes: ['rcl'],
	patterns: [fileContext],
	repositoryItems,
};

// TODO: Populate with actual RCL grammar patterns and structure
// TODO: Flesh out #property-value-patterns in property-context.ts (collections, multiline strings etc.)
// TODO: Implement flow control structures (if/when/unless) in flow-context.ts 