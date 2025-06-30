import { describe, test, expect, beforeAll } from 'vitest';
import { EmptyFileSystem } from 'langium';
import { expandToString as s } from 'langium/generate';
import { parseHelper, expectNoError, validationHelper, expectError, expectWarning } from 'langium/test';
import type { Diagnostic } from 'vscode-languageserver-types';
import { createRclServices } from '../src/rcl-module.js';
import { isRclFile, type RclFile } from '../src/generated/ast.js';
import { KW } from '../src/constants.js';

let services: ReturnType<typeof createRclServices>;
let parse:    ReturnType<typeof parseHelper<RclFile>>;
let document: LangiumDocument<RclFile> | undefined;

beforeAll(async () => {
    services = createRclServices(EmptyFileSystem);
    const doParse = parseHelper<RclFile>(services.Rcl);
    parse = (input: string) => doParse(input, { validation: true });

    // activate the following if your linking test requires elements from a built-in library, for example
    // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});

describe('Validating', () => {

    test('check no errors', async () => {
        document = await parse(`
            ${KW.Agent} Test Agent "Test display name"
                ${KW.Flow} Main
                    ${KW.Start} ${KW.Arrow} ${KW.End}
        `);

        expect(
            // here we first check for validity of the parsed document object by means of the reusable function
            //  'checkDocumentValid()' to sort out (critical) typos first,
            // and then evaluate the diagnostics by converting them into human readable strings;
            // note that 'toHaveLength()' works for arrays and strings alike ;-)
            checkDocumentValid(document) || document?.diagnostics?.map(diagnosticToString)?.join('\n')
        ).toHaveLength(0);
    });

    test('check validation rules', async () => {
        document = await parse(`
            ${KW.Agent} test agent "Test display name"
                ${KW.Flow} Main
                    ${KW.Start} ${KW.Arrow} ${KW.End}
        `);

        expect(
            checkDocumentValid(document) || document?.diagnostics?.map(diagnosticToString)?.join('\n')
        ).toEqual(
            // 'expect.stringContaining()' makes our test robust against future additions of further validation rules
            expect.stringContaining("Agent name should start with a capital")
        );
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

function diagnosticToString(d: Diagnostic) {
    return `[${d.range.start.line}:${d.range.start.character}..${d.range.end.line}:${d.range.end.character}]: ${d.message}`;
}
