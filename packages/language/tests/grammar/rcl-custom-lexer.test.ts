import { RclCustomLexer, RclToken } from '../../src/parser/rcl-custom-lexer.js';
import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Test suite to demonstrate the RclCustomLexer functionality
 * This is not connected to Langium yet - it's a standalone test
 */

// Test basic tokenization
function testBasicTokenization() {
  console.log('=== Testing Basic Tokenization ===');
  
  const lexer = new RclCustomLexer();
  const input = `agent Test Agent
  displayName: "My Test Agent"
  brandName: "Test Brand"`;

  const result = lexer.tokenize(input);
  
  console.log('Input:', input);
  console.log('Tokens:');
  result.tokens.forEach((token, i) => {
    console.log(`  ${i}: ${token.tokenType.name} = "${token.image}" (${token.startLine}:${token.startColumn}-${token.endLine}:${token.endColumn})`);
  });
  
  if (result.errors.length > 0) {
    console.log('Errors:');
    result.errors.forEach(error => console.log(`  ${error.message}`));
  }
  
  console.log('');
}

// Test indentation handling
function testIndentation() {
  console.log('=== Testing Indentation ===');
  
  const lexer = new RclCustomLexer();
  const input = `agent Test Agent
  displayName: "Test"
  flow Welcome Flow
    :start -> "Hello"
    "Hello" -> :end`;

  const result = lexer.tokenize(input);
  
  console.log('Input:', input);
  console.log('Tokens (focusing on INDENT/DEDENT):');
  result.tokens.forEach((token, i) => {
    if (['INDENT', 'DEDENT', 'agent', 'flow', 'IDENTIFIER', 'ATOM', 'STRING'].includes(token.tokenType.name)) {
      console.log(`  ${i}: ${token.tokenType.name} = "${token.image}"`);
    }
  });
  
  console.log('');
}

// Test embedded expressions
function testEmbeddedExpressions() {
  console.log('=== Testing Embedded Expressions ===');
  
  const lexer = new RclCustomLexer();
  const input = `agent Test Agent
  displayName: $js> "Hello " + context.user.name
  description: $ts> calculateDescription(context)`;

  const result = lexer.tokenize(input);
  
  console.log('Input:', input);
  console.log('Expression tokens:');
  result.tokens.forEach((token, i) => {
    if (token.tokenType.name === 'SINGLE_LINE_EXPRESSION') {
      console.log(`  ${i}: ${token.tokenType.name} = "${token.image}"`);
    }
  });
  
  console.log('');
}

// Test type tags
function testTypeTags() {
  console.log('=== Testing Type Tags ===');
  
  const lexer = new RclCustomLexer();
  const input = `contact:
  email: <email user@example.com>
  phone: <phone +1234567890>
  website: <url https://example.com>`;

  const result = lexer.tokenize(input);
  
  console.log('Input:', input);
  console.log('Type-related tokens:');
  result.tokens.forEach((token, i) => {
    if (['LT', 'email', 'phone', 'url', 'IDENTIFIER', 'STRING', 'GT'].includes(token.tokenType.name)) {
      console.log(`  ${i}: ${token.tokenType.name} = "${token.image}"`);
    }
  });
  
  console.log('');
}

// Test boolean and null keywords
function testKeywords() {
  console.log('=== Testing Keywords ===');
  
  const lexer = new RclCustomLexer();
  const input = `config:
  enabled: True
  debug: False
  cache: Null
  timeout: None`;

  const result = lexer.tokenize(input);
  
  console.log('Input:', input);
  console.log('Keyword tokens:');
  result.tokens.forEach((token, i) => {
    if (['True', 'False', 'Null', 'None', 'ATTRIBUTE_KEY'].includes(token.tokenType.name)) {
      console.log(`  ${i}: ${token.tokenType.name} = "${token.image}"`);
    }
  });
  
  console.log('');
}

// Test message shortcuts
function testMessageShortcuts() {
  console.log('=== Testing Message Shortcuts ===');
  
  const lexer = new RclCustomLexer();
  const input = `messages Messages
  text "Welcome to our service!"
  richCard "Product Info"
    description: "Our latest product"
  reply "Get Started"
  dial "Call Support" <phone +1234567890>`;

  const result = lexer.tokenize(input);
  
  console.log('Input:', input);
  console.log('Shortcut-related tokens:');
  result.tokens.forEach((token, i) => {
    if (['text', 'richCard', 'reply', 'dial', 'STRING', 'phone'].includes(token.tokenType.name)) {
      console.log(`  ${i}: ${token.tokenType.name} = "${token.image}"`);
    }
  });
  
  console.log('');
}

