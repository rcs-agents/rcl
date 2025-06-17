/**
 * RCL Language Schemas
 * 
 * This module exports all JSON schemas used by the RCL language for validation
 * and language server functionality. These schemas are bundled into the extension
 * and available in both desktop and web environments.
 */

export { AGENT_CONFIG_SCHEMA } from './agent-config.schema.js';
export { AGENT_MESSAGE_SCHEMA } from './agent-message.schema.js';

/**
 * Map of schema names to schema objects for easy lookup
 */
export const SCHEMAS = {
    'agent-config': () => import('./agent-config.schema.js').then(m => m.AGENT_CONFIG_SCHEMA),
    'agent-message': () => import('./agent-message.schema.js').then(m => m.AGENT_MESSAGE_SCHEMA),
} as const;

/**
 * Get a schema by name (async loading for large schemas)
 */
export async function getSchema(schemaName: keyof typeof SCHEMAS): Promise<object> {
    const loader = SCHEMAS[schemaName];
    if (!loader) {
        throw new Error(`Unknown schema: ${schemaName}`);
    }
    return await loader();
}

/**
 * Available schema names
 */
export type SchemaName = keyof typeof SCHEMAS; 