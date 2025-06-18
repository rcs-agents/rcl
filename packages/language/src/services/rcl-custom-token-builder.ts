import { IndentationAwareTokenBuilder, isTokenTypeArray, GrammarAST } from "langium";
import { IMultiModeLexerDefinition, TokenType, TokenVocabulary } from "chevrotain";

const DEFAULT_MODE = 'default_mode';
const BOOLEAN_CONTEXT_MODE = 'boolean_context_mode';
const TYPE_TAG_MODE = 'type_tag_mode';
const SECTION_NAME_MODE = 'section_name_mode';

/**
 * Custom token builder that combines indentation awareness with multi-mode lexing
 * for resolving RCL token conflicts while preserving indentation-based structure.
 */
export class RclCustomTokenBuilder extends IndentationAwareTokenBuilder {

  override buildTokens(grammar: GrammarAST.Grammar, options?: { caseInsensitive?: boolean }): TokenVocabulary {
    // First, get tokens from the parent IndentationAwareTokenBuilder
    const baseTokens = super.buildTokens(grammar, options);

    if (isTokenTypeArray(baseTokens)) {
      // Apply multi-mode lexing on top of indentation-aware tokens
      return this.applyMultiModeLexing(baseTokens);
    }

    return baseTokens;
  }

  private applyMultiModeLexing(tokens: TokenType[]): IMultiModeLexerDefinition {
    // Filter tokens for different modes while preserving indentation tokens
    const indentationTokens = tokens.filter(token =>
      ['INDENT', 'DEDENT', 'WS', 'NL'].includes(token.name)
    );

    // Regular mode: exclude boolean keywords from PROPER_WORD context
    const regularModeTokens = tokens.filter(token =>
      !['TRUE_KW', 'FALSE_KW'].includes(token.name) ||
      indentationTokens.includes(token)
    );

    // Boolean context mode: prioritize boolean keywords over PROPER_WORD
    const booleanModeTokens = tokens.filter(token =>
      token.name !== 'PROPER_WORD' ||
      indentationTokens.includes(token)
    );

    // Type tag mode: enable TYPE_TAG_NAME, disable COMMON_NOUN conflicts
    const typeTagModeTokens = tokens.filter(token =>
      !this.conflictsWithTypeTag(token) ||
      indentationTokens.includes(token)
    );

    // Section name mode: allow all PROPER_WORD including reserved keywords
    const sectionNameModeTokens = tokens.filter(token =>
      !['TRUE_KW', 'FALSE_KW', 'TYPE_TAG_NAME'].includes(token.name) ||
      indentationTokens.includes(token)
    );

    const multiModeLexerDef: IMultiModeLexerDefinition = {
      modes: {
        [DEFAULT_MODE]: regularModeTokens,
        [BOOLEAN_CONTEXT_MODE]: booleanModeTokens,
        [TYPE_TAG_MODE]: typeTagModeTokens,
        [SECTION_NAME_MODE]: sectionNameModeTokens
      },
      defaultMode: DEFAULT_MODE
    };

    return multiModeLexerDef;
  }

  protected override buildTerminalToken(terminal: GrammarAST.TerminalRule): TokenType {
    let tokenType = super.buildTerminalToken(terminal);

    // Add mode transitions for specific terminals
    if (tokenType.name === 'LT') { // '<' starts type conversion
      tokenType.PUSH_MODE = TYPE_TAG_MODE;
    } else if (tokenType.name === 'GT') { // '>' ends type conversion
      tokenType.POP_MODE = true;
    }

    return tokenType;
  }

  protected override buildKeywordToken(
    keyword: GrammarAST.Keyword,
    terminalTokens: TokenType[],
    caseInsensitive: boolean
  ): TokenType {
    let tokenType = super.buildKeywordToken(keyword, terminalTokens, caseInsensitive);

    const keywordsConflictingWithProperWord = ['Config', 'Defaults', 'Messages'];

    // Keywords listed in the test error output as having COMMON_NOUN as a problematic LONGER_ALT
    // in modes other than type_tag_mode.
    const generalKeywordsConflictingWithCommonNoun = [
      'authentication', 'servicerequest', 'agentDefaults', 'agentConfig', 'transaction',
      'acknowledge', 'promotion', 'message', 'messages', 'import', 'agent', 'list', 'flow', 'as', 'of'
      // Note: 'messages' (lowercase) added here.
      // 'Messages' (uppercase) is handled by keywordsConflictingWithProperWord.
      // Boolean keywords (True, False, etc.) are handled by specific modes.
      // Type Tag names (date, time, etc.) are handled by TYPE_TAG_MODE.
    ];

    if (keywordsConflictingWithProperWord.includes(tokenType.name)) {
      // For these keywords, PROPER_WORD is often the LONGER_ALT.
      // Deleting LONGER_ALT makes them distinct keywords.
      // This is particularly important if they are used in SECTION_NAME_MODE
      // where PROPER_WORD is also active.
      delete tokenType.LONGER_ALT;
    }

    if (generalKeywordsConflictingWithCommonNoun.includes(tokenType.name)) {
      // For these general keywords, COMMON_NOUN is their LONGER_ALT.
      // In modes where both the keyword and COMMON_NOUN are active (e.g., DEFAULT_MODE),
      // this LONGER_ALT relationship causes issues with the multi-mode lexer.
      // Deleting LONGER_ALT ensures the keyword is prioritized and tokenized as itself.
      delete tokenType.LONGER_ALT;
    }

    return tokenType;
  }

  private conflictsWithTypeTag(token: TokenType): boolean {
    const conflictingTokens = ['COMMON_NOUN'];
    return conflictingTokens.includes(token.name);
  }
}