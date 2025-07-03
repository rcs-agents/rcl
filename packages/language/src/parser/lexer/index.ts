/**
 * Main Lexer Entry Point
 * 
 * Exports the modular RCL lexer system with improved structure and specification compliance.
 */

export { RclLexer } from './core/lexer-base.js';
export { RclTokens } from './tokens/token-definitions.js';
export type { LexingResult, LexingError } from './core/lexer-base.js';

// Re-export for backward compatibility
export { RclLexer as RclCustomLexer };