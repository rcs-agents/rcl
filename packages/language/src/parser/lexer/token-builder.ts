import type { GrammarAST } from 'langium';
import type { TokenBuilder } from 'langium';
import type { IMultiModeLexerDefinition, TokenVocabulary } from 'chevrotain';
import { allTokens } from './tokens/token-definitions.js';

const DEFAULT_MODE = 'default';
const TYPE_TAG_MODE = 'type_tag';
const TYPE_TAG_MODIFIER_MODE = 'type_tag_modifier';

/**
 * Custom Token Builder for RCL.
 *
 * This implementation of Langium's `TokenBuilder` does not build tokens from the
 * grammar. Instead, it serves the pre-defined token vocabulary from the centralized
 * `token-definitions.ts` file. This is necessary to bridge our custom, hand-written
 * lexer with the parts of Langium's infrastructure that depend on a token vocabulary,
 * such as the TextMate grammar generator for syntax highlighting.
 *
 * It also provides a multi-mode lexer definition, consistent with the logic in the
 * custom `RclLexer`, to assist any Langium services that might need it.
 */
export class RclTokenBuilder implements TokenBuilder {
  /**
   * Builds the token vocabulary for the RCL language.
   *
   * @param grammar The Langium grammar object (not used in this implementation).
   * @param options Configuration options (not used in this implementation).
   * @returns A multi-mode lexer definition containing all RCL tokens.
   */
  public buildTokens(
    grammar: GrammarAST.Grammar,
    options?: { caseInsensitive?: boolean }
  ): TokenVocabulary {
    // The multi-mode definition should mirror the one in `RclLexer`
    const multiModeLexerDefinition: IMultiModeLexerDefinition = {
      modes: {
        [DEFAULT_MODE]: allTokens,
        [TYPE_TAG_MODE]: allTokens, // Simplified for the builder's purpose
        [TYPE_TAG_MODIFIER_MODE]: allTokens,
      },
      defaultMode: DEFAULT_MODE,
    };
    return multiModeLexerDefinition;
  }
}