//@index('./*.ts', f => `export * from '${f.path}.js'`)
export * from './regex.js'
//@endindex

// Export regex functions as a namespace
import * as regexUtils from './regex.js';
export const regex = regexUtils;