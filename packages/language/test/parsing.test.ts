import { beforeAll, describe, expect, test } from "vitest";
import { EmptyFileSystem, type LangiumDocument } from "langium";
import { expandToString as s } from "langium/generate";
import { parseHelper } from "langium/test";
import type { RclFile } from "rcl-language";
import { createRclServices, isRclFile } from "rcl-language";

let services: ReturnType<typeof createRclServices>;
let parse:    ReturnType<typeof parseHelper<RclFile>>;
let document: LangiumDocument<RclFile> | undefined;

beforeAll(async () => {
    services = createRclServices(EmptyFileSystem);
    parse = parseHelper<RclFile>(services.Rcl);

    // activate the following if your linking test requires elements from a built-in library, for example
    // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});

describe('Parsing tests', () => {

    test('parse simple model', async () => {
        document = await parse(`
            agent Test Agent
                displayName: "Test Display Name"
                brandName: "Test Brand"
        `);

        // check for absence of parser errors the classic way:
        //  deactivated, find a much more human readable way below!
        // expect(document.parseResult.parserErrors).toHaveLength(0);

        const agentSection = document.parseResult.value?.agentSection;
        const agentName = agentSection?.sectionName;
        const displayNameAttr = agentSection?.attributes.find(attr => attr.key === 'displayName');
        const displayName = displayNameAttr?.value && 'val_str' in displayNameAttr.value 
            ? displayNameAttr.value.val_str?.replace(/^"|"$/g, '') // Remove quotes
            : undefined;

        expect(
            // here we use a (tagged) template expression to create a human readable representation
            //  of the AST part we are interested in and that is to be compared to our expectation;
            // prior to the tagged template expression we check for validity of the parsed document object
            //  by means of the reusable function 'checkDocumentValid()' to sort out (critical) typos first;
            checkDocumentValid(document) || s`
                Agent Name: ${agentName}
                Display Name: ${displayName}
            `
        ).toBe(s`
            Agent Name: Test Agent
            Display Name: Test Display Name
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
