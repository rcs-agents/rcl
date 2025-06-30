// ======== Rich Card System Grammar ========
// This file implements the rich card structures for enhanced message formatting

import "../core/ast-nodes";
import "../core/primitives";
import "../data-types/collections";
import "../core/embedded-code";

// ======== Rich Card Parser Rules ========
// NOTE: Using terminal-first design due to Langium limitations
// All card structures use only terminals and literals

RichCard returns RichCard:
    'richCard'
    NL?
    INDENT
    (cardType=StandaloneCard | cardType=CarouselCard)
    DEDENT;

StandaloneCard returns StandaloneCard:
    'standaloneCard'
    NL?
    INDENT
    (attributes+=CardAttribute | suggestions+=CardSuggestion | emptyLines+=EmptyLine)*
    DEDENT;

CarouselCard returns CarouselCard:
    'carouselCard'
    NL?
    INDENT
    (cards+=StandaloneCard | attributes+=CardAttribute | emptyLines+=EmptyLine)*
    DEDENT;

CardSuggestion returns CardSuggestion:
    'cardSuggestion'
    NL?
    INDENT
    (attributes+=CardAttribute | emptyLines+=EmptyLine)*
    DEDENT;

// ======== Card Attributes ========
CardAttribute returns CardAttribute:
    key=('title' | 'description' | 'thumbnail' | 'height' | 'orientation') ':' (__? | WS | NL)? value=SimpleValue
    | key=COMMON_NOUN ':' (__? | WS | NL)? value=SimpleValue; 