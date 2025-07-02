import { describe, test, expect } from 'vitest';
import { expectTypeOf } from 'expect-type';
import { scopes, scopesFor } from '../src/scopes/index.js';
import { buildScopes, createScopeNode } from '../src/scopes/lib/internal.js';

describe('Scope System', () => {
  describe('createScopeNode', () => {
    test('creates callable scope nodes when allowScopeExtension is true', () => {
      const scope = createScopeNode('conditional', null, { 
        prefix: 'keyword.control', 
        allowScopeExtension: true 
      });
      
      expect(scope.toString()).toBe('keyword.control.conditional');
      expect(scope('js')).toBe('keyword.control.conditional.js');
      expect(`${scope}`).toBe('keyword.control.conditional');
    });

    test('creates non-callable scope nodes when allowScopeExtension is false', () => {
      const scope = createScopeNode('conditional', null, { 
        prefix: 'keyword.control', 
        allowScopeExtension: false 
      });
      
      expect(scope.toString()).toBe('keyword.control.conditional');
      expect(`${scope}`).toBe('keyword.control.conditional');
      expect(typeof scope).toBe('object'); // Not a function
    });

    test('converts snake_case to kebab-case', () => {
      const scope = createScopeNode('double_slash', null, { 
        prefix: 'comment.line',
        allowScopeExtension: true 
      });
      
      expect(scope.toString()).toBe('comment.line.double-slash');
      expect(scope('ts')).toBe('comment.line.double-slash.ts');
    });

    test('handles suffix properly', () => {
      const scope = createScopeNode('conditional', null, { 
        prefix: 'keyword.control', 
        suffix: 'js',
        allowScopeExtension: true 
      });
      
      expect(scope.toString()).toBe('keyword.control.conditional.js');
      expect(scope('async')).toBe('keyword.control.conditional.js.async');
    });

    test('handles on-leafs extension mode', () => {
      // Leaf node should be callable
      const leafScope = createScopeNode('token', null, { 
        prefix: 'custom',
        allowScopeExtension: 'on-leafs' 
      });
      
      expect(leafScope.toString()).toBe('custom.token');
      expect(leafScope('extra')).toBe('custom.token.extra');
      
      // Branch node should not be callable
      const branchScope = createScopeNode('parent', { child: {} }, { 
        prefix: 'custom',
        allowScopeExtension: 'on-leafs' 
      });
      
      expect(branchScope.toString()).toBe('custom.parent');
      expect(typeof branchScope).toBe('object'); // Not a function
    });
  });

  describe('buildScopes', () => {
    test('builds scope trees with callable nodes', () => {
      const commentScope = buildScopes({ 
        prefix: 'comment', 
        allowScopeExtension: true 
      }, {
        line: {
          double_slash: null,
          number_sign: null,
        },
        block: {
          documentation: null,
        },
      });

      expect(commentScope.line.toString()).toBe('comment.line');
      expect(commentScope.line.double_slash.toString()).toBe('comment.line.double-slash');
      expect(commentScope.line.double_slash('js')).toBe('comment.line.double-slash.js');
    });

    test('builds scope trees with non-callable nodes', () => {
      const commentScope = buildScopes({ 
        prefix: 'comment', 
        allowScopeExtension: false 
      }, {
        line: {
          double_slash: null,
        },
      });

      expect(commentScope.line.toString()).toBe('comment.line');
      expect(commentScope.line.double_slash.toString()).toBe('comment.line.double-slash');
      expect(typeof commentScope.line).toBe('object'); // Not a function
      expect(typeof commentScope.line.double_slash).toBe('object'); // Not a function
    });
  });

  describe('predefined scopes', () => {
    test('provides access to all standard TextMate scopes', () => {
      expect(scopes.keyword.control.conditional.toString()).toBe('keyword.control.conditional');
      expect(scopes.comment.line.double_slash.toString()).toBe('comment.line.double-slash');
      expect(scopes.string.quoted.single.toString()).toBe('string.quoted.single');
      expect(scopes.constant.numeric.integer.toString()).toBe('constant.numeric.integer');
    });

    test('allows language suffixes on all scopes', () => {
      expect(scopes.keyword.control.conditional('js')).toBe('keyword.control.conditional.js');
      expect(scopes.comment.block.documentation('python')).toBe('comment.block.documentation.python');
      expect(scopes.string.quoted.double('typescript')).toBe('string.quoted.double.typescript');
    });

    test('works in template literals', () => {
      const rule = `${scopes.keyword.control.conditional}.myLang`;
      expect(rule).toBe('keyword.control.conditional.myLang');
    });
  });

  describe('scopesFor function', () => {
    test('creates static scopes (recommended pattern)', () => {
      const rclScopes = scopesFor({ suffix: 'rcl', allowScopeExtension: false });
      
      expect(rclScopes.keyword.control.conditional.toString()).toBe('keyword.control.conditional.rcl');
      expect(rclScopes.comment.line.double_slash.toString()).toBe('comment.line.double-slash.rcl');
      
      // Should not be callable
      expect(typeof rclScopes.keyword.control.conditional).toBe('object');
      expect(typeof rclScopes.comment.line.double_slash).toBe('object');
    });

    test('creates callable scopes when enabled', () => {
      const jsScopes = scopesFor({ suffix: 'js', allowScopeExtension: true });
      
      expect(jsScopes.keyword.control.conditional.toString()).toBe('keyword.control.conditional.js');
      expect(jsScopes.keyword.control.conditional('async')).toBe('keyword.control.conditional.js.async');
    });

    test('creates scopes with on-leafs extension mode', () => {
      const leafScopes = scopesFor({ suffix: 'lang', allowScopeExtension: 'on-leafs' });
      
      // Leaf nodes should be callable
      expect(leafScopes.keyword.control.conditional('extra')).toBe('keyword.control.conditional.lang.extra');
      
      // Branch nodes should not be callable
      expect(typeof leafScopes.keyword.control).toBe('object');
    });

    test('merges custom scope definitions', () => {
      const customScopes = scopesFor({ suffix: 'rcl', allowScopeExtension: false }, {
        meta: {
          section: {
            agent: null,
            messages: null
          }
        }
      });
      
      // Custom scopes
      expect(customScopes.meta.section.agent.toString()).toBe('meta.section.agent.rcl');
      expect(customScopes.meta.section.messages.toString()).toBe('meta.section.messages.rcl');
      
      // Base scopes still work
      expect(customScopes.keyword.control.conditional.toString()).toBe('keyword.control.conditional.rcl');
    });

    test('handles prefix option', () => {
      const prefixedScopes = scopesFor({ 
        prefix: 'source.rcl', 
        suffix: 'embedded',
        allowScopeExtension: false 
      });
      
      expect(prefixedScopes.keyword.control.conditional.toString())
        .toBe('source.rcl.keyword.control.conditional.embedded');
    });
  });

  describe('Type Safety', () => {
    test('static scopes have correct literal types', () => {
      const staticScopes = scopesFor({ suffix: 'rcl', allowScopeExtension: false });
      
      expectTypeOf(staticScopes.keyword.control.conditional).toMatchTypeOf<string>();
      expectTypeOf(staticScopes.keyword.control.conditional.toString()).toEqualTypeOf<string>();
    });

    test('callable scopes have function types', () => {
      const callableScopes = scopesFor({ suffix: 'js', allowScopeExtension: true });
      
      expectTypeOf(callableScopes.keyword.control.conditional).toBeCallableWith(['async']);
      expectTypeOf(callableScopes.keyword.control.conditional('async')).toEqualTypeOf<string>();
    });

    test('custom scopes have correct types', () => {
      const customScopes = scopesFor({ suffix: 'rcl', allowScopeExtension: false }, {
        custom: { 
          token: null 
        }
      });
      
      expectTypeOf(customScopes.custom.token).toMatchTypeOf<string>();
      expectTypeOf(customScopes.keyword.control.conditional).toMatchTypeOf<string>();
    });

    test('on-leafs mode has correct callable/non-callable types', () => {
      const leafScopes = scopesFor({ allowScopeExtension: 'on-leafs' }, {
        custom: { token: null }
      });
      
      // Leaf should be callable
      expectTypeOf(leafScopes.custom.token).toBeCallableWith(['extra']);
      
      // Branch should not be callable (this test verifies the type system logic)
      expectTypeOf(leafScopes.custom).not.toBeCallableWith(['extra']);
    });
  });

  describe('Snake_case to Kebab-case Conversion', () => {
    test('converts underscores to dashes consistently', () => {
      expect(scopes.comment.line.double_slash.toString()).toBe('comment.line.double-slash');
      expect(scopes.entity.name.class.forward_decl.toString()).toBe('entity.name.class.forward-decl');
      
      // Test with language suffixes
      expect(scopes.comment.line.double_slash('js')).toBe('comment.line.double-slash.js');
      expect(scopes.entity.name.class.forward_decl('cpp')).toBe('entity.name.class.forward-decl.cpp');
    });

    test('works with language-specific scopes', () => {
      const jsScopes = scopesFor({ suffix: 'js', allowScopeExtension: true });
      
      expect(jsScopes.comment.line.double_slash.toString()).toBe('comment.line.double-slash.js');
      expect(jsScopes.entity.name.class.forward_decl.toString()).toBe('entity.name.class.forward-decl.js');
    });
  });
}); 