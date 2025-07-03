/**
 * Static Scopes for RCL Language
 * 
 * This file defines all TextMate scopes used in the RCL syntax highlighting.
 * Using static scopes provides better performance and smaller bundle size.
 * 
 * Based on TextMate naming conventions and optimized for performance.
 */

import { scopesFor } from 'tmgrammar-toolkit';

// Create static scopes with RCL suffix and no extension allowed
export const scopes = scopesFor({ 
  suffix: 'rcl', 
  allowScopeExtension: false 
}, {
  // Custom meta scopes for RCL language structures
  meta: {
    section: {
      agent: null,
      agentConfig: null,
      agentDefaults: null,
      flow: null,
      flows: null,
      messages: null,
    },
    message: {
      definition: null,
      shortcut: null,
    },
    flow: {
      transition: null,
      rule: null,
    },
    when: {
      clause: null,
    },
    with: {
      clause: null,
    },
    interpolation: {
      single: null,
      multi: null,
    },
    import: {
      statement: null,
    },
    type: {
      tag: null,
    },
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
      section: null,
      message: null,
      action: null,
      flow: null,
      comparison: null,
    },
    operator: {
      arrow: null,
    },
  },
  
  // Custom constant scopes for RCL literals
  constant: {
    numeric: {
      duration: null,
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

// Export commonly used scope groups for convenience
export const scopeGroups = {
  // Keywords by category
  keywords: {
    import: scopes.keyword.control.import,
    section: scopes.keyword.control.section,
    message: scopes.keyword.control.message,
    action: scopes.keyword.control.action,
    flow: scopes.keyword.control.flow,
    conditional: scopes.keyword.control.conditional,
    logical: scopes.keyword.operator.logical,
    comparison: scopes.keyword.operator.comparison,
    arrow: scopes.keyword.operator.arrow,
  },
  
  // Storage and types
  storage: {
    type: scopes.storage.type,
    modifier: scopes.storage.modifier,
  },
  
  // Literals and constants
  literals: {
    string: {
      quoted: scopes.string.quoted.double,
      unquoted: scopes.string.unquoted,
    },
    number: scopes.constant.numeric,
    duration: scopes.constant.numeric.duration,
    boolean: scopes.constant.language,
    null: scopes.constant.language,
    atom: scopes.constant.other,
  },
  
  // Comments
  comments: {
    line: scopes.comment.line.number_sign,
  },
  
  // Identifiers and names
  identifiers: {
    spaceSepar: scopes.entity.name.identifier,
    attributeKey: scopes.entity.other.attribute_name,
    sectionName: scopes.entity.name.section,
    messageName: scopes.entity.name.message,
    flowRuleName: scopes.entity.name.section, // Use section scope for flow rules
    flowTarget: scopes.entity.name.section, // Use section scope for flow targets
    typeTagName: scopes.entity.name.type.tag,
    alias: scopes.entity.name.alias,
    module: scopes.entity.name.module,
  },
  
  // Meta scopes for structure
  meta: {
    section: scopes.meta.section, // Base section
    messageDefinition: scopes.meta.message,
    messageShortcut: scopes.meta.message,
    flowTransition: scopes.meta.flow,
    flowRule: scopes.meta.flow,
    whenClause: scopes.meta.when,
    withClause: scopes.meta.with,
    interpolation: scopes.meta.interpolation,
    importStatement: scopes.meta.import,
    typeTag: scopes.meta.type,

  },
  
  // Punctuation
  punctuation: {
    colon: scopes.punctuation.separator.colon,
    slash: scopes.punctuation.separator.slash,

    interpolationBegin: scopes.punctuation.section.interpolation.begin,
    interpolationEnd: scopes.punctuation.section.interpolation.end,
  },
};

// Type definitions for better TypeScript support
export type RclScopes = typeof scopes;
export type RclScopeGroups = typeof scopeGroups;