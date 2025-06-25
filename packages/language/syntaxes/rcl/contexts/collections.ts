import { explicitMap, indentedList, inlineList } from '../rules/index.js';
import { collectionContextIncludes } from './repository.js';

indentedList.patterns = collectionContextIncludes;
explicitMap.patterns = collectionContextIncludes;
inlineList.patterns = collectionContextIncludes; 