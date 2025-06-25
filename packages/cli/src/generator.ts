// import type { RclFile, Section, Attribute, RclServices } from 'rcl-language';
// import { isLiteralValue } from 'rcl-language';
// import { expandToNode, joinToNode, toString as langiumToString } from 'langium/generate';
// import * as fs from 'node:fs';
// import * as path from 'node:path';
// import { extractDestinationAndName } from './util.js';
// // import { RclToJsonConverter } from 'rcl-language';

// export function generateJavaScript(model: RclFile, filePath: string, destination: string | undefined): string {
//     const data = extractDestinationAndName(filePath, destination);
//     const generatedFilePath = `${path.join(data.destination, data.name)}.js`;

//     // Extract agent information from the new section-based structure
//     const agentSection = model.agentSection;
//     const agentName = agentSection?.sectionName || 'Unknown Agent';
    
//     // Find displayName attribute
//     const displayNameAttr = agentSection?.attributes.find((attr: Attribute) => attr.key === 'displayName');
//     let jsDisplayName = 'Unknown Display Name'; // Default value
//     if (displayNameAttr?.value && isLiteralValue(displayNameAttr.value) && typeof displayNameAttr.value.val_str === 'string') {
//         jsDisplayName = displayNameAttr.value.val_str.replace(/^"|"$/g, ''); // Remove quotes if it's a string literal
//     }
    
//     // Find all flow sections
//     const flowSections = agentSection?.subSections.filter((section: Section) => section.sectionType === 'flow') ?? [];
//     const flowNames = flowSections.map(flow => flow.sectionName || 'Unnamed Flow');

//     const fileNode = expandToNode`
//         "use strict";

//         console.log('Generated from agent: ${agentName}');
//         console.log('Display name: ${jsDisplayName}');
//         ${joinToNode(flowNames, flowName => `console.log('Flow: ${flowName}');`, { appendNewLineIfNotEmpty: true })}
//     `.appendNewLineIfNotEmpty();

//     if (!fs.existsSync(data.destination)) {
//         fs.mkdirSync(data.destination, { recursive: true });
//     }
//     fs.writeFileSync(generatedFilePath, langiumToString(fileNode));
//     return generatedFilePath;
// }



  