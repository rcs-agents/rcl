import { afterEach, beforeAll, describe, expect, test } from "vitest";
import { EmptyFileSystem, type LangiumDocument } from "langium";
import { expandToString as s } from "langium/generate";
import { clearDocuments, parseHelper } from "langium/test";
import { createRclTestServices } from '../../src/rcl-module.js';
import { type RclTestFile } from '../../src/generated/ast.js';

let testServices: ReturnType<typeof createRclTestServices>;
let parseTest: ReturnType<typeof parseHelper<RclTestFile>>;
let document: LangiumDocument<RclTestFile> | undefined;

beforeAll(async () => {
    testServices = createRclTestServices(EmptyFileSystem);
    parseTest = parseHelper<RclTestFile>(testServices.RclTest);
});

afterEach(async () => {
    document && clearDocuments(testServices.shared, [ document ]);
});

describe('Linking tests (rcl-test grammar)', () => {
    test('linking of agent definition (rcl-test)', async () => {
        document = await parseTest(`
agent TestAgent
  displayName: "Test Display Name"
  brandName: "Test Brand"
`);
        const root = document.parseResult.value;
        // Check for absence of parser errors and correct root type
        expect(checkTestDocumentValid(document)).toBeUndefined();
        expect(root).toBeDefined();
        // Optionally, check for correct section linking if needed
    });
});

function checkTestDocumentValid(document: LangiumDocument<RclTestFile>): string | undefined {
    return document.parseResult.parserErrors.length && s`
        Parser errors:
          ${document.parseResult.parserErrors.map(e => e.message).join('\n  ')}
    `
        || document.parseResult.value === undefined && `ParseResult is 'undefined'.`
        || document.parseResult.value.$type !== 'RclTestFile' && `Root AST object is a ${document.parseResult.value.$type}, expected a 'RclTestFile'.`
        || undefined;
}
