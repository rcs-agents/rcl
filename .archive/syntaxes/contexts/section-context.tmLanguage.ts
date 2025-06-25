/**
 * Section Context TextMate Grammar
 */

import { scopesFor, type BeginEndRule, type Rule } from 'tmgrammar-toolkit';

const scopes = scopesFor('rcl');

const sectionLevelComments: Rule = {
  key: 'section-level-comments',
  patterns: [
    {
      key: 'comment-line',
      scope: scopes.comment.line.number_sign,
      begin: /^\s+(#)/,
      beginCaptures: { '1': { scope: scopes.punctuation.definition.comment } },
      end: /$/,
      patterns: [
        {
          scope: scopes.comment.line.content,
          match: /.*/,
        },
      ],
    },
  ],
};

const subsectionDeclarations: Rule = {
  key: 'subsection-declarations',
  patterns: [
    {
      key: 'config-subsection',
      scope: scopes.meta.subsection.config,
      begin: /^\s*(Config)(?:\s+(#.*)?)?$/,
      beginCaptures: { '1': { scope: scopes.keyword.control.section.reserved } },
      end: /(?=^\s+(Messages|flow|Defaults))|^(?=\S)|(?=^\s*$)/,
      patterns: [
        { include: '#property-level-patterns' },
      ],
    },
    {
      key: 'defaults-subsection',
      scope: scopes.meta.subsection.defaults,
      begin: /^\s*(Defaults)(?:\s+(#.*)?)?$/,
      beginCaptures: { '1': { scope: scopes.keyword.control.section.reserved } },
      end: /(?=^\s+(Messages|flow|Config))|^(?=\S)|(?=^\s*$)/,
      patterns: [
        { include: '#property-level-patterns' },
      ],
    },
    {
      key: 'messages-subsection',
      scope: scopes.meta.subsection.messages,
      begin: /^\s*(Messages)(?:\s+(#.*)?)?$/,
      beginCaptures: { '1': { scope: scopes.keyword.control.section.reserved } },
      end: /(?=^\s+(Config|flow|Defaults))|^(?=\S)|(?=^\s*$)/,
      patterns: [
        { include: '#property-level-patterns' },
      ],
    },
    {
      key: 'flow-subsection',
      scope: scopes.meta.subsection.flow,
      begin: /^\s*(flow)\s+([A-Za-z][A-Za-z0-9\s]*[A-Za-z0-9]|[A-Za-z])(?:\s+(#.*)?)?$/,
      beginCaptures: {
        '1': { scope: scopes.keyword.control.section },
        '2': { scope: scopes.entity.name.section.flow },
      },
      end: /(?=^\s+(Messages|Config|Defaults))|^(?=\S)|(?=^\s*$)/,
      patterns: [
        { include: '#flow-level-patterns' },
      ],
    },
    {
      key: 'typed-message-subsection',
      scope: scopes.meta.subsection.typed_message,
      begin: /^\s*(authentication message|transaction message|promotion message|servicerequest message|acknowledge message)\s+([A-Z][A-Za-z0-9\s]*[A-Za-z0-9])(?:\s+(#.*)?)?$/,
      beginCaptures: {
        '1': { scope: scopes.keyword.control.section.message.typed },
        '2': { scope: scopes.entity.name.section.message },
      },
      end: /(?=^\s+(Messages|flow|Config|Defaults|message|authentication message|transaction message|promotion message|servicerequest message|acknowledge message))|^(?=\S)|(?=^\s*$)/,
      patterns: [
        { include: '#property-level-patterns' },
      ],
    },
    {
      key: 'message-subsection',
      scope: scopes.meta.subsection.message,
      begin: /^\s*(message)\s+([A-Z][A-Za-z0-9\s]*[A-Za-z0-9])(?:\s+(#.*)?)?$/,
      beginCaptures: {
        '1': { scope: scopes.keyword.control.section },
        '2': { scope: scopes.entity.name.section.message },
      },
      end: /(?=^\s+(Messages|flow|Config|Defaults|message|authentication message|transaction message|promotion message|servicerequest message|acknowledge message))|^(?=\S)|(?=^\s*$)/,
      patterns: [
        { include: '#property-level-patterns' },
      ],
    },
  ],
};

const sectionProperties: Rule = {
  key: 'section-properties',
  patterns: [
    { include: '#property-level-patterns' },
  ],
};

export const sectionLevelPatterns: Rule = {
  key: 'section-level-patterns',
  patterns: [
    sectionLevelComments,
    subsectionDeclarations,
    sectionProperties,
  ],
};
