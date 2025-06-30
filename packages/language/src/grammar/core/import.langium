import "./primitives";

// ======== Import Statement Grammar ========
// Handles import statements with qualified names, optional attributes, and aliases

interface ImportStatement {
    source: string;
    attribute?: AttributePath;
    alias?: string;
}

// More explicit import statement that handles the path components directly
ImportStatement returns ImportStatement:
    'import' __ source=ImportPath ("'s" __ attribute=AttributePath)? (__ 'as' __ alias=PROPER_NOUN)? (NL | EOF);

// Import path that explicitly handles slash-separated proper nouns without ambiguity
ImportPath returns string:
    PROPER_NOUN (__ '/' __ PROPER_NOUN)*;