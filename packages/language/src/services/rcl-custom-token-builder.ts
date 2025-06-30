import { IndentationAwareTokenBuilder, isTokenTypeArray, type GrammarAST } from "langium";
import type { IMultiModeLexerDefinition, TokenType, TokenVocabulary } from "chevrotain";
import { TK } from "../constants.js";

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
      [TK.INDENT, TK.DEDENT, TK.WS, TK.NL].includes(token.name as TK)
    );

    // Regular mode: exclude boolean keywords from PROPER_WORD context
    const regularModeTokens = tokens.filter(token =>
      ![TK.TRUE_KW, TK.FALSE_KW].includes(token.name as TK) ||
      indentationTokens.includes(token)
    );

    // Boolean context mode: prioritize boolean keywords over PROPER_WORD
    const booleanModeTokens = tokens.filter(token =>
      token.name !== TK.PROPER_WORD ||
      indentationTokens.includes(token)
    );

    // Type tag mode: enable TYPE_TAG_NAME, disable COMMON_NOUN conflicts
    const typeTagModeTokens = tokens.filter(token =>
      !this.conflictsWithTypeTag(token) ||
      indentationTokens.includes(token)
    );

    // Section name mode: allow all PROPER_WORD including reserved keywords
    const sectionNameModeTokens = tokens.filter(token =>
      ![TK.TRUE_KW, TK.FALSE_KW, TK.TYPE_TAG_NAME].includes(token.name as TK) ||
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
    const tokenType = super.buildTerminalToken(terminal);

    // Clear LONGER_ALT relationships for all terminals to prevent multi-mode lexer conflicts
    tokenType.LONGER_ALT = undefined;

    // Add mode transitions for specific terminals
    if (tokenType.name === TK.LT) { // '<' starts type conversion
      tokenType.PUSH_MODE = TYPE_TAG_MODE;
    } else if (tokenType.name === TK.GT) { // '>' ends type conversion
      tokenType.POP_MODE = true;
    }

    return tokenType;
  }

  protected override buildKeywordToken(
    keyword: GrammarAST.Keyword,
    terminalTokens: TokenType[],
    caseInsensitive: boolean
  ): TokenType {
    const tokenType = super.buildKeywordToken(keyword, terminalTokens, caseInsensitive);

    // Clear ALL LONGER_ALT relationships to prevent multi-mode lexer conflicts
    // This includes boolean keywords, type tag names, and general keywords
    tokenType.LONGER_ALT = undefined;

    return tokenType;
  }

  private conflictsWithTypeTag(token: TokenType): boolean {
    const conflictingTokens = [TK.COMMON_NOUN];
    return conflictingTokens.includes(token.name as TK);
  }
}