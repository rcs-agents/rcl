import { beforeAll, describe, expect, test } from "vitest";
import { EmptyFileSystem, type LangiumDocument } from "langium";
import { expandToString as s } from "langium/generate";
import { parseHelper, expectNoError } from "langium/test";
import { createRclServices, createRclTestServices } from '../src/rcl-module.js';
import { isRclFile, type RclFile, type RclTestFile, type Section } from '../src/generated/ast.js';
import { KW } from "../src/constants.js";
import type { Attribute } from "../src/generated/ast.js";
import fs from 'node:fs';
import path from 'node:path';

let services: ReturnType<typeof createRclServices>;
let testServices: ReturnType<typeof createRclTestServices>;
let parse:    ReturnType<typeof parseHelper<RclFile>>;
let parseTest: ReturnType<typeof parseHelper<RclTestFile>>;
let document: LangiumDocument<RclFile> | undefined;

beforeAll(async () => {
    services = createRclServices(EmptyFileSystem);
    testServices = createRclTestServices(EmptyFileSystem);
    parse = parseHelper<RclFile>(services.Rcl);
    parseTest = parseHelper<RclTestFile>(testServices.RclTest);

    // activate the following if your linking test requires elements from a built-in library, for example
    // await services.shared.workspace.WorkspaceManager.initializeWorkspace([]);
});

describe('Parsing tests', () => {

    test('parse simple model', async () => {
        document = await parse(`${KW.Agent} Test Agent
  displayName: "Test Display Name"
  brandName: "Test Brand"
`);

        // check for absence of parser errors the classic way:
        //  deactivated, find a much more human readable way below!
        // expect(document.parseResult.parserErrors).toHaveLength(0);

        const agentSection = document.parseResult.value?.agentSection;
        const agentName = agentSection?.sectionName;
        const displayNameAttr = agentSection?.agentAttributes?.find((attr) => attr.key === 'displayName');
        
        const displayName = displayNameAttr?.value?.value 
            ? displayNameAttr.value.value.replace(/^"|"$/g, '') // Remove quotes from string token
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

describe('Section-Specific Parsing Tests', () => {
    const fixturesPath = path.join(__dirname, 'fixtures', 'sections');

    test('parse agent definition structures', async () => {
        const content = fs.readFileSync(path.join(fixturesPath, 'agent-definition.rcl-test'), 'utf-8');
        const document = await parseTest(content);
        expect(checkTestDocumentValid(document)).toBeUndefined();
        
        // Verify that sections were parsed correctly
        expect(document.parseResult.value?.testSections).toBeDefined();
        expect(document.parseResult.value?.testSections.length).toBeGreaterThan(0);
    });

    test.skip('parse configuration properties', async () => {
        // TODO: Re-enable when test grammar is working
    });

    test.skip('parse default properties', async () => {
        // TODO: Re-enable when test grammar is working
    });

    test.skip('parse message structures', async () => {
        // TODO: Re-enable when test grammar is working
    });

    test.skip('parse collection structures', async () => {
        // TODO: Re-enable when test grammar is working
    });

    test.skip('parse expression syntax', async () => {
        // TODO: Re-enable when test grammar is working
    });

    test.skip('parse rich card structures', async () => {
        // TODO: Re-enable when test grammar is working
    });

    test.skip('parse suggestion structures', async () => {
        // TODO: Re-enable when test grammar is working
    });

    test('validate main example file still parses correctly', async () => {
        const content = fs.readFileSync(path.join(__dirname, 'fixtures', 'example.rcl-test'), 'utf-8');
        const document = await parse(content);
        
        expect(checkDocumentValid(document)).toBeUndefined();
        expect(document.parseResult.value?.agentSection).toBeDefined();
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

function checkTestDocumentValid(document: LangiumDocument<RclTestFile>): string | undefined {
    return document.parseResult.parserErrors.length && s`
        Parser errors:
          ${document.parseResult.parserErrors.map(e => e.message).join('\n  ')}
    `
        || document.parseResult.value === undefined && `ParseResult is 'undefined'.`
        || document.parseResult.value.$type !== 'RclTestFile' && `Root AST object is a ${document.parseResult.value.$type}, expected a 'RclTestFile'.`
        || undefined;
}
