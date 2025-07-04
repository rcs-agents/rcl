
//@index(['./*.ts', '!types.ts'], (f, _) => `import { ${f.name.toUpperCase()}_SCOPE } from '${f.path}.js'`)
import { COMMENT_SCOPE } from './comment.js'
import { CONSTANT_SCOPE } from './constant.js'
import { ENTITY_SCOPE } from './entity.js'
import { INVALID_SCOPE } from './invalid.js'
import { KEYWORD_SCOPE } from './keyword.js'
import { MARKUP_SCOPE } from './markup.js'
import { META_SCOPE } from './meta.js'
import { PUNCTUATION_SCOPE } from './punctuation.js'
import { STORAGE_SCOPE } from './storage.js'
import { STRING_SCOPE } from './string.js'
import { SUPPORT_SCOPE } from './support.js'
import { VARIABLE_SCOPE } from './variable.js'
//@endindex

//@index(['./*.ts', '!types.ts'], (f, _) => `export { ${f.name.toUpperCase()}_SCOPE } from '${f.path}.js'`)
export { COMMENT_SCOPE } from './comment.js'
export { CONSTANT_SCOPE } from './constant.js'
export { ENTITY_SCOPE } from './entity.js'
export { INVALID_SCOPE } from './invalid.js'
export { KEYWORD_SCOPE } from './keyword.js'
export { MARKUP_SCOPE } from './markup.js'
export { META_SCOPE } from './meta.js'
export { PUNCTUATION_SCOPE } from './punctuation.js'
export { STORAGE_SCOPE } from './storage.js'
export { STRING_SCOPE } from './string.js'
export { SUPPORT_SCOPE } from './support.js'
export { VARIABLE_SCOPE } from './variable.js'
//@endindex

/**
 * Raw scope definitions for all standard TextMate scope categories.
 * Used for merging with custom scope definitions in scopesFor().
 */
export const WELL_KNOWN_SCOPES = {
//@index(['./*.ts', '!types.ts'], (f, _) => `  ${f.name}: ${f.name.toUpperCase()}_SCOPE,`)
  comment: COMMENT_SCOPE,
  constant: CONSTANT_SCOPE,
  entity: ENTITY_SCOPE,
  invalid: INVALID_SCOPE,
  keyword: KEYWORD_SCOPE,
  markup: MARKUP_SCOPE,
  meta: META_SCOPE,
  punctuation: PUNCTUATION_SCOPE,
  storage: STORAGE_SCOPE,
  string: STRING_SCOPE,
  support: SUPPORT_SCOPE,
  variable: VARIABLE_SCOPE,
//@endindex
}
