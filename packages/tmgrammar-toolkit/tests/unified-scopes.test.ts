import { describe, test, expect } from 'vitest';
import { scopes, scopesFor } from '../src/scopes/index.js';
import { buildScopes, buildLanguageScopes, createScopeNode } from '../src/scopes/lib/internal.js';
import type { CommentScope } from '../src/scopes/comment.js';

describe('Unified Scope Functions', () => {
  describe('createScopeNode', () => {
    test('should create regular scope nodes', () => {
      const scope = createScopeNode('keyword.control.conditional');
      
      expect(scope.toString()).toBe('keyword.control.conditional');
      expect(scope('js')).toBe('keyword.control.conditional.js');
      expect(`${scope}`).toBe('keyword.control.conditional'); // Symbol.toPrimitive
    });

    test('should convert snake_case to kebab-case', () => {
      const scope = createScopeNode('comment.line.double_slash');
      
      expect(scope.toString()).toBe('comment.line.double-slash');
      expect(scope('ts')).toBe('comment.line.double-slash.ts');
    });

    test('should create language-specific scope nodes', () => {
      const jsScope = createScopeNode('keyword.control.conditional', undefined, 'js');
      
      expect(jsScope.toString()).toBe('keyword.control.conditional.js');
      expect(jsScope('async')).toBe('keyword.control.conditional.js.async');
      expect(`${jsScope}`).toBe('keyword.control.conditional.js'); // Symbol.toPrimitive
    });

    test('should handle scope nodes with children', () => {
      const childScope = createScopeNode('child');
      const parentScope = createScopeNode('parent', { child: childScope });
      
      expect(parentScope.toString()).toBe('parent');
      expect(parentScope.child.toString()).toBe('child');
      expect(parentScope('js')).toBe('parent.js');
    });
  });

  describe('buildScopes', () => {
    test('should build regular scope trees from tuple definitions', () => {
      const commentScope = buildScopes<CommentScope>([
        ['line', [
          ['double_slash', []],
          ['number_sign', []],
        ]],
        ['block', [
          ['documentation', []],
        ]],
      ], 'comment');

      expect(commentScope.line.toString()).toBe('comment.line');
      expect(commentScope.line.double_slash.toString()).toBe('comment.line.double-slash');
      expect(commentScope.line.number_sign.toString()).toBe('comment.line.number-sign');
      expect(commentScope.block.documentation.toString()).toBe('comment.block.documentation');
      
      // Test language suffix functionality
      expect(commentScope.line.double_slash('js')).toBe('comment.line.double-slash.js');
    });

    test('should build language-specific scope trees', () => {
      const jsCommentScope = buildScopes<CommentScope>([
        ['line', [
          ['double_slash', []],
        ]],
        ['block', []],
      ], 'comment', 'js');

      expect(jsCommentScope.line.toString()).toBe('comment.line.js');
      expect(jsCommentScope.line.double_slash.toString()).toBe('comment.line.double-slash.js');
      expect(jsCommentScope.block.toString()).toBe('comment.block.js');
      
      // Test additional suffix functionality
      expect(jsCommentScope.line.double_slash('async')).toBe('comment.line.double-slash.js.async');
    });
  });

  describe('buildLanguageScopes', () => {
    test('should transform existing scope objects to language-specific versions', () => {
      const regularScopes = {
        keyword: {
          control: {
            conditional: createScopeNode('keyword.control.conditional'),
            toString: () => 'keyword.control',
          },
          toString: () => 'keyword',
        },
        comment: {
          line: {
            double_slash: createScopeNode('comment.line.double_slash'),
            toString: () => 'comment.line',
          },
          toString: () => 'comment',
        },
      };

      const jsScopes = buildLanguageScopes(regularScopes, 'js');

      expect(jsScopes.keyword.control.conditional.toString()).toBe('keyword.control.conditional.js');
      expect(jsScopes.comment.line.double_slash.toString()).toBe('comment.line.double-slash.js');
      
      // Test additional suffix functionality
      expect(jsScopes.keyword.control.conditional('async')).toBe('keyword.control.conditional.js.async');
    });
  });

  describe('scopes integration', () => {
    test('should provide access to all standard TextMate scopes', () => {
      // Test a few key scopes from different categories
      expect(scopes.keyword.control.conditional.toString()).toBe('keyword.control.conditional');
      expect(scopes.comment.line.double_slash.toString()).toBe('comment.line.double-slash');
      expect(scopes.string.quoted.single.toString()).toBe('string.quoted.single');
      expect(scopes.constant.numeric.integer.toString()).toBe('constant.numeric.integer');
      expect(scopes.punctuation.definition.string.begin.toString()).toBe('punctuation.definition.string.begin');
    });

    test('should allow language suffixes on all scopes', () => {
      expect(scopes.keyword.control.conditional('js')).toBe('keyword.control.conditional.js');
      expect(scopes.comment.block.documentation('python')).toBe('comment.block.documentation.python');
      expect(scopes.string.quoted.double('typescript')).toBe('string.quoted.double.typescript');
    });

    test('should work in template literals', () => {
      const rule = `${scopes.keyword.control.conditional}.myLang`;
      expect(rule).toBe('keyword.control.conditional.myLang');
    });
  });

  describe('scopesFor integration', () => {
    test('should create language-specific scope objects', () => {
      const jsScopes = scopesFor('js');
      const pythonScopes = scopesFor('python');

      expect(jsScopes.keyword.control.conditional.toString()).toBe('keyword.control.conditional.js');
      expect(pythonScopes.keyword.control.conditional.toString()).toBe('keyword.control.conditional.python');
    });

    test('should allow additional suffixes on language scopes', () => {
      const jsScopes = scopesFor('js');
      
      expect(jsScopes.keyword.control.conditional('async')).toBe('keyword.control.conditional.js.async');
      expect(jsScopes.comment.line.double_slash('doc')).toBe('comment.line.double-slash.js.doc');
    });

    test('should work with all scope categories', () => {
      const tsScopes = scopesFor('typescript');

      expect(tsScopes.comment.line.double_slash.toString()).toBe('comment.line.double-slash.typescript');
      expect(tsScopes.constant.numeric.float.toString()).toBe('constant.numeric.float.typescript');
      expect(tsScopes.entity.name.function.toString()).toBe('entity.name.function.typescript');
      expect(tsScopes.invalid.illegal.toString()).toBe('invalid.illegal.typescript');
      expect(tsScopes.markup.heading.toString()).toBe('markup.heading.typescript');
      expect(tsScopes.meta.function.toString()).toBe('meta.function.typescript');
      expect(tsScopes.punctuation.separator.comma.toString()).toBe('punctuation.separator.comma.typescript');
      expect(tsScopes.storage.type.function.toString()).toBe('storage.type.function.typescript');
      expect(tsScopes.string.quoted.double.toString()).toBe('string.quoted.double.typescript');
      expect(tsScopes.support.function.builtin.toString()).toBe('support.function.builtin.typescript');
      expect(tsScopes.variable.other.readwrite.toString()).toBe('variable.other.readwrite.typescript');
    });
  });

  describe('snake_case to kebab-case conversion', () => {
    test('should convert underscores to dashes consistently', () => {
      expect(scopes.comment.line.double_slash.toString()).toBe('comment.line.double-slash');
      expect(scopes.entity.name.class.forward_decl.toString()).toBe('entity.name.class.forward-decl');
      expect(scopes.constant.numeric.integer.hexadecimal.toString()).toBe('constant.numeric.integer.hexadecimal');
      
      // Test with language suffixes
      expect(scopes.comment.line.double_slash('js')).toBe('comment.line.double-slash.js');
      expect(scopes.entity.name.class.forward_decl('cpp')).toBe('entity.name.class.forward-decl.cpp');
    });

    test('should work with language-specific scopes', () => {
      const jsScopes = scopesFor('js');
      
      expect(jsScopes.comment.line.double_slash.toString()).toBe('comment.line.double-slash.js');
      expect(jsScopes.entity.name.class.forward_decl.toString()).toBe('entity.name.class.forward-decl.js');
    });
  });
}); 