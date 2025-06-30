// ======== Import Statement Grammar ========
// This file handles import statements for RCL modules

import "./ast-nodes";
import "./primitives";

// ======== Parser Rules ========
// NOTE: Interface is defined in ast-nodes.langium
// An import statement consists of the 'import' keyword, a qualified name path,
// and an optional 'as' clause for aliasing.
ImportStatement returns ImportStatement:
    'import' source=ImportPath ('as' alias=PROPER_NOUN)?;