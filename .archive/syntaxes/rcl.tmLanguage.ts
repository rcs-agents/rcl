/**
 * RCL TextMate Grammar
 */

import {
  createGrammar,
  Grammar,
  Rule,
  scopesFor,
  BeginEndRule,
  MatchRule,
} from 'tmgrammar-toolkit';
import { fileContext } from './contexts/file-context.tmLanguage';
import { flowContext } from './contexts/flow-context.tmLanguage';
import { propertyContext } from './contexts/property-context.tmLanguage';
import { sectionContext } from './contexts/section-context.tmLanguage';

const scopes = scopesFor('rcl');

const comments: BeginEndRule = {
  key: 'comments',
  scope: scopes.comment.line,
  begin: /\s*(#)/,
  beginCaptures: { '1': { scope: scopes.punctuation.definition.comment } },
  end: /$/,
  patterns: [
    {
      key: 'comment-content',
      scope: scopes.comment.line.content,
      match: /.*/,
    },
  ],
};

const strings: BeginEndRule = {
  key: 'strings',
  scope: scopes.string.quoted.double,
  begin: /"/,
  beginCaptures: { '0': { scope: scopes.punctuation.definition.string.begin } },
  end: /"/,
  endCaptures: { '0': { scope: scopes.punctuation.definition.string.end } },
  patterns: [
    {
      key: 'string-escape',
      scope: scopes.constant.character.escape,
      match: /\\./,
    },
  ],
};

const atoms: MatchRule = {
  key: 'atoms',
  scope: scopes.constant.other.atom,
  match: /:[a-zA-Z_][\w_]*\b/,
};

const numbers: Rule[] = [
  {
    key: 'hex',
    scope: scopes.constant.numeric.integer.hex,
    match: /\b0x[0-9a-fA-F]+\b/,
  },
  {
    key: 'binary',
    scope: scopes.constant.numeric.integer.binary,
    match: /\b0b[01]+\b/,
  },
  {
    key: 'decimal',
    scope: scopes.constant.numeric.float,
    match: /\b\d+\.\d+\b/,
  },
  {
    key: 'integer',
    scope: scopes.constant.numeric.integer,
    match: /\b\d+\b/,
  },
];

const booleans: MatchRule = {
  key: 'booleans',
  scope: scopes.constant.language.boolean,
  match: /\b(True|On|Yes|Active|Enabled|False|Off|No|Inactive|Disabled)\b/,
};

const nulls: MatchRule = {
  key: 'nulls',
  scope: scopes.constant.language.null,
  match: /\b(Null)\b/,
};

const primitives: Rule = {
  key: 'primitives',
  patterns: [comments, strings, atoms, ...numbers, booleans, nulls],
};

const importStatements: BeginEndRule = {
  key: 'importStatements',
  scope: scopes.meta.import_statement,
  begin: /\s*(import)\s+([A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\s+[A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*(?:\s*\/\s*[A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\s+[A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*)*)/,
  beginCaptures: {
    '1': { scope: scopes.keyword.control.import },
    '2': { scope: scopes.entity.name.namespace.source },
  },
  end: /(?=#)|$/,
  patterns: [
    {
      key: 'import-possessive',
      begin: /\s+('s)\s+([a-z][a-zA-Z0-9_]*(?:\s*\.\s*[a-z][a-zA-Z0-9_]*)*)/,
      beginCaptures: {
        '1': { scope: scopes.keyword.operator.possessive },
        '2': { scope: scopes.variable.other.attribute_path },
      },
      end: /(?=\s+as\b)|(?=#)|$/,
      patterns: [],
    },
    {
      key: 'import-alias',
      begin: /\s+(as)\s+([A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\s+[A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*)/,
      beginCaptures: {
        '1': { scope: scopes.keyword.control.as },
        '2': { scope: scopes.variable.other.alias },
      },
      end: /(?=#)|$/,
      patterns: [],
    },
  ],
};

const variableReferences: Rule = {
  key: 'variableReferences',
  scope: scopes.variable.other.reference,
  patterns: [
    {
      key: 'qualified-reference',
      scope: scopes.variable.other.reference.qualified,
      match: /\$([A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\s+[A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*)\.([a-z][a-zA-Z0-9_]*)/,
      captures: {
        '1': { scope: scopes.entity.name.reference },
        '2': { scope: scopes.variable.other.property },
      },
    },
    {
      key: 'simple-reference',
      scope: scopes.variable.other.reference.simple,
      match: /\$([A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\s+[A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*)/,
      captures: {
        '1': { scope: scopes.entity.name.reference },
      },
    },
  ],
};

const references: Rule = {
  key: 'references',
  patterns: [importStatements, variableReferences],
};

const inlineJsExpression: BeginEndRule = {
  key: 'inlineJsExpression',
  scope: scopes.meta.embedded.inline.js,
  begin: /(\$js>)\s*/,
  beginCaptures: { '1': { scope: scopes.keyword.control.embedded.marker.js } },
  end: /\$/,
  contentName: 'source.js',
  patterns: [{ include: 'source.js' }],
};

const inlineTsExpression: BeginEndRule = {
  key: 'inlineTsExpression',
  scope: scopes.meta.embedded.inline.ts,
  begin: /(\$ts>)\s*/,
  beginCaptures: { '1': { scope: scopes.keyword.control.embedded.marker.ts } },
  end: /\$/,
  contentName: 'source.ts',
  patterns: [{ include: 'source.ts' }],
};

const inlineGenericExpression: BeginEndRule = {
  key: 'inlineGenericExpression',
  scope: scopes.meta.embedded.inline.js,
  begin: /(\$>)\s*/,
  beginCaptures: { '1': { scope: scopes.keyword.control.embedded.marker.js } },
  end: /\$/,
  contentName: 'source.js',
  patterns: [{ include: 'source.js' }],
};

const blockJsExpression: BeginEndRule = {
  key: 'blockJsExpression',
  scope: scopes.meta.embedded.block.js,
  begin: /^(\s*)(\$js>>>)\s*$/,
  beginCaptures: { '2': { scope: scopes.keyword.control.embedded.marker.js } },
  end: /^(?!\1[ \t])(?=\S)|^(?=.{0,%\1width%}(?! \S))(?<!\1)/,
  contentName: 'source.js',
  patterns: [
    {
      key: 'js-block-content',
      begin: /^(\s*)\S/,
      end: /$/,
      patterns: [{ include: 'source.js' }],
    },
  ],
};

const blockTsExpression: BeginEndRule = {
  key: 'blockTsExpression',
  scope: scopes.meta.embedded.block.ts,
  begin: /^(\s*)(\$ts>>>)\s*$/,
  beginCaptures: { '2': { scope: scopes.keyword.control.embedded.marker.ts } },
  end: /^(?!\1[ \t])(?=\S)|^(?=.{0,%\1width%}(?! \S))(?<!\1)/,
  contentName: 'source.ts',
  patterns: [
    {
      key: 'ts-block-content',
      begin: /^(\s*)\S/,
      end: /$/,
      patterns: [{ include: 'source.ts' }],
    },
  ],
};

const blockGenericExpression: BeginEndRule = {
  key: 'blockGenericExpression',
  scope: scopes.meta.embedded.block.js,
  begin: /^(\s*)(\$>>>)\s*$/,
  beginCaptures: { '2': { scope: scopes.keyword.control.embedded.marker.js } },
  end: /^(?!\1[ \t])(?=\S)|^(?=.{0,%\1width%}(?! \S))(?<!\1)/,
  contentName: 'source.js',
  patterns: [
    {
      key: 'generic-block-content',
      begin: /^(\s*)\S/,
      end: /$/,
      patterns: [{ include: 'source.js' }],
    },
  ],
};

const expressions: Rule = {
  key: 'expressions',
  patterns: [
    inlineJsExpression,
    inlineTsExpression,
    inlineGenericExpression,
    blockJsExpression,
    blockTsExpression,
    blockGenericExpression,
  ],
};

const sections: Rule[] = [
  {
    key: 'agentSection',
    scope: scopes.meta.section.agent,
    begin: /(^\s*)(agent)\s+([A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\s+[A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*)s*$/,
    beginCaptures: {
      '2': { scope: scopes.keyword.control.section.agent },
      '3': { scope: scopes.entity.name.section.agent },
    },
    end: /^(?=\S)(?!#)/,
    patterns: [{ include: '#sectionContext' }],
  },
  {
    key: 'configSection',
    scope: scopes.meta.section.config,
    begin: /(?:^\s*)(Config)\s*(?:#.*)?$/,
    beginCaptures: { '1': { scope: scopes.keyword.control.section.config } },
    end: /^(?=\S)(?!#)/,
    patterns: [{ include: '#sectionContext' }],
  },
  {
    key: 'defaultsSection',
    scope: scopes.meta.section.defaults,
    begin: /(?:^\s*)(Defaults)\s*(?:#.*)?$/,
    beginCaptures: { '1': { scope: scopes.keyword.control.section.defaults } },
    end: /^(?=\S)(?!#)/,
    patterns: [{ include: '#sectionContext' }],
  },
  {
    key: 'messagesSection',
    scope: scopes.meta.section.messages,
    begin: /(?:^\s*)(Messages)\s*(?:#.*)?$/,
    beginCaptures: { '1': { scope: scopes.keyword.control.section.messages } },
    end: /^(?=\S)(?!#)/,
    patterns: [{ include: '#sectionContext' }],
  },
  {
    key: 'flowSection',
    scope: scopes.meta.section.flow,
    begin: /(?:^\s*)(flow)\s+([A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\s+[A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*)(?:\s*#.*)?$/,
    beginCaptures: {
      '1': { scope: scopes.keyword.control.section.flow },
      '2': { scope: scopes.entity.name.section.flow },
    },
    end: /^(?=\S)(?!#)/,
    patterns: [{ include: '#flowContext' }],
  },
  {
    key: 'agentConfigSection',
    scope: scopes.meta.section.agent_config,
    begin: /(?:^\s*)(agentConfig)\s+([A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\s+[A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*)(?:\s*#.*)?$/,
    beginCaptures: {
      '1': { scope: scopes.keyword.control.section.agent_config },
      '2': { scope: scopes.entity.name.section.agent_config },
    },
    end: /^(?=\S)(?!#)/,
    patterns: [{ include: '#sectionContext' }],
  },
  {
    key: 'authenticationMessageSection',
    scope: scopes.meta.section.message.authentication,
    begin: /(?:^\s*)(authentication message)\s+([A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\s+[A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*)(?:\s+([^#\n]*))?\s*(?:#.*)?$/,
    beginCaptures: {
      '1': {
        scope: scopes.keyword.control.section.message.typed.authentication,
      },
      '2': { scope: scopes.entity.name.section.message.authentication },
      '3': { scope: scopes.variable.parameter.section.message.authentication },
    },
    end: /^(?=\S)(?!#)/,
    patterns: [{ include: '#sectionContext' }],
  },
  {
    key: 'transactionMessageSection',
    scope: scopes.meta.section.message.transaction,
    begin: /(?:^\s*)(transaction message)\s+([A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\s+[A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*)(?:\s+([^#\n]*))?\s*(?:#.*)?$/,
    beginCaptures: {
      '1': {
        scope: scopes.keyword.control.section.message.typed.transaction,
      },
      '2': { scope: scopes.entity.name.section.message.transaction },
      '3': { scope: scopes.variable.parameter.section.message.transaction },
    },
    end: /^(?=\S)(?!#)/,
    patterns: [{ include: '#sectionContext' }],
  },
  {
    key: 'promotionMessageSection',
    scope: scopes.meta.section.message.promotion,
    begin: /(?:^\s*)(promotion message)\s+([A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\s+[A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*)(?:\s+([^#\n]*))?\s*(?:#.*)?$/,
    beginCaptures: {
      '1': { scope: scopes.keyword.control.section.message.typed.promotion },
      '2': { scope: scopes.entity.name.section.message.promotion },
      '3': { scope: scopes.variable.parameter.section.message.promotion },
    },
    end: /^(?=\S)(?!#)/,
    patterns: [{ include: '#sectionContext' }],
  },
  {
    key: 'servicerequestMessageSection',
    scope: scopes.meta.section.message.service_request,
    begin: /(?:^\s*)(servicerequest message)\s+([A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\s+[A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*)(?:\s+([^#\n]*))?\s*(?:#.*)?$/,
    beginCaptures: {
      '1': {
        scope: scopes.keyword.control.section.message.typed.service_request,
      },
      '2': { scope: scopes.entity.name.section.message.service_request },
      '3': { scope: scopes.variable.parameter.section.message.service_request },
    },
    end: /^(?=\S)(?!#)/,
    patterns: [{ include: '#sectionContext' }],
  },
  {
    key: 'acknowledgeMessageSection',
    scope: scopes.meta.section.message.acknowledge,
    begin: /(?:^\s*)(acknowledge message)\s+([A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\s+[A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*)(?:\s+([^#\n]*))?\s*(?:#.*)?$/,
    beginCaptures: {
      '1': {
        scope: scopes.keyword.control.section.message.typed.acknowledge,
      },
      '2': { scope: scopes.entity.name.section.message.acknowledge },
      '3': { scope: scopes.variable.parameter.section.message.acknowledge },
    },
    end: /^(?=\S)(?!#)/,
    patterns: [{ include: '#sectionContext' }],
  },
  {
    key: 'otpMessageSection',
    scope: scopes.meta.section.message.otp,
    begin: /(?:^\s*)(otp message)\s+([A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\s+[A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*)(?:\s+([^#\n]*))?\s*(?:#.*)?$/,
    beginCaptures: {
      '1': { scope: scopes.keyword.control.section.message.typed.otp },
      '2': { scope: scopes.entity.name.section.message.otp },
      '3': { scope: scopes.variable.parameter.section.message.otp },
    },
    end: /^(?=\S)(?!#)/,
    patterns: [{ include: '#sectionContext' }],
  },
  {
    key: 'messageSection',
    scope: scopes.meta.section.message.untyped,
    begin: /(?:^\s*)(message)\s+([A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\s+[A-Z](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*)(?:\s+([^#\n]*))?\s*(?:#.*)?$/,
    beginCaptures: {
      '1': { scope: scopes.keyword.control.section.message.untyped },
      '2': { scope: scopes.entity.name.section.message.untyped },
      '3': { scope: scopes.variable.parameter.section.message.untyped },
    },
    end: /^(?=\S)(?!#)/,
    patterns: [{ include: '#sectionContext' }],
  },
];

export const grammar: Grammar = createGrammar({
  name: 'rcl',
  scopeName: 'source.rcl',
  fileTypes: ['rcl'],
  patterns: [
    { include: '#fileContext' },
    { include: '#comments' },
    { include: '#references' },
    { include: '#sections' },
    { include: '#primitives' },
    { include: '#expressions' },
  ],
  repository: {
    comments,
    primitives,
    references,
    expressions,
    sections: {
      key: 'sections',
      patterns: sections,
    },
    fileContext,
    flowContext,
    propertyContext,
    sectionContext,
  },
});