// Test space-separated identifiers
function testSpaceSeparatedIdentifiers() {
  console.log('=== Testing Space-Separated Identifiers ===');
  
  const lexer = new RclCustomLexer();
  const input = `agent BMW Customer Service
  flow Contact Support Flow
  agentMessage Welcome Message
    text "Hello from BMW Customer Service"`;

  const result = lexer.tokenize(input);
  
  console.log('Input:', input);
  console.log('Identifier tokens:');
  result.tokens.forEach((token, i) => {
    if (token.tokenType.name === 'IDENTIFIER') {
      console.log(`  ${i}: ${token.tokenType.name} = "${token.image}"`);
    }
  });
  
  console.log('');
}

// Test error handling
function testErrorHandling() {
  console.log('=== Testing Error Handling ===');
  
  const lexer = new RclCustomLexer();
  const input = `agent Test Agent
  displayName: "Unclosed string
  invalidChar: @#$%`;

  const result = lexer.tokenize(input);
  
  console.log('Input:', input);
  console.log('Errors:');
  result.errors.forEach((error, i) => {
    console.log(`  ${i}: ${error.message} at line ${error.line}, column ${error.column}`);
  });
  
  console.log('');
}

// Run all tests
function runAllTests() {
  console.log('RCL Custom Lexer Test Suite');
  console.log('============================\n');
  
  testBasicTokenization();
  testIndentation();
  testEmbeddedExpressions();
  testTypeTags();
  testKeywords();
  testMessageShortcuts();
  testSpaceSeparatedIdentifiers();
  testErrorHandling();
  
  console.log('Test suite completed!');
}

// Export for potential use in other files
export {
  testBasicTokenization,
  testIndentation,
  testEmbeddedExpressions,
  testTypeTags,
  testKeywords,
  testMessageShortcuts,
  testSpaceSeparatedIdentifiers,
  testErrorHandling,
  runAllTests
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

describe('RclCustomLexer', () => {
  let lexer: RclCustomLexer;

  beforeEach(() => {
    lexer = new RclCustomLexer();
  });

  describe('Basic Tokenization', () => {
    it('should tokenize keywords correctly', () => {
      const input = 'agent import as from flow flows messages';
      const result = lexer.tokenize(input);
      
      expect(result.errors).toHaveLength(0);
      const tokenTypes = result.tokens.map(t => t.tokenType);
      
      expect(tokenTypes).toContain(RclToken.AGENT_KW);
      expect(tokenTypes).toContain(RclToken.IMPORT_KW);
      expect(tokenTypes).toContain(RclToken.AS_KW);
      expect(tokenTypes).toContain(RclToken.FROM_KW);
      expect(tokenTypes).toContain(RclToken.FLOW_KW);
      expect(tokenTypes).toContain(RclToken.FLOWS_KW);
      expect(tokenTypes).toContain(RclToken.MESSAGES_KW);
    });

    it('should tokenize boolean literals', () => {
      const input = 'True False Yes No On Off Enabled Disabled Active Inactive';
      const result = lexer.tokenize(input);
      
      expect(result.errors).toHaveLength(0);
      const tokenTypes = result.tokens.map(t => t.tokenType);
      
      expect(tokenTypes).toContain(RclToken.TRUE_KW);
      expect(tokenTypes).toContain(RclToken.FALSE_KW);
      expect(tokenTypes).toContain(RclToken.YES_KW);
      expect(tokenTypes).toContain(RclToken.NO_KW);
      expect(tokenTypes).toContain(RclToken.ON_KW);
      expect(tokenTypes).toContain(RclToken.OFF_KW);
      expect(tokenTypes).toContain(RclToken.ENABLED_KW);
      expect(tokenTypes).toContain(RclToken.DISABLED_KW);
      expect(tokenTypes).toContain(RclToken.ACTIVE_KW);
      expect(tokenTypes).toContain(RclToken.INACTIVE_KW);
    });

    it('should tokenize null literals', () => {
      const input = 'Null None Void';
      const result = lexer.tokenize(input);
      
      expect(result.errors).toHaveLength(0);
      const tokenTypes = result.tokens.map(t => t.tokenType);
      
      expect(tokenTypes).toContain(RclToken.NULL_KW);
      expect(tokenTypes).toContain(RclToken.NONE_KW);
      expect(tokenTypes).toContain(RclToken.VOID_KW);
    });

    it('should tokenize type names', () => {
      const input = 'email phone url datetime duration zipcode';
      const result = lexer.tokenize(input);
      
      expect(result.errors).toHaveLength(0);
      const tokenTypes = result.tokens.map(t => t.tokenType);
      
      expect(tokenTypes).toContain(RclToken.EMAIL_TYPE);
      expect(tokenTypes).toContain(RclToken.PHONE_TYPE);
      expect(tokenTypes).toContain(RclToken.URL_TYPE);
      expect(tokenTypes).toContain(RclToken.DATETIME_TYPE);
      expect(tokenTypes).toContain(RclToken.DURATION_TYPE);
      expect(tokenTypes).toContain(RclToken.ZIPCODE_TYPE);
    });

    it('should tokenize punctuation', () => {
      const input = ': , . / - | $ % @ ^ ( ) { } [ ] < >';
      const result = lexer.tokenize(input);
      
      expect(result.errors).toHaveLength(0);
      const tokenTypes = result.tokens.map(t => t.tokenType);
      
      expect(tokenTypes).toContain(RclToken.COLON);
      expect(tokenTypes).toContain(RclToken.COMMA);
      expect(tokenTypes).toContain(RclToken.DOT);
      expect(tokenTypes).toContain(RclToken.SLASH);
      expect(tokenTypes).toContain(RclToken.HYPHEN);
      expect(tokenTypes).toContain(RclToken.PIPE);
      expect(tokenTypes).toContain(RclToken.DOLLAR);
      expect(tokenTypes).toContain(RclToken.PERCENT);
      expect(tokenTypes).toContain(RclToken.AT);
      expect(tokenTypes).toContain(RclToken.CARET);
      expect(tokenTypes).toContain(RclToken.LPAREN);
      expect(tokenTypes).toContain(RclToken.RPAREN);
      expect(tokenTypes).toContain(RclToken.LBRACE);
      expect(tokenTypes).toContain(RclToken.RBRACE);
      expect(tokenTypes).toContain(RclToken.LBRACKET);
      expect(tokenTypes).toContain(RclToken.RBRACKET);
      expect(tokenTypes).toContain(RclToken.LT);
      expect(tokenTypes).toContain(RclToken.GT);
    });

    it('should tokenize strings and numbers', () => {
      const input = '"hello world" 42 3.14 someIdentifier';
      const result = lexer.tokenize(input);
      
      expect(result.errors).toHaveLength(0);
      const tokens = result.tokens.filter(t => t.tokenType !== RclToken.WS);
      
      expect(tokens[0].tokenType).toBe(RclToken.STRING);
      expect(tokens[0].image).toBe('"hello world"');
      
      expect(tokens[1].tokenType).toBe(RclToken.NUMBER);
      expect(tokens[1].image).toBe('42');
      
      expect(tokens[2].tokenType).toBe(RclToken.NUMBER);
      expect(tokens[2].image).toBe('3.14');
      
      expect(tokens[3].tokenType).toBe(RclToken.IDENTIFIER);
      expect(tokens[3].image).toBe('someIdentifier');
    });
  });

  describe('Indentation Handling', () => {
    it('should handle basic indentation', () => {
      const input = `agent Test:
    name: "Test Agent"
    version: "1.0"`;
      
      const result = lexer.tokenize(input);
      expect(result.errors).toHaveLength(0);
      
      const tokenTypes = result.tokens.map(t => t.tokenType);
      expect(tokenTypes).toContain(RclToken.INDENT);
      expect(tokenTypes).toContain(RclToken.DEDENT);
    });

    it('should handle multiple indent levels', () => {
      const input = `agent Test:
    flows:
        flow1:
            step1: action1
            step2: action2
        flow2:
            step1: action3`;
      
      const result = lexer.tokenize(input);
      expect(result.errors).toHaveLength(0);
      
      const indentCount = result.tokens.filter(t => t.tokenType === RclToken.INDENT).length;
      const dedentCount = result.tokens.filter(t => t.tokenType === RclToken.DEDENT).length;
      
      expect(indentCount).toBeGreaterThan(0);
      expect(dedentCount).toBeGreaterThan(0);
    });

    it('should handle mixed spaces and tabs gracefully', () => {
      const input = `agent Test:
\tname: "Test"
    version: "1.0"`;
      
      const result = lexer.tokenize(input);
      
      // Debug output
      console.log('Mixed tabs/spaces debug:');
      console.log('Errors:');
      result.errors.forEach(error => console.log(`  ${error.message}`));
      
      expect(result.errors).toHaveLength(0);
      
      // Should still produce tokens despite mixed indentation
      const tokens = result.tokens.filter(t => t.tokenType !== RclToken.WS && t.tokenType !== RclToken.NL);
      expect(tokens.length).toBeGreaterThan(0);
    });
  });

  describe('Comments', () => {
    it('should tokenize single-line comments', () => {
      const input = `# This is a comment
agent Test: # Another comment
    name: "Test"`;
      
      const result = lexer.tokenize(input);
      expect(result.errors).toHaveLength(0);
      
      const comments = result.tokens.filter(t => t.tokenType === RclToken.SL_COMMENT);
      expect(comments.length).toBe(2);
      expect(comments[0].image).toBe('# This is a comment');
      expect(comments[1].image).toBe('# Another comment');
    });

    it('should handle comments with special characters', () => {
      const input = '# Comment with special chars: !@#$%^&*()';
      const result = lexer.tokenize(input);
      
      expect(result.errors).toHaveLength(0);
      const comment = result.tokens.find(t => t.tokenType === RclToken.SL_COMMENT);
      expect(comment?.image).toBe('# Comment with special chars: !@#$%^&*()');
    });
  });

  describe('Expressions', () => {
    it('should tokenize single-line expressions', () => {
      const input = 'value: ${user.name + " test"}';
      const result = lexer.tokenize(input);
      
      expect(result.errors).toHaveLength(0);
      const expression = result.tokens.find(t => t.tokenType === RclToken.SINGLE_LINE_EXPRESSION);
      expect(expression).toBeDefined();
    });

    it('should handle multi-line expression markers', () => {
      const input = `value: \${{
  some expression
  multiple lines
}}`;
      const result = lexer.tokenize(input);
      
      expect(result.errors).toHaveLength(0);
      const startMarker = result.tokens.find(t => t.tokenType === RclToken.MULTI_LINE_EXPRESSION);
      expect(startMarker).toBeDefined();
    });
  });

  describe('Multi-line Strings', () => {
    it('should tokenize multi-line string markers', () => {
      const input = `text: |
  This is a
  multi-line string`;
      
      const result = lexer.tokenize(input);
      expect(result.errors).toHaveLength(0);
      
      const multilineMarker = result.tokens.find(t => 
        t.tokenType === RclToken.MULTILINE_STR_PRESERVE ||
        t.tokenType === RclToken.MULTILINE_STR_TRIM ||
        t.tokenType === RclToken.MULTILINE_STR_CLEAN ||
        t.tokenType === RclToken.MULTILINE_STR_PRESERVE_ALL
      );
      expect(multilineMarker).toBeDefined();
    });
  });

  describe('Comprehensive RCL Structure', () => {
    it('should tokenize a complete minimal RCL file', () => {
      const input = `agent BMW Customer Service:
    description: "Customer support agent for BMW"
    version: "1.0"

flows:
    Welcome Flow:
        start: welcome_message
        
messages:
    welcome_message:
        text: "Welcome to BMW Customer Service"`;

      const result = lexer.tokenize(input);
      expect(result.errors).toHaveLength(0);
      
      // Verify we have the main structure tokens
      const tokenTypes = result.tokens.map(t => t.tokenType);
      expect(tokenTypes).toContain(RclToken.AGENT_KW);
      expect(tokenTypes).toContain(RclToken.FLOWS_KW);
      expect(tokenTypes).toContain(RclToken.MESSAGES_KW);
    });

    it('should tokenize space-separated identifiers correctly', () => {
      const input = 'agent BMW Customer Service:';
      const result = lexer.tokenize(input);
      
      expect(result.errors).toHaveLength(0);
      
      const tokens = result.tokens.filter(t => t.tokenType !== RclToken.WS);
      expect(tokens[0].tokenType).toBe(RclToken.AGENT_KW);
      expect(tokens[1].tokenType).toBe(RclToken.IDENTIFIER);
      expect(tokens[1].image).toBe('BMW Customer Service');
      // The lexer correctly produces space-separated identifiers as single tokens
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid characters gracefully', () => {
      const input = 'agent Test\u0001: # Invalid control character';
      const result = lexer.tokenize(input);
      
      // Should have some tokens even with errors
      expect(result.tokens.length).toBeGreaterThan(0);
      
      // Should identify the agent keyword
      const agentToken = result.tokens.find(t => t.tokenType === RclToken.AGENT_KW);
      expect(agentToken).toBeDefined();
    });

    it('should handle empty input', () => {
      const result = lexer.tokenize('');
      expect(result.errors).toHaveLength(0);
      expect(result.tokens).toHaveLength(0);
    });

    it('should handle only whitespace', () => {
      const result = lexer.tokenize('   \n\t  \n  ');
      expect(result.errors).toHaveLength(0);
      
      // Should contain whitespace and newline tokens
      const hasWhitespace = result.tokens.some(t => 
        t.tokenType === RclToken.WS || t.tokenType === RclToken.NL
      );
      expect(hasWhitespace).toBe(true);
    });
  });

  describe('Type Tags', () => {
    it('should tokenize type tags with values', () => {
      const input = 'email<primary>email@example.com duration<5m>';
      const result = lexer.tokenize(input);
      
      expect(result.errors).toHaveLength(0);
      const tokenTypes = result.tokens.map(t => t.tokenType);
      expect(tokenTypes).toContain(RclToken.EMAIL_TYPE);
      expect(tokenTypes).toContain(RclToken.DURATION_TYPE);
      expect(tokenTypes).toContain(RclToken.LT);
      expect(tokenTypes).toContain(RclToken.GT);
    });
  });

  describe('ISO Duration Literals', () => {
    it('should tokenize ISO duration literals', () => {
      const input = 'timeout: PT5M duration: P1DT2H30M';
      const result = lexer.tokenize(input);
      
      expect(result.errors).toHaveLength(0);
      const durationTokens = result.tokens.filter(t => t.tokenType === RclToken.ISO_DURATION_LITERAL);
      expect(durationTokens.length).toBe(2);
      expect(durationTokens[0].image).toBe('PT5M');
      expect(durationTokens[1].image).toBe('P1DT2H30M');
    });
  });

  describe('Arrow Operators', () => {
    it('should tokenize arrow operators', () => {
      const input = 'flow1 -> flow2';
      const result = lexer.tokenize(input);
      
      expect(result.errors).toHaveLength(0);
      const arrowToken = result.tokens.find(t => t.tokenType === RclToken.ARROW);
      expect(arrowToken).toBeDefined();
      expect(arrowToken?.image).toBe('->');
    });
  });

  describe('Action Keywords', () => {
    it('should tokenize action-related keywords', () => {
      const input = 'dial openUrl shareLocation createCalendarEventAction composeAction';
      const result = lexer.tokenize(input);
      
      expect(result.errors).toHaveLength(0);
      const tokenTypes = result.tokens.map(t => t.tokenType);
      
      expect(tokenTypes).toContain(RclToken.DIAL_KW);
      expect(tokenTypes).toContain(RclToken.OPEN_URL_KW);
      expect(tokenTypes).toContain(RclToken.SHARE_LOCATION_KW);
      expect(tokenTypes).toContain(RclToken.CREATE_CALENDAR_EVENT_ACTION_KW);
      expect(tokenTypes).toContain(RclToken.COMPOSE_ACTION_KW);
    });
  });

  describe('Message Keywords', () => {
    it('should tokenize message-related keywords', () => {
      const input = 'agentMessage contentMessage suggestion richCard carousel';
      const result = lexer.tokenize(input);
      
      expect(result.errors).toHaveLength(0);
      const tokenTypes = result.tokens.map(t => t.tokenType);
      
      expect(tokenTypes).toContain(RclToken.AGENT_MESSAGE_KW);
      expect(tokenTypes).toContain(RclToken.CONTENT_MESSAGE_KW);
      expect(tokenTypes).toContain(RclToken.SUGGESTION_KW);
      expect(tokenTypes).toContain(RclToken.RICH_CARD_KW);
      expect(tokenTypes).toContain(RclToken.CAROUSEL_KW);
    });
  });

  describe('Flow Control Keywords', () => {
    it('should tokenize flow control keywords', () => {
      const input = 'if then else when unless with and or not is do end';
      const result = lexer.tokenize(input);
      
      expect(result.errors).toHaveLength(0);
      const tokenTypes = result.tokens.map(t => t.tokenType);
      
      expect(tokenTypes).toContain(RclToken.IF_KW);
      expect(tokenTypes).toContain(RclToken.THEN_KW);
      expect(tokenTypes).toContain(RclToken.ELSE_KW);
      expect(tokenTypes).toContain(RclToken.WHEN_KW);
      expect(tokenTypes).toContain(RclToken.UNLESS_KW);
      expect(tokenTypes).toContain(RclToken.WITH_KW);
      expect(tokenTypes).toContain(RclToken.AND_KW);
      expect(tokenTypes).toContain(RclToken.OR_KW);
      expect(tokenTypes).toContain(RclToken.NOT_KW);
      expect(tokenTypes).toContain(RclToken.IS_KW);
      expect(tokenTypes).toContain(RclToken.DO_KW);
      expect(tokenTypes).toContain(RclToken.END_KW);
    });
  });
}); 