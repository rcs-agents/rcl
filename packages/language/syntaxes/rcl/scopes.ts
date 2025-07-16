/**
 * Static Scopes for RCL Language
 * 
 * This file defines all TextMate scopes used in the RCL syntax highlighting.
 * Using static scopes provides better performance and smaller bundle size.
 * 
 * Based on TextMate naming conventions and optimized for performance.
 */

import { scopesFor } from 'tmgrammar-toolkit';

const simpleTest = scopesFor({
  suffix: 'rcl',
  allowScopeExtension: false
}, {
  meta: {
    section: null,
  }
});

simpleTest.meta.class;

// Create static scopes with RCL suffix and no extension allowed
export const scopes = scopesFor({ 
  suffix: 'rcl', 
  allowScopeExtension: false 
}, {
  // Custom meta scopes for RCL language structures
  meta: {
    section: null,
    section_agent: null,
    section_agentConfig: null,
    section_agentDefaults: null,
    section_flow: null,
    section_flows: null,
    section_messages: null,
    message: null,
    message_definition: null,
    message_shortcut: null,
    flow: null,
    flow_transition: null,
    flow_rule: null,
    when: null,
    when_clause: null,
    with: null,
    with_clause: null,
    interpolation: null,
    interpolation_single: null,
    interpolation_multi: null,
    import: null,
    import_statement: null,
    type: null,
    type_tag: null,
  },
  
  // Custom entity scopes for RCL identifiers and names
  entity: {
    name: {
      message: null,
      section: null,
      identifier: null,
      alias: null,
      module: null,
      flow: {
        rule: null,
        target: null,
      },
      type: {
        tag: null,
      },
    },
    other: {
      attribute_name: null,
    },
  },
  
  // Custom keyword scopes for RCL-specific concepts
  keyword: {
    control: {
      import: null,
      section: null,
      message: null,
      action: null,
      flow: null,
      conditional: null,
      comparison: null,
    },
    operator: {
      logical: null,
      comparison: null,
      arrow: null,
    },
  },
  
  // Custom constant scopes for RCL literals
  constant: {
    language: null,
    numeric: null,
    numeric_duration: null,
    other: null,
  },
  
  // Storage scopes
  storage: {
    type: null,
    modifier: null,
  },
  
  // String scopes
  string: {
    quoted: {
      double: null,
    },
    unquoted: null,
  },
  
  // Comment scopes
  comment: {
    line: {
      number_sign: null,
    },
  },
  
  // Custom punctuation scopes
  punctuation: {
    separator: {
      colon: null,
      slash: null,
    },
    section: {
      interpolation: {
        begin: null,
        end: null,
      },
    },
  },
});

// Type definitions for better TypeScript support
export type RclScopes = typeof scopes;