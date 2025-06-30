import { afterEach, beforeAll, describe, expect, test } from "vitest";
import { EmptyFileSystem, type LangiumDocument } from "langium";
import { expandToString as s } from "langium/generate";
import { clearDocuments, parseHelper } from "langium/test";
import { createRclServices } from '../src/rcl-module.js';
import { isRclFile, type RclFile } from '../src/generated/ast.js';
import { KW } from "../src/constants.js";

let services: ReturnType<typeof createRclServices>;
let parse:    ReturnType<typeof parseHelper<RclFile>>;
let document: LangiumDocument<RclFile> | undefined;

beforeAll(async () => {
    services = createRclServices(EmptyFileSystem);
    parse = parseHelper<RclFile>(services.Rcl);

    // activate the following if your linking test requires elements from a built-in library, for example
    // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});

afterEach(async () => {
    document && clearDocuments(services.shared, [ document ]);
});

describe('Linking tests', () => {

    test('linking of agent definition', async () => {
        document = await parse(`
            ${KW.Agent} Test Agent
                displayName: "Test Display Name"
                brandName: "Test Brand"
        `);

        const agentSection = document.parseResult.value?.agentSection;
        const agentName = agentSection?.sectionName;

        expect(
            // here we first check for validity of the parsed document object by means of the reusable function
            //  'checkDocumentValid()' to sort out (critical) typos first,
            // and then evaluate the basic structure we're interested in
            checkDocumentValid(document)
                || agentName
        ).toBe(s`
            Test Agent
        `);
    });
});

function checkDocumentValid(document: LangiumDocument): string | undefined {
    return document.parseResult.parserErrors.length && s`
        Parser errors:
          ${document.parseResult.parserErrors.map(e => e.message).join('\n  ')}
    `
        || document.parseResult.value === undefined && `ParseResult is 'undefined'.`
        || !isRclFile(document.parseResult.value) && `Root AST object is a ${document.parseResult.value.$type}, expected a 'RclFile'.`
        || undefined;
}
