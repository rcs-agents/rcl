import { AbstractSemanticTokenProvider, type SemanticTokenAcceptor } from 'langium/lsp';
import { type AstNode } from 'langium';
import { SemanticTokenModifiers, SemanticTokenTypes } from 'vscode-languageserver-protocol';
import { isSection, type Section, isAttribute, type Attribute, isBooleanValue, type BooleanValue } from '../generated/ast.js';

export class RclSemanticTokenProvider extends AbstractSemanticTokenProvider {

  protected override highlightElement(node: AstNode, acceptor: SemanticTokenAcceptor): void {
    if (isSection(node)) {
      this.highlightSection(node, acceptor);
    } else if (isAttribute(node)) {
      this.highlightAttribute(node, acceptor);
    } else if (isBooleanValue(node)) {
      this.highlightBoolean(node, acceptor);
    }
  }

  private highlightSection(section: Section, acceptor: SemanticTokenAcceptor): void {
    if (section.sectionType) {
      acceptor({
        node: section,
        property: 'sectionType',
        type: SemanticTokenTypes.type
      });
    }

    if (section.sectionName) {
      acceptor({
        node: section,
        property: 'sectionName',
        type: SemanticTokenTypes.class
      });
    }

    if (section.reservedName) {
      acceptor({
        node: section,
        property: 'reservedName',
        type: SemanticTokenTypes.keyword,
        modifier: [SemanticTokenModifiers.defaultLibrary]
      });
    }
  }

  private highlightAttribute(attribute: Attribute, acceptor: SemanticTokenAcceptor): void {
    if (attribute.key) {
      acceptor({
        node: attribute,
        property: 'key',
        type: SemanticTokenTypes.property
      });
    }
  }

  private highlightBoolean(booleanNode: BooleanValue, acceptor: SemanticTokenAcceptor): void {
    acceptor({
      node: booleanNode,
      property: 'value',
      type: SemanticTokenTypes.enumMember,
      modifier: [SemanticTokenModifiers.readonly]
    });
  }
}
