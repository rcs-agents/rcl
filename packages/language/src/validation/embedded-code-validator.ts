import type { ValidationAcceptor } from 'langium';
import type { EmbeddedCodeBlock } from '../generated/ast.js';
import { isSingleLineEmbeddedCodeBlock, isMultiLineEmbeddedCodeBlock } from '../generated/ast.js';
import { KW } from '../constants.js'; // Import KW

// Define SyntaxError locally as in the plan if not imported from a general utility
class SyntaxError extends Error { // Basic error classes as per plan
  constructor(message: string) {
    super(message);
    this.name = 'SyntaxError';
  }
}

export class EmbeddedCodeValidator {

  public checkEmbeddedCode(codeBlock: EmbeddedCodeBlock, accept: ValidationAcceptor): void {
    const language = this.getEmbeddedLanguage(codeBlock);
    const content = this.getCodeContent(codeBlock);

    // For multi-line blocks, content extraction is complex from AST alone.
    // Basic validation might only check the marker or if any content is expected.
    if (isMultiLineEmbeddedCodeBlock(codeBlock) && !content) {
      // console.log("Multi-line block found, content extraction placeholder.");
      // Potentially accept a warning if multi-line blocks are expected to have parsable content later.
      // For now, we do nothing if content is null for multi-line from this basic getCodeContent.
    }

    if (content && (language === 'javascript' || language === 'typescript')) {
      this.validateJavaScriptTypeScript(codeBlock, content, language, accept);
    } else if (content && language === 'unknown' && content.trim() === '') {
      // $>
      // If generic code block $> is empty, it is an error
      accept('error', `Empty generic code block is not allowed.`, {
        node: codeBlock,
        property: isSingleLineEmbeddedCodeBlock(codeBlock) ? 'content' : 'start',
        code: 'empty-generic-code-block'
      });
    } else if (language === 'unknown' && content && content.trim() !== '') {
      // $>
      // If generic code block $> has content, it is a warning for now
      accept('warning', `Generic code blocks ($>) content is not currently validated.`, {
        node: codeBlock,
        property: isSingleLineEmbeddedCodeBlock(codeBlock) ? 'content' : 'start',
        code: 'generic-code-block-no-validation'
      });
    }
  }

  private getEmbeddedLanguage(codeBlock: EmbeddedCodeBlock): 'javascript' | 'typescript' | 'unknown' {
    let markerText = '';
    if (isSingleLineEmbeddedCodeBlock(codeBlock)) {
      // The 'content' property of SingleLineEmbeddedCodeBlock includes the marker and the code.
      // e.g., "$js> console.log('hello')"
      markerText = codeBlock.content.substring(0, 6); // Check first few chars for marker, e.g., $js>>> or $ts>
    } else if (isMultiLineEmbeddedCodeBlock(codeBlock)) {
      // The 'start' property of MultiLineEmbeddedCodeBlock is the marker itself.
      // e.g., "$js>>>"
      markerText = codeBlock.start;
    }

    if (markerText.startsWith(KW.JsPrefix) || markerText.startsWith(KW.JsMultiLinePrefix)) return 'javascript';
    if (markerText.startsWith(KW.TsPrefix) || markerText.startsWith(KW.TsMultiLinePrefix)) return 'typescript';
    if (markerText.startsWith(KW.GenericPrefix) || markerText.startsWith(KW.GenericMultiLinePrefix)) return 'unknown'; // Generic marker
    return 'unknown';
  }

  private getCodeContent(codeBlock: EmbeddedCodeBlock): string | null {
    if (isSingleLineEmbeddedCodeBlock(codeBlock)) {
      const fullContent = codeBlock.content;
      if (fullContent.startsWith(KW.JsPrefix)) return fullContent.substring(KW.JsPrefix.length).trim();
      if (fullContent.startsWith(KW.TsPrefix)) return fullContent.substring(KW.TsPrefix.length).trim();
      if (fullContent.startsWith(KW.GenericPrefix)) return fullContent.substring(KW.GenericPrefix.length).trim();
      return fullContent.trim(); // Fallback, though should have a marker
    } else if (isMultiLineEmbeddedCodeBlock(codeBlock)) {
      // For MultiLineEmbeddedCodeBlock, the AST node (`codeBlock`) only contains the `start` marker.
      // The actual content is determined by indentation and subsequent CST nodes.
      // Robustly extracting this requires CST traversal which is complex here.
      // Returning null to indicate content is not directly available from this AST node for validation.
      return null;
    }
    return null;
  }

  private validateJavaScriptTypeScript(
    codeBlock: EmbeddedCodeBlock,
    content: string, // This content is only from SingleLineEmbeddedCodeBlock for now
    language: 'javascript' | 'typescript',
    accept: ValidationAcceptor
  ): void {
    try {
      if (content.trim() === '') {
        accept('error', `Empty ${language} code block is not allowed.`, {
          node: codeBlock,
          property: isSingleLineEmbeddedCodeBlock(codeBlock) ? 'content' : 'start',
          code: 'empty-embedded-code'
        });
        return;
      }

      const syntaxErrors = this.checkJavaScriptSyntax(content, codeBlock.$cstNode?.range.start.line ?? 0);
      for (const error of syntaxErrors) {
        accept('error', `${language} syntax error: ${error.message}`, {
          node: codeBlock,
          // Precise error location within the block is hard without a real parser
          // We can use codeBlock.property or a diagnostic range if available from error
          property: isSingleLineEmbeddedCodeBlock(codeBlock) ? 'content' : 'start',
          code: 'embedded-code-syntax-error'
        });
      }

      // Placeholder for TypeScript type checking if language is 'typescript'
      // const typeErrors = this.checkTypeScriptTypes(content);
      // for (const error of typeErrors) { /* ... accept error ... */ }

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      accept('error', `Failed to validate embedded ${language} code: ${message}`, {
        node: codeBlock,
        property: isSingleLineEmbeddedCodeBlock(codeBlock) ? 'content' : 'start',
        code: 'embedded-code-validation-error'
      });
    }
  }

  // Basic syntax check: example for unbalanced brackets
  private checkJavaScriptSyntax(content: string, startLine: number): SyntaxError[] {
    const errors: SyntaxError[] = [];
    const stack: { char: string, line: number, col: number }[] = [];
    const bracketPairs: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
    let line = startLine;
    let col = 0;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      col++;
      if (char === '\n') {
        line++;
        col = 0;
      }

      if (bracketPairs[char]) {
        stack.push({ char, line, col });
      } else if (Object.values(bracketPairs).includes(char)) {
        if (stack.length === 0 || bracketPairs[stack[stack.length - 1].char] !== char) {
          errors.push(new SyntaxError(`Unmatched closing bracket '${char}' at line ${line + 1}, column ${col}.`));
        } else {
          stack.pop();
        }
      }
    }
    for (const unclosed of stack) {
      errors.push(new SyntaxError(`Unclosed opening bracket '${unclosed.char}' at line ${unclosed.line + 1}, column ${unclosed.col}.`));
    }
    return errors;
  }
  // checkTypeScriptTypes would be a placeholder or use a similar basic check for now.
}