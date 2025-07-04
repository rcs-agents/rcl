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
    duration: scopes.constant.numeric_duration,
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
    section_agentConfig: scopes.meta.section_agentConfig,
    section_agentDefaults: scopes.meta.section_agentDefaults,
    messageDefinition: scopes.meta.message_definition,
    messageShortcut: scopes.meta.message_shortcut,
    flowTransition: scopes.meta.flow_transition,
    flowRule: scopes.meta.flow_rule,
    whenClause: scopes.meta.when_clause,
    withClause: scopes.meta.with_clause,
    interpolation: scopes.meta.interpolation,
    importStatement: scopes.meta.import_statement,
    typeTag: scopes.meta.type_tag,
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