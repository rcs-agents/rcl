/**
 * Comprehensive Language Grammar - TMGrammar Toolkit Example
 * 
 * This example demonstrates advanced patterns and best practices:
 * • Complex begin/end rules with captures
 * • Function declarations with parameters
 * • Template literals with interpolation
 * • Pattern grouping and organization
 * • Complete grammar with repository management
 * • Testing and generation utilities
 */

import {
  createGrammar,
  emitJSON,
  scopesFor,
  regex,
  type MatchRule,
  type BeginEndRule,
  type IncludeRule,
  type Grammar,
  type Rule,
} from '#src';
import { COMMENT, NUM, ID } from '#src/terminals';

// 1. Create static scopes for the language (recommended for production)
const scopes = scopesFor(
  { suffix: 'comprehensive', allowScopeExtension: false },
  { custom: { annotation: null } }
);

// 2. Define keywords for the language
const KEYWORDS = [
  'if', 'else', 'while', 'for', 'function', 'return', 
  'var', 'let', 'const', 'true', 'false', 'null', 'class', 'extends'
];

// 3. Basic token patterns using terminal helpers

// Comments using pre-built terminal patterns
const lineComment: MatchRule = {
  key: 'line-comment',
  scope: scopes.comment.line.double_slash,
  match: regex.concat(COMMENT.SLASHES, /.*$/)
};

const blockComment: BeginEndRule = {
  key: 'block-comment',
  scope: scopes.comment.block,
  begin: COMMENT.BLOCK.START,
  end: COMMENT.BLOCK.END
};

// Numbers using terminal patterns (multiple formats)
const numericLiteral: MatchRule = {
  key: 'numeric-literal',
  scope: scopes.constant.numeric,
  match: regex.oneOf([
    NUM.DEC,    // Decimal: 123, 123.45, 1.23e-4
    NUM.HEX,    // Hexadecimal: 0xFF, 0xABCD
    NUM.BIN,    // Binary: 0b1010
    NUM.OCT     // Octal: 0o777
  ])
};

// Boolean literals
const booleanLiteral: MatchRule = {
  key: 'boolean-literal',
  scope: scopes.constant.language,
  match: regex.keywords(['true', 'false', 'null'])
};

// String escape sequences
const escapeSequence: MatchRule = {
  key: 'escape-sequence',
  scope: scopes.constant.character.escape,
  match: /\\[\\'"nrt0]/
};

// Custom annotation pattern
const annotation = {
  key: 'annotation',
  scope: scopes.custom.annotation,
  match: /@[A-Za-z_][A-Za-z0-9_]*/
};

// 4. Complex patterns using begin/end rules

// Single-quoted strings
const singleQuotedString: BeginEndRule = {
  key: 'string-single',
  scope: scopes.string.quoted.single,
  begin: /'/,
  end: /'/,
  patterns: [escapeSequence]
};

// Double-quoted strings with more features
const doubleQuotedString: BeginEndRule = {
  key: 'string-double',
  scope: scopes.string.quoted.double,
  begin: /"/,
  end: /"/,
  patterns: [
    escapeSequence,
    {
      key: 'string-placeholder',
      scope: scopes.constant.other.placeholder,
      match: /%[sd%]/
    }
  ]
};

// Template literals (ES6-style) with interpolation
const templateLiteral: BeginEndRule = {
  key: 'template-literal',
  scope: scopes.string.quoted.other,
  begin: /`/,
  end: /`/,
  patterns: [
    escapeSequence,
    {
      key: 'template-expression',
      scope: scopes.meta.interpolation,
      begin: /\$\{/,
      end: /\}/,
      patterns: [
        // Include expressions here - simplified for this example
        { include: '#keywords' },
        { include: '#identifiers' }
      ]
    }
  ]
};

// Keywords with word boundaries
const keywords: MatchRule = {
  key: 'keywords',
  scope: scopes.keyword.control,
  match: regex.keywords(KEYWORDS)
};

// Function declarations with complex captures
const functionDeclaration: BeginEndRule = {
  key: 'function-declaration',
  scope: scopes.meta.function,
  begin: regex.concat(
    /\b(function)\s+/,  // function keyword
    regex.capture(ID),   // function name
    /\s*(\()/           // opening parenthesis
  ),
  beginCaptures: {
    '1': { scope: scopes.keyword.declaration.function },
    '2': { scope: scopes.entity.name.function },
    '3': { scope: scopes.punctuation.section.parens.begin }
  },
  end: /\)/,
  endCaptures: {
    '0': { scope: scopes.punctuation.section.parens.end }
  },
  patterns: [
    {
      key: 'parameter',
      scope: scopes.variable.parameter,
      match: ID
    },
    {
      key: 'parameter-separator',
      scope: scopes.punctuation.separator.comma,
      match: /,/
    }
  ]
};

// Class declarations
const classDeclaration: BeginEndRule = {
  key: 'class-declaration',
  scope: scopes.meta.class,
  begin: regex.concat(
    /\b(class)\s+/,      // class keyword
    regex.capture(ID),   // class name
    regex.optional(regex.concat(/\s+(extends)\s+/, regex.capture(ID))), // optional extends
    /\s*(\{)/           // opening brace
  ),
  beginCaptures: {
    '1': { scope: scopes.keyword.declaration.class },
    '2': { scope: scopes.entity.name.class },
    '3': { scope: scopes.keyword.control.inheritance },
    '4': { scope: scopes.entity.other.inherited_class },
    '5': { scope: scopes.punctuation.section.block.begin }
  },
  end: /\}/,
  endCaptures: {
    '0': { scope: scopes.punctuation.section.block.end }
  },
  patterns: [
    { include: '#function-declaration' },
    { include: '#identifiers' }
  ]
};

// Identifiers (variables, function names when used)
const identifiers: MatchRule = {
  key: 'identifiers',
  scope: scopes.variable.other.readwrite,
  match: ID
};

// Function calls
const functionCall: MatchRule = {
  key: 'function-call',
  scope: scopes.entity.name.function,
  match: regex.concat(ID, regex.before(/\s*\(/))
};

// 5. Group related patterns

// All comment patterns
const comments: IncludeRule = {
  key: 'comments',
  patterns: [lineComment, blockComment]
};

// All string patterns
const strings: IncludeRule = {
  key: 'strings',
  patterns: [
    templateLiteral,        // Check template literals first
    doubleQuotedString,
    singleQuotedString
  ]
};

// All literal values
const literals: IncludeRule = {
  key: 'literals',
  patterns: [
    strings,
    numericLiteral,
    booleanLiteral
  ]
};

// All expression patterns
const expressions: IncludeRule = {
  key: 'expressions',
  patterns: [
    literals,
    functionCall,    // Check function calls before identifiers
    identifiers
  ]
};

// 6. Collect all rules for the repository
const allRules: Rule[] = [
  // Comments
  lineComment,
  blockComment,
  comments,
  annotation,
  
  // Literals
  numericLiteral,
  booleanLiteral,
  escapeSequence,
  
  // Strings
  singleQuotedString,
  doubleQuotedString,
  templateLiteral,
  strings,
  
  // Keywords and identifiers
  keywords,
  identifiers,
  functionCall,
  functionDeclaration,
  classDeclaration,
  
  // Grouped patterns
  literals,
  expressions
];

// 7. Create the complete grammar
export const comprehensiveGrammar: Grammar = createGrammar(
  'Comprehensive Language',      // Display name
  'source.comprehensive',        // Scope name (source.* for programming languages)
  ['comp', 'comprehensive'],     // File extensions
  [                              // Top-level patterns (order matters!)
    comments,                    // Comments can appear anywhere
    annotation,
    classDeclaration,            // Class declarations
    functionDeclaration,         // Function declarations are statements
    keywords,                    // Keywords
    expressions                  // Other expressions
  ],
  {
    repositoryItems: allRules     // All rules for the repository
  }
);

// 8. Utility function to generate the grammar JSON
export async function generateGrammar(): Promise<string> {
  return await emitJSON(comprehensiveGrammar, {
    errorSourceFilePath: import.meta.url  // Better error messages
  });
}

// 9. Export individual patterns for testing and reuse
export {
  // Comment patterns
  lineComment,
  blockComment,
  comments,
  
  // Literal patterns
  numericLiteral,
  booleanLiteral,
  
  // String patterns
  singleQuotedString,
  doubleQuotedString,
  templateLiteral,
  strings,
  
  // Keywords and identifiers
  keywords,
  identifiers,
  functionCall,
  functionDeclaration,
  classDeclaration,
  
  // Grouped patterns
  literals,
  expressions,
  
  // Scopes for testing
  scopes
};

// Example usage and testing
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Comprehensive Language Grammar Example\n');
  
  // Generate and display the grammar
  generateGrammar()
    .then(json => {
      console.log('✅ Generated grammar successfully!');
      console.log('\n📄 Grammar JSON (first 500 chars):');
      console.log(json.substring(0, 500) + '...');
      
      // Show some example scopes
      console.log('\n🎨 Example scopes:');
      console.log(`  Keywords: ${scopes.keyword.control}`);
      console.log(`  Strings: ${scopes.string.quoted.double}`);
      console.log(`  Numbers: ${scopes.constant.numeric}`);
      console.log(`  Comments: ${scopes.comment.line.double_slash}`);
      console.log(`  Functions: ${scopes.entity.name.function}`);
      console.log(`  Classes: ${scopes.entity.name.class}`);
    })
    .catch(error => {
      console.error('❌ Error generating grammar:', error);
      process.exit(1);
    });
}

export default comprehensiveGrammar; 