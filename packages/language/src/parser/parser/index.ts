/**
 * Main Parser Entry Point
 * 
 * Exports the modular RCL parser system with improved structure and specification compliance.
 */

export { RclParser } from './core/parser-base.js';
export type { ParseResult, ParseError } from './core/parser-base.js';

// Re-export for backward compatibility
export { RclParser as RclCustomParser };