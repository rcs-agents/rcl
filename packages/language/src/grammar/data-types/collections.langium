// ======== Collection and List-Related Types ========
// This file contains collection structures that support schema definitions

import "./primitives";
import "./type-system";

// ======== Collections ========
ExplicitMap infers ExplicitMap:
    '%' '{' (entries+=PropertyAssignment)* '}';

PropertyAssignment infers PropertyAssignment:
    key=COMMON_NOUN ':' value=Value;

// ======== Lists ========
// This internal rule can match one or more items, used by NestedList and the new InlineList
InternalInlineList_CanBeOneOrMoreItems infers InternalInlineList_CanBeOneOrMoreItems:
    items+=ListItem (',' items+=ListItem)*;

// Refactored InlineList to resolve ambiguity
InlineList infers InlineList:
    // Case 1: Starts with a NestedList. It can be a single NestedList, or a NestedList followed by more items.
    (firstNestedListItem=NestedList (',' subsequentItems+=ListItem (',' subsequentItems+=ListItem)*)? )
    // Case 2: Starts with a SimpleValue. It must be part of a multi-item list (at least two items).
    | (firstSimpleListItem=LiteralValue ',' secondListItem=ListItem (',' remainingItems+=ListItem)* );

List infers List:
    InlineList | IndentedList;

IndentedList infers IndentedList:
    items+=IndentedListItem+;

IndentedListItem infers IndentedListItem:
    '-' item=ListItem;

ListItem infers ListItem:
    LiteralValue | NestedList; // NestedList here allows for list of lists

NestedList infers NestedList:
    '(' list=InternalInlineList_CanBeOneOrMoreItems ')'; // Uses the internal list rule

// ======== Dictionary ========
Dictionary infers Dictionary:
    entries+=DictionaryEntry+;

DictionaryEntry infers DictionaryEntry:
    key=(STRING | Identifier) ':' value=Value;

// ======== Mapped Types ========
MappedType infers MappedType:
    name=ProperNoun 'list' 'of' '(' schema=MappedTypeSchema ')' ':'
    items+=MappedTypeItem+;

MappedTypeSchema infers MappedTypeSchema:
    fields+=MappedTypeField (',' fields+=MappedTypeField)*;

MappedTypeField infers MappedTypeField:
    name=COMMON_NOUN | typeConversion=TypeConversion;

MappedTypeItem infers MappedTypeItem:
    '-' values=InternalInlineList_CanBeOneOrMoreItems; // MappedTypeItem uses the internal list rule for its values

// ======== Value System ========
Value infers Value:
    // Order is important: try to match complex structures first
    ExplicitMap | List | Dictionary | MappedType | TypeConversion | Identifier |
    // SimpleValue is last as it's the most general
    LiteralValue; 