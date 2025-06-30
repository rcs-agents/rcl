// ======== String and Multi-line String Handling ========
// This file contains string-related grammar rules

import "../core/primitives";

// ======== Multi-line String Terminals ========
// These markers must be followed by a newline to trigger a multi-line block.
terminal MULTILINE_STR_CLEAN: /\|(?=\s*#|\s*[\r\n])/;          // |
terminal MULTILINE_STR_TRIM: /\|-(?=\s*#|\s*[\r\n])/;         // |-
terminal MULTILINE_STR_PRESERVE: /\+\|(?=\s*#|\s*[\r\n])/;       // +|
terminal MULTILINE_STR_PRESERVE_ALL: /\+\|\+(?=\s*#|\s*[\r\n])/; // +|+

// ======== Multi-line String Interface ========
interface MultiLineString {
    marker: string;
    has_block_content?: string;
}

// ======== Parser Rules ========
// A multi-line string with various whitespace handling modes.
MultiLineString returns MultiLineString:
    marker=(MULTILINE_STR_CLEAN | MULTILINE_STR_TRIM | MULTILINE_STR_PRESERVE | MULTILINE_STR_PRESERVE_ALL)
    has_block_content='true';