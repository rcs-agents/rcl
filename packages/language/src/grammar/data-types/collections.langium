// ======== Collection and List-Related Types ========
// This file contains collection structures that support schema definitions

import "./primitives";
import "./type-system";

// ======== Collections ========
ExplicitMap infers ExplicitMap:
    '%' __? '{' (__? entries+=PropertyAssignment)* __? '}';

PropertyAssignment infers PropertyAssignment:
    key=COMMON_NOUN __? ':' __? value=Value;

// ======== Lists ========
// This internal rule can match one or more items, used by NestedList and the new InlineList
InternalInlineList_CanBeOneOrMoreItems infers InternalInlineList_CanBeOneOrMoreItems:
    items+=ListItem (__? ',' __? items+=ListItem)*;

// Refactored InlineList to resolve ambiguity
InlineList infers InlineList:
    // Case 1: Starts with a NestedList. It can be a single NestedList, or a NestedList followed by more items.
    (firstNestedListItem=NestedList (__? ',' __? subsequentItems+=ListItem (__? ',' __? subsequentItems+=ListItem)*)? )
    // Case 2: Starts with a SimpleValue. It must be part of a multi-item list (at least two items).
    | (firstSimpleListItem=LiteralValue __? ',' __? secondListItem=ListItem (__? ',' __? remainingItems+=ListItem)* );

List infers List:
    InlineList | IndentedList;

IndentedList infers IndentedList:
    items+=IndentedListItem+;

IndentedListItem infers IndentedListItem:
    '-' __? item=ListItem;

ListItem infers ListItem:
    LiteralValue | NestedList; // NestedList here allows for list of lists

NestedList infers NestedList:
    '(' __? list=InternalInlineList_CanBeOneOrMoreItems __? ')'; // Uses the internal list rule

// ======== Dictionary ========
Dictionary infers Dictionary:
    entries+=DictionaryEntry+;

DictionaryEntry infers DictionaryEntry:
    key=(STRING | Identifier) __? ':' __? value=Value;

// ======== Mapped Types ========
MappedType infers MappedType:
    name=ProperNoun __ 'list' __ 'of' __? '(' __? schema=MappedTypeSchema __? ')' __? ':'
    items+=MappedTypeItem+;

MappedTypeSchema infers MappedTypeSchema:
    fields+=MappedTypeField (__? ',' __? fields+=MappedTypeField)*;

MappedTypeField infers MappedTypeField:
    name=COMMON_NOUN | typeConversion=TypeConversion;

MappedTypeItem infers MappedTypeItem:
    '-' __? values=InternalInlineList_CanBeOneOrMoreItems; // MappedTypeItem uses the internal list rule for its values

// ======== Value System ========
Value infers Value:
    // Order is important: try to match complex structures first
    ExplicitMap | List | Dictionary | MappedType | TypeConversion | Identifier |
    // SimpleValue is last as it's the most general
    LiteralValue; 