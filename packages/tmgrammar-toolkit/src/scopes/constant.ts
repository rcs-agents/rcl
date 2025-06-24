import { buildScopes } from './lib/internal.js';
import type { Scope, ScopeTree } from './types.js';

/**
 * Root scope for `constant`.
 * Fixed values including literals, language constants, and escape sequences.
 * Distinguish between user-defined constants (`entity.name.constant`) and literal values.
 * Full path: `constant`
 * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#constant)
 * 
 * @example
 * ```typescript
 * scopes.constant.numeric.integer.decimal // "constant.numeric.integer.decimal"
 * scopes.constant.character.escape("js") // "constant.character.escape.js"
 * scopes.constant.language // "constant.language"
 * ```
 */
export type ConstantScope = ScopeTree<'constant', {
  /**
   * Represents the `constant.numeric` scope.
   * All numeric literals.
   * Full path: `constant.numeric`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#constant)
   */
  numeric: ScopeTree<'numeric', {
    /**
     * Represents the `constant.numeric.integer` scope.
     * Integer values.
     * Full path: `constant.numeric.integer`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#constant)
     */
    integer: ScopeTree<'integer', {
      /**
       * Represents the `constant.numeric.integer.binary` scope.
       * Binary integers (`0b1010`).
       * Full path: `constant.numeric.integer.binary`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#constant)
       */
      binary: Scope<'binary'>;
      /**
       * Represents the `constant.numeric.integer.octal` scope.
       * Octal integers (`0o777`).
       * Full path: `constant.numeric.integer.octal`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#constant)
       */
      octal: Scope<'octal'>;
      /**
       * Represents the `constant.numeric.integer.decimal` scope.
       * Decimal integers (`42`).
       * Full path: `constant.numeric.integer.decimal`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#constant)
       */
      decimal: Scope<'decimal'>;
      /**
       * Represents the `constant.numeric.integer.hexadecimal` scope.
       * Hex integers (`0xFF`).
       * Full path: `constant.numeric.integer.hexadecimal`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#constant)
       */
      hexadecimal: Scope<'hexadecimal'>;
      /**
       * Represents the `constant.numeric.integer.other` scope.
       * Other integer formats.
       * Full path: `constant.numeric.integer.other`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#constant)
       */
      other: Scope<'other'>;
    }>;
    /**
     * Represents the `constant.numeric.float` scope.
     * Floating-point values.
     * Full path: `constant.numeric.float`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#constant)
     */
    float: ScopeTree<'float', {
      /**
       * Represents the `constant.numeric.float.binary` scope.
       * Binary floats.
       * Full path: `constant.numeric.float.binary`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#constant)
       */
      binary: Scope<'binary'>;
      /**
       * Represents the `constant.numeric.float.octal` scope.
       * Octal floats.
       * Full path: `constant.numeric.float.octal`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#constant)
       */
      octal: Scope<'octal'>;
      /**
       * Represents the `constant.numeric.float.decimal` scope.
       * Decimal floats (`3.14`).
       * Full path: `constant.numeric.float.decimal`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#constant)
       */
      decimal: Scope<'decimal'>;
      /**
       * Represents the `constant.numeric.float.hexadecimal` scope.
       * Hex floats (`0x1.5p3`).
       * Full path: `constant.numeric.float.hexadecimal`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#constant)
       */
      hexadecimal: Scope<'hexadecimal'>;
      /**
       * Represents the `constant.numeric.float.other` scope.
       * Other float formats.
       * Full path: `constant.numeric.float.other`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#constant)
       */
      other: Scope<'other'>;
    }>;
    /**
     * Represents the `constant.numeric.complex` scope.
     * Complex numbers.
     * Full path: `constant.numeric.complex`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#constant)
     */
    complex: ScopeTree<'complex', {
      /**
       * Represents the `constant.numeric.complex.real` scope.
       * Real part of complex numbers.
       * Full path: `constant.numeric.complex.real`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#constant)
       */
      real: Scope<'real'>;
      /**
       * Represents the `constant.numeric.complex.imaginary` scope.
       * Imaginary part of complex numbers.
       * Full path: `constant.numeric.complex.imaginary`
       * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#constant)
       */
      imaginary: Scope<'imaginary'>;
    }>;
  }>;
  
  /**
   * Represents the `constant.character` scope.
   * Character-related constants.
   * Full path: `constant.character`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#constant)
   */
  character: ScopeTree<'character', {
    /**
     * Represents the `constant.character.escape` scope.
     * Escape sequences (`\\n`, `\\t`, `\\u0041`).
     * Full path: `constant.character.escape`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#constant)
     */
    escape: Scope<'escape'>;
  }>;

  /**
   * Represents the `constant.language` scope.
   * Built-in constants (`true`, `false`, `nil`, `undefined`).
   * Full path: `constant.language`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#constant)
   */
  language: Scope<'language'>;

  /**
   * Represents the `constant.other` scope.
   * Other constants (CSS colors, symbols).
   * Full path: `constant.other`
   * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#constant)
   */
  other: ScopeTree<'other', {
    /**
     * Represents the `constant.other.placeholder` scope.
     * Format placeholders (`%s`, `{0}`).
     * Full path: `constant.other.placeholder`
     * From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#constant)
     */
    placeholder: Scope<'placeholder'>;
  }>;
}>;

export const CONSTANT_SCOPE: ConstantScope = buildScopes<ConstantScope>([
  ['numeric', [
    ['integer', [
      ['binary', []],
      ['octal', []],
      ['decimal', []],
      ['hexadecimal', []],
      ['other', []],
    ]],
    ['float', [
      ['binary', []],
      ['octal', []],
      ['decimal', []],
      ['hexadecimal', []],
      ['other', []],
    ]],
    ['complex', []],
    ['other', []],
  ]],
  ['character', [
    ['escape', []],
  ]],
  ['language', []],
  ['other', []],
], 'constant'); 