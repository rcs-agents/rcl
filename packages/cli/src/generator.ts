import type { RclFile, Section, Attribute } from 'rcl-language';
import { isLiteralValue } from 'rcl-language';
import { expandToNode, joinToNode, toString } from 'langium/generate';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { extractDestinationAndName } from './util.js';

export function generateJavaScript(model: RclFile, filePath: string, destination: string | undefined): string {
    const data = extractDestinationAndName(filePath, destination);
    const generatedFilePath = `${path.join(data.destination, data.name)}.js`;

    // Extract agent information from the new section-based structure
    const agentSection = model.agentSection;
    const agentName = agentSection.sectionName || 'Unknown Agent';
    
    // Find displayName attribute
    const displayNameAttr = agentSection.attributes.find((attr: Attribute) => attr.key === 'displayName');
    let jsDisplayName = 'Unknown Display Name'; // Default value
    if (displayNameAttr && displayNameAttr.value && isLiteralValue(displayNameAttr.value) && typeof displayNameAttr.value.val_str === 'string') {
        jsDisplayName = displayNameAttr.value.val_str.replace(/^"|"$/g, ''); // Remove quotes if it's a string literal
    }
    
    // Find all flow sections
    const flowSections = agentSection.subSections.filter((section: Section) => section.sectionType === 'flow');
    const flowNames = flowSections.map(flow => flow.sectionName || 'Unnamed Flow');

    const fileNode = expandToNode`
        "use strict";

        console.log('Generated from agent: ${agentName}');
        console.log('Display name: ${jsDisplayName}');
        ${joinToNode(flowNames, flowName => `console.log('Flow: ${flowName}');`, { appendNewLineIfNotEmpty: true })}
    `.appendNewLineIfNotEmpty();

    if (!fs.existsSync(data.destination)) {
        fs.mkdirSync(data.destination, { recursive: true });
    }
    fs.writeFileSync(generatedFilePath, toString(fileNode));
    return generatedFilePath;
}

export function generateJson(rclFile: RclFile): string {
    const agentSection = rclFile.agentSection;
    if (!agentSection) {
        return JSON.stringify({ error: "No agent section found" }, null, 2);
    }

    const agentName = agentSection.sectionName || 'Unknown Agent';
    const flows = (agentSection.subSections || []).filter((ss: Section) => ss.sectionType === 'flow');
    
    const flowSections = flows as Section[]; // Assuming correct filtering
    const flowNames = flowSections.map(flow => flow.sectionName || 'Unnamed Flow');

    const displayNameAttribute = agentSection.attributes.find((attr: Attribute) => attr.key === 'displayName');
    let finalDisplayName: string | undefined = undefined;
    if (displayNameAttribute && displayNameAttribute.value && isLiteralValue(displayNameAttribute.value) && typeof displayNameAttribute.value.val_str === 'string') {
        finalDisplayName = displayNameAttribute.value.val_str.replace(/^"|"$/g, ''); // Remove quotes if it's a string literal
    }

    const output = {
        agentName,
        displayName: finalDisplayName,
        flows: flowNames
    };

    return JSON.stringify(output, null, 2);
}
