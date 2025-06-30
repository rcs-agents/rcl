// Defines the general RCL expression language.
import "../core/primitives";    // For LiteralValue, COMMON_NOUN, etc.
import "../data-types/type-system";   // For TypeConversion

// ======== Expression Terminals ========
terminal IS_NOT: /\bis\s+not\b/

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
    AndExpression ({BinaryRclExpression.left=current} __ operator='or' __ right=AndExpression)*;

// Logical AND
AndExpression returns RclExpression:
    EqualityExpression ({BinaryRclExpression.left=current} __ operator='and' __ right=EqualityExpression)*;

// Equality and Inequality
EqualityExpression returns RclExpression:
    ComparisonExpression ({BinaryRclExpression.left=current} __ operator=('==' | '!=' | IS_NOT | 'is') __ right=ComparisonExpression)*;

// Comparisons
ComparisonExpression returns RclExpression:
    AdditiveExpression ({BinaryRclExpression.left=current} __ operator=(LT | '<=' | GT | '>=') __ right=AdditiveExpression)*;

// Additive operations (+, -)
AdditiveExpression returns RclExpression:
    MultiplicativeExpression ({BinaryRclExpression.left=current} __ operator=('+' | '-') __ right=MultiplicativeExpression)*;

// Multiplicative operations (*, /, %)
MultiplicativeExpression returns RclExpression:
    UnaryExpression ({BinaryRclExpression.left=current} __ operator=('*' | SLASH | '%') __ right=UnaryExpression)*;

// Unary operations (not, -, +)
UnaryExpression returns RclExpression:
    ({UnaryRclExpression} operator='not' __ operand=UnaryExpression)
    | ({UnaryRclExpression} operator=('-' | '+') operand=UnaryExpression) // No space for unary +/- for now, can adjust if needed
    | PrimaryRclExpression;

// Primary expressions: the atoms of expressions
PrimaryRclExpression returns RclExpression:
    ({LiteralRclExpression} value=LiteralValue)
    | AttributeAccess
    | ({GroupedRclExpression} '(' __? inner=RclExpression __? ')')
    | TypeConversion;

// Attribute access rule
AttributeAccess returns AttributeAccessRclExpression:
    (context=('^'|'@')? __? name=COMMON_NOUN) (__? '.' __? property=COMMON_NOUN)?; 