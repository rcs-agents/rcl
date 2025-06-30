// ======== Core AST Node Interfaces ========
// This file centralizes the core interface definitions for the RCL grammar's Abstract Syntax Tree (AST).
// By declaring shared interfaces here, we can break circular dependencies between grammar files.

// AbstractNamedSection provides a common interface for all named sections (e.g., agent, flow, messages),
// allowing them to be targets for cross-references (Ref).
interface AbstractNamedSection {
    name: string;
    sectionType?: string;
    attributes: Attribute[];
    subSections: Section[];
    flowContent: FlowContent[];
    emptyLines: string[];
}

// Forward declare other types that are part of the interface but defined in other files.
// This is necessary because we cannot import the full grammar files here without reintroducing circular dependencies.
interface Attribute {
    key: string;
    value: SimpleValue;
}
interface Section extends AbstractNamedSection {}
interface FlowContent {
    rules: FlowRule[];
}
interface FlowRule {
    source: string;
    transitions: string[];
    withClause?: WithClause;
}
interface WithClause {
    parameters: Parameter[];
}
interface Parameter {
    name: string;
    value: SimpleValue;
}
interface ImportStatement {
    source: string;
    alias?: string;
}

// ======== Value and Expression Interfaces ========
interface SimpleValue {
    // This will be a union type in the parser
}
interface SingleLineEmbeddedExpression {
    content: string;
}
interface MultiLineString {
    marker: string;
    has_block_content?: boolean;
}
interface TypeTag {
    type: string;
    value: string;
    modifier?: string;
} 