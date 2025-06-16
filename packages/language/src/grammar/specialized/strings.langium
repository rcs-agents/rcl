import "../data-types/primitives";

// ======== Multi-line String Terminals ========
terminal MULTILINE_STR_TRIM_LEAD_ONE_NL_END: /\|\s*/;        // | (trim common leading, one newline at end)
terminal MULTILINE_STR_TRIM_LEAD_NO_NL_END: /\|-\s*/;        // |- (trim common leading, no trailing newline)
terminal MULTILINE_STR_KEEP_LEAD_ONE_NL_END: /\+\|\s*/;      // +| (preserve leading, one newline at end)
terminal MULTILINE_STR_KEEP_ALL: /\+\|\+\s*/;                // +|+ (preserve all whitespace/newlines)

// ======== Multi-line String Rules ========
MultiLineString infers MultiLineString:
    ( marker=MULTILINE_STR_TRIM_LEAD_ONE_NL_END
    | marker=MULTILINE_STR_TRIM_LEAD_NO_NL_END
    | marker=MULTILINE_STR_KEEP_LEAD_ONE_NL_END
    | marker=MULTILINE_STR_KEEP_ALL
    )
    // This is a conceptual placeholder. The actual multi-line content
    // exists between the implicit INDENT/DEDENT that follows the marker.
    // Adding a dummy optional assignment can help the generator see this rule as more substantial.
    has_block_content?='true'; // Dummy assignment