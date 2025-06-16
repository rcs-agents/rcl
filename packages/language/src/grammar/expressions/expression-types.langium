// Defines the general RCL expression language.
import "../data-types/primitives";    // For LiteralValue, COMMON_NOUN, etc.
import "../data-types/type-system";   // For TypeConversion

// ======== Expression Terminals ========
terminal IS_NOT: /is\s+not/;

// ======== AST Interface Definitions ========
interface RclExpression {}

interface BinaryRclExpression extends RclExpression {
    left: RclExpression;
    operator: string;
    right: RclExpression;
}

interface UnaryRclExpression extends RclExpression {
    operator: string;
    operand: RclExpression;
}

interface LiteralRclExpression extends RclExpression { 
    value: LiteralValue; // From primitives.langium
}

interface AttributeAccessRclExpression extends RclExpression {
    context?: '^'|'@';
    name: string;     // COMMON_NOUN is expected to return string
    property?: string; // COMMON_NOUN is expected to return string
}

interface GroupedRclExpression extends RclExpression { 
    inner: RclExpression;
}

// ======== Parser Rules ========

// Root rule for all RCL expressions.
RclExpression returns RclExpression:
    OrExpression;

// Logical OR - lowest precedence for binary operators
OrExpression returns RclExpression:
    AndExpression ({BinaryRclExpression.left=current} operator='or' right=AndExpression)*;

// Logical AND
AndExpression returns RclExpression:
    EqualityExpression ({BinaryRclExpression.left=current} operator='and' right=EqualityExpression)*;

// Equality and Inequality
EqualityExpression returns RclExpression:
    ComparisonExpression ({BinaryRclExpression.left=current} operator=('==' | '!=' | IS_NOT | 'is') right=ComparisonExpression)*;

// Comparisons
ComparisonExpression returns RclExpression:
    AdditiveExpression ({BinaryRclExpression.left=current} operator=('<' | '<=' | '>' | '>=') right=AdditiveExpression)*;

// Additive operations (+, -)
AdditiveExpression returns RclExpression:
    MultiplicativeExpression ({BinaryRclExpression.left=current} operator=('+' | '-') right=MultiplicativeExpression)*;

// Multiplicative operations (*, /, %)
MultiplicativeExpression returns RclExpression:
    UnaryExpression ({BinaryRclExpression.left=current} operator=('*' | '/' | '%') right=UnaryExpression)*;

// Unary operations (not, -, +)
UnaryExpression returns RclExpression:
    ({UnaryRclExpression} operator=('not' | '-' | '+') operand=UnaryExpression)
    | PrimaryRclExpression;

// Primary expressions: the atoms of expressions
PrimaryRclExpression returns RclExpression:
    ({LiteralRclExpression} value=LiteralValue)
    | AttributeAccess
    | ({GroupedRclExpression} '(' inner=RclExpression ')')
    | TypeConversion;

// Attribute access rule
AttributeAccess returns AttributeAccessRclExpression:
    (context=('^'|'@')? name=COMMON_NOUN) ('.' property=COMMON_NOUN)?; 