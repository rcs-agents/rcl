import type { LangiumDocument, MaybePromise } from 'langium';
import type { DocumentSymbolProvider } from 'langium/lsp';
import { type DocumentSymbol, SymbolKind } from 'vscode-languageserver-protocol';
import type { CancellationToken, DocumentSymbolParams } from 'vscode-languageserver-protocol';
import type { ImportStatement, RclFile } from '../parser/ast/core/file-structure.js';
import { isRclFile, type Section } from '../parser/ast/type-guards.js';
import type { Attribute } from '../parser/ast/core/base-types.js';
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

    const rclFile = rootNode as RclFile;

    const symbols: DocumentSymbol[] = [];

    for (const importStmt of rclFile.imports) {
      const importSymbol = this.getImportSymbol(importStmt);
      if (importSymbol) {
        symbols.push(importSymbol);
      }
    }

    if (rclFile.agentSection) {
      const agentSymbol = this.getSectionSymbol(rclFile.agentSection);
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

    const sectionTypeStr = section.type ?? 'UnnamedType';
    const sectionDisplayName = section.name || sectionTypeStr;
    const name = `${sectionDisplayName} (${sectionTypeStr})`;

    let selectionRange = range;
    const nameCstNode = this.services.references.NameProvider.getNameNode(section);
    if (nameCstNode) {
      selectionRange = nameCstNode.range;
    }

    const children: DocumentSymbol[] = [];
    if ('attributes' in section && Array.isArray(section.attributes)) {
      for (const attr of section.attributes) {
        const attrSymbol = this.getAttributeSymbol(attr as Attribute);
        if (attrSymbol) children.push(attrSymbol);
      }
    }
    if ('subSections' in section && Array.isArray(section.subSections)) {
      for (const subSection of section.subSections) {
        const subSectionSymbol = this.getSectionSymbol(subSection as Section);
        if (subSectionSymbol) children.push(subSectionSymbol);
      }
    }
    if ('flowContent' in section && Array.isArray((section as any).flowContent)) {
      // TODO: Add flow rules if applicable later
    }

    return {
      name: name,
      kind: SymbolKind.Class,
      range: range,
      selectionRange: selectionRange,
      children: children.length > 0 ? children : undefined,
    };
  }

  private getAttributeSymbol(attribute: Attribute): DocumentSymbol | undefined {
    // Attribute doesn't have $cstNode since it's not a Langium AstNode
    if (!attribute.key) return undefined;

    // Create a default range - this would need to be properly implemented
    // with actual position information from the parser
    const range = { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } };
    const selectionRange = range;

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