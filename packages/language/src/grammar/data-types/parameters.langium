// ======== Parameter Handling ========
// This file contains parameter definitions for configuration sections

import "../core/primitives";
import "../data-types/collections";

// ======== Parser Rules ========
// NOTE: Interface is defined in ast-nodes.langium
Parameter returns Parameter:
    name=COMMON_NOUN ':' value=SimpleValue; 