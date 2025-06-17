import { AGENT_CONFIG_SCHEMA } from '../schemas/agent-config.schema.js';
import { AGENT_MESSAGE_SCHEMA } from '../schemas/agent-message.schema.js';

/**
 * Section type constants for the RCL language specification.
 * These define the allowed attributes, subsections, and validation rules for each section type.
 * This data is part of the language specification and should not be modified by users.
 */

/**
 * Configuration for a section type including validation rules and schema references
 */
export interface SectionTypeConstants {
    name?: string;
    allowedAttributes?: string[];
    requiredAttributes?: string[];
    allowedSubSections?: string[];
    requiredSubSections?: string[];
    minRequiredSubSections?: Record<string, number>;
    reservedSubSections?: ReservedSubSection[];
    uniqueSubSectionIds?: boolean;
    messageTrafficType?: string;
    jsonSchema?: string | object; // Can be a string reference or the actual schema object
    shortcuts?: string[];
    extends?: string; // For inheritance (e.g., message types extending base message)
}

/**
 * Configuration for reserved subsections within a section type
 */
export interface ReservedSubSection {
    name: string;           // e.g., "Config"
    impliedType: string;    // e.g., "agentConfig"  
    required: boolean;
}

/**
 * Embedded section type constants for the RCL language specification.
 * These constants define the structure and validation rules for RCL sections.
 */
export const SECTION_TYPE_CONSTANTS: Record<string, SectionTypeConstants> = {
    "agent": {
        "allowedAttributes": ["displayName", "brandName"],
        "requiredAttributes": ["displayName"],
        "reservedSubSections": [
            { "name": "Config", "impliedType": "agentConfig", "required": true },
            { "name": "Defaults", "impliedType": "agentDefaults", "required": false },
            { "name": "Messages", "impliedType": "messages", "required": true }
        ],
        "allowedSubSections": ["flow"],
        "minRequiredSubSections": { "flow": 1 },
        "jsonSchema": AGENT_CONFIG_SCHEMA
    },
    "agentConfig": {
        "allowedAttributes": [
            "description", "logoUri", "heroUri", "color", 
            "agentUseCase", "hostingRegion", "phoneNumbers", 
            "emails", "websites", "privacy", "termsConditions", 
            "billingConfig"
        ],
        "requiredAttributes": [],
        "jsonSchema": AGENT_CONFIG_SCHEMA
    },
    "agentDefaults": {
        "allowedAttributes": [
            "timezone", "currency", "locale", "authentication", 
            "oauth", "webhook", "expressions",
            "fallback_message", "messageTrafficType", "ttl", "postbackData"
        ],
        "requiredAttributes": []
    },
    "flow": {
        "allowedAttributes": ["rules", "states", "transitions"],
        "requiredAttributes": []
    },
    "messages": {
        "allowedAttributes": [],
        "requiredAttributes": [],
        "allowedSubSections": ["message", "authentication message", "transaction message", "promotion message", "servicerequest message", "acknowledge message"],
        "uniqueSubSectionIds": true
    },
    "message": {
        "allowedAttributes": [
            "text", "fileName", "uploadedRbmFile", "richCard", 
            "contentInfo", "suggestions"
        ],
        "requiredAttributes": [],
        "messageTrafficType": "MESSAGE_TRAFFIC_TYPE_UNSPECIFIED",
        "jsonSchema": AGENT_MESSAGE_SCHEMA,
        "shortcuts": ["text", "file", "richCard"]
    },
    "authentication message": {
        "extends": "message",
        "messageTrafficType": "AUTHENTICATION"
    },
    "transaction message": {
        "extends": "message", 
        "messageTrafficType": "TRANSACTION"
    },
    "promotion message": {
        "extends": "message",
        "messageTrafficType": "PROMOTION"
    },
    "servicerequest message": {
        "extends": "message",
        "messageTrafficType": "SERVICEREQUEST"
    },
    "acknowledge message": {
        "extends": "message",
        "messageTrafficType": "ACKNOWLEDGEMENT"
    }
};

/**
 * Get all available section type names
 */
export function getAllSectionTypeNames(): string[] {
    return Object.keys(SECTION_TYPE_CONSTANTS);
}

/**
 * Check if a section type is defined in the constants
 */
export function isValidSectionType(sectionType: string): boolean {
    return sectionType in SECTION_TYPE_CONSTANTS;
}

/**
 * Get the JSON schema object for a section type (if available)
 */
export function getSectionTypeSchema(sectionType: string): object | undefined {
    const constants = getSectionTypeConstants(sectionType);
    if (constants?.jsonSchema && typeof constants.jsonSchema === 'object') {
        return constants.jsonSchema;
    }
    return undefined;
}

/**
 * Get the constants for a specific section type, with inheritance support
 */
export function getSectionTypeConstants(sectionType: string): SectionTypeConstants | undefined {
    const constants = SECTION_TYPE_CONSTANTS[sectionType];
    if (!constants) {
        return undefined;
    }

    // Process inheritance
    if (constants.extends) {
        const baseConstants = getSectionTypeConstants(constants.extends);
        if (baseConstants) {
            return {
                ...baseConstants,
                ...constants,
                name: sectionType,
                allowedAttributes: [
                    ...(baseConstants.allowedAttributes || []),
                    ...(constants.allowedAttributes || [])
                ],
                requiredAttributes: [
                    ...(baseConstants.requiredAttributes || []),
                    ...(constants.requiredAttributes || [])
                ],
                shortcuts: constants.shortcuts || baseConstants.shortcuts,
                jsonSchema: constants.jsonSchema || baseConstants.jsonSchema,
                messageTrafficType: constants.messageTrafficType || baseConstants.messageTrafficType
            };
        }
    }

    return { ...constants, name: sectionType };
} 