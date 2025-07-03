/**
 * Base Section Types
 * 
 * Common interfaces for section-level constructs.
 */

import type { AstNode } from '../core/base-types.js';

/**
 * Base interface for all section types
 */
export interface Section extends AstNode {
  name: string;
}