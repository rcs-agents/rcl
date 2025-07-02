// ======== Import Statement Grammar ========
// This file handles import statements for RCL modules

import "./ast-nodes";
import "./primitives";

// ======== Parser Rules ========
// NOTE: Interface is defined in ast-nodes.langium
// An import statement consists of the 'import' keyword, a qualified name path,
// and an optional 'as' clause for aliasing.
/**
 * ImportStatement supports multi-level namespace paths and space-separated aliases.
 *
 * Example:
 *   import My Brand / Samples as Sample One
 *   import Shared / Common Flows / Support
 *
 * - Each PROPER_NOUN can include spaces (e.g., "My Brand").
 * - The alias after 'as' can also be a space-separated PROPER_NOUN.
 */
ImportStatement returns ImportStatement:
    'import' source+=PROPER_NOUN ( __? '/' __? source+=PROPER_NOUN)* ('as' alias=PROPER_NOUN)?;