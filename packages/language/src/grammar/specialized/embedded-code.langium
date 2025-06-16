import "../data-types/primitives"; // For basic terminals and types

// ======== Embedded Code Block Terminals ========
terminal SINGLE_LINE_EMBEDDED_CODE_BLOCK: /\$((js|ts)?>)\s*[^\r\n]*/;     // $js> code, $ts> code, $> code
terminal MULTI_LINE_EMBEDDED_CODE_BLOCK_START: /\$((js|ts)?)>>>/;         // $ts>>>, $js>>>, $>>>

// ======== Embedded Code Block Rules ========
SingleLineEmbeddedCodeBlock infers SingleLineEmbeddedCodeBlock:
    content=SINGLE_LINE_EMBEDDED_CODE_BLOCK;

MultiLineEmbeddedCodeBlock infers MultiLineEmbeddedCodeBlock:
    start=MULTI_LINE_EMBEDDED_CODE_BLOCK_START
    has_code_block?='true'; // Dummy assignment

EmbeddedCodeBlock infers EmbeddedCodeBlock:
    SingleLineEmbeddedCodeBlock | MultiLineEmbeddedCodeBlock;