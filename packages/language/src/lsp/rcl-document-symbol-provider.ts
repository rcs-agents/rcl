import type { LangiumDocument, MaybePromise } from 'langium';
import type { DocumentSymbolProvider } from 'langium/lsp';
import { DocumentSymbol, SymbolKind, type CancellationToken, type DocumentSymbolParams } from 'vscode-languageserver-protocol';
import type { ImportStatement, Section, Attribute } from '../generated/ast.js';
import { isRclFile } from '../generated/ast.js';
import type { RclServices } from '../rcl-module.js';

export class RclDocumentSymbolProvider implements DocumentSymbolProvider {

  protected readonly services: RclServices;

  constructor(services: RclServices) {
    this.services = services;
  }

  getSymbols(document: LangiumDocument, params: DocumentSymbolParams, cancelToken?: CancellationToken): MaybePromise<DocumentSymbol[]> {
    const rootNode = document.parseResult.value;
    if (!isRclFile(rootNode)) {
      return Promise.resolve([]);
    }

    const symbols: DocumentSymbol[] = [];

    for (const importStmt of rootNode.imports) {
      const importSymbol = this.getImportSymbol(importStmt);
      if (importSymbol) {
        symbols.push(importSymbol);
      }
    }

    if (rootNode.agentSection) {
      const agentSymbol = this.getSectionSymbol(rootNode.agentSection);
      if (agentSymbol) {
        symbols.push(agentSymbol);
      }
    }
    return Promise.resolve(symbols);
  }

  private getImportSymbol(importStmt: ImportStatement): DocumentSymbol | undefined {
    const range = importStmt.$cstNode?.range;
    if (!range) return undefined;

    let name = `import ${importStmt.source}`;
    if (importStmt.alias) {
      name += ` as ${importStmt.alias}`;
    }
    return {
      name: name,
      kind: SymbolKind.Module,
      range: range,
      selectionRange: range,
      children: [],
    };
  }

  private getSectionSymbol(section: Section): DocumentSymbol | undefined {
    const range = section.$cstNode?.range;
    if (!range) return undefined;

    const sectionTypeStr = section.sectionType || (section.reservedName ? 'Reserved' : 'UnnamedType');
    const sectionDisplayName = section.sectionName || section.reservedName || sectionTypeStr;
    const name = `${sectionDisplayName} (${sectionTypeStr})`;

    let selectionRange = range;
    const nameCstNode = this.services.references.NameProvider.getNameNode(section);
    if (nameCstNode) {
      selectionRange = nameCstNode.range;
    }

    const children: DocumentSymbol[] = [];
    for (const attr of section.attributes) {
      const attrSymbol = this.getAttributeSymbol(attr);
      if (attrSymbol) children.push(attrSymbol);
    }
    for (const subSection of section.subSections) {
      const subSectionSymbol = this.getSectionSymbol(subSection);
      if (subSectionSymbol) children.push(subSectionSymbol);
    }
    // TODO: Add flow rules if applicable later

    return {
      name: name,
      kind: SymbolKind.Class,
      range: range,
      selectionRange: selectionRange,
      children: children.length > 0 ? children : undefined,
    };
  }

  private getAttributeSymbol(attribute: Attribute): DocumentSymbol | undefined {
    const range = attribute.$cstNode?.range;
    if (!range || !attribute.key) return undefined;

    let selectionRange = range;
    const keyCstNode = this.services.references.NameProvider.getNameNode(attribute);
    if (keyCstNode) {
      selectionRange = keyCstNode.range;
    }

    let detail = 'attribute';
    if (attribute.value?.$type) {
      detail = attribute.value.$type;
    }

    return {
      name: attribute.key,
      kind: SymbolKind.Property,
      detail: detail,
      range: range,
      selectionRange: selectionRange,
      children: [],
    };
  }
}