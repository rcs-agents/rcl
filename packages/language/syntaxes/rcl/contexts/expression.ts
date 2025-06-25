import { allExpressions, groupedExpression } from '../rules/index.js';
import { expressionContextIncludes } from './repository.js';

groupedExpression.patterns = expressionContextIncludes;

export const allConfiguredExpressions = allExpressions; 