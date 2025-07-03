/**
 * Static Scopes for RCL Language
 * 
 * This file defines all TextMate scopes used in the RCL syntax highlighting.
 * Using static scopes provides better performance and smaller bundle size.
 * 
 * Based on TextMate naming conventions and optimized for performance.
 */

import { scopesFor } from 'tmgrammar-toolkit';

// Define the custom shape of RCL scopes
const rclScopeShapes = {
  meta: {
    section_agent: null,
    section_agentConfig: null,
    section_agentDefaults: null,
    section_flow: null,
    section_flows: null,
    section_messages: null,
    message_definition: null,
    message_shortcut: null,
    flow_transition: null,
    flow_rule: null,
    when_clause: null,
    with_clause: null,
    interpolation_single: null,
    interpolation_multi: null,
    import_statement: null,
    type_tag: null,
  },
  entity: {
    name: {
      message: null,
      section: null,
      identifier: null,
      alias: null,
      module: null,
      flow_rule: null,
      flow_target: null,
      type_tag: null,
    },
    other: {
      attribute_name: null,
    },
  },
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
  constant: {
    numeric: {
      duration: null,
    },
  },
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
};


// Create static scopes with RCL suffix and no extension allowed
export const scopes = scopesFor({ 
  suffix: 'rcl', 
  allowScopeExtension: false 
}, rclScopeShapes);

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
    other: scopes.keyword.other,
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
    flowRuleName: scopes.entity.name.flow_rule,
    flowTarget: scopes.entity.name.flow_target,
    typeTagName: scopes.entity.name.type_tag,
    alias: scopes.entity.name.alias,
    module: scopes.entity.name.module,
  },
  
  // Meta scopes for structure
  meta: {
    section: scopes.meta.section, // Base section
    messageDefinition: scopes.meta.message_definition,
    messageShortcut: scopes.meta.message_shortcut,
    flowTransition: scopes.meta.flow_transition,
    flowRule: scopes.meta.flow_rule,
    whenClause: scopes.meta.when_clause,
    withClause: scopes.meta.with_clause,
    interpolation: scopes.meta.interpolation_single, // Base interpolation
    importStatement: scopes.meta.import_statement,
    typeTag: scopes.meta.type_tag,
    path: scopes.meta.path,
    group: scopes.meta.group,
  },
  
  // Punctuation
  punctuation: {
    colon: scopes.punctuation.separator.colon,
    slash: scopes.punctuation.separator.slash,
    accessor: scopes.punctuation.accessor,
    interpolationBegin: scopes.punctuation.section.interpolation.begin,
    interpolationEnd: scopes.punctuation.section.interpolation.end,
  },
};

// Type definitions for better TypeScript support
export type RclScopes = typeof scopes;
export type RclScopeGroups = typeof scopeGroups;