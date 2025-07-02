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
 * - Each IDENTIFIER can include spaces (e.g., "My Brand").
 * - The alias after 'as' can also be a space-separated IDENTIFIER.
 * - Optional 'from' clause for specifying source files.
 */
ImportStatement returns ImportStatement:
    IMPORT_KW importedNames+=IDENTIFIER ( __? '/' __? importedNames+=IDENTIFIER)* 
    (AS_KW alias=IDENTIFIER)? 
    (FROM_KW source=STRING)?;