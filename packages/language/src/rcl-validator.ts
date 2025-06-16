import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { RclAstType, AgentDefinition, Property } from './generated/ast.js';
import type { RclServices } from './rcl-module.js';

/**
 * RCS Specification constraints - this would ideally come from a JSON schema 
 * or external specification file
 */
const RCS_AGENT_SPEC = {
    requiredProperties: ['displayName'],
    optionalProperties: ['brandName', 'config', 'defaults', 'flow', 'messages'],
    propertyTypes: {
        displayName: 'string',
        brandName: 'string',
        config: 'ConfigDefinition',
        defaults: 'DefaultsDefinition', 
        flow: 'FlowDefinition',
        messages: 'MessagesDefinition'
    },
    propertyConstraints: {
        displayName: { maxLength: 100, minLength: 1 },
        brandName: { maxLength: 50, minLength: 1 }
    }
} as const;

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: RclServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.RclValidator;
    const checks: ValidationChecks<RclAstType> = {
        AgentDefinition: validator.checkAgentDefinition,
        Property: validator.checkProperty
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations based on RCS specification.
 */
export class RclValidator {

    /**
     * Validate AgentDefinition against RCS specification
     */
    checkAgentDefinition(agentDef: AgentDefinition, accept: ValidationAcceptor): void {
        const propertyNames = agentDef.properties.map(p => p.name);
        
        // Check required properties
        for (const required of RCS_AGENT_SPEC.requiredProperties) {
            if (!propertyNames.includes(required)) {
                accept('error', `Missing required property '${required}' according to RCS specification`, {
                    node: agentDef,
                    property: 'properties'
                });
            }
        }
        
        // Check for unknown properties
        const allValidProperties = [
            ...RCS_AGENT_SPEC.requiredProperties,
            ...RCS_AGENT_SPEC.optionalProperties
        ];
        
        for (const propName of propertyNames) {
            if (!allValidProperties.includes(propName)) {
                const property = agentDef.properties.find(p => p.name === propName);
                accept('warning', `Property '${propName}' is not defined in RCS specification`, {
                    node: property!,
                    property: 'name'
                });
            }
        }
        
        // Check for duplicate properties
        const duplicates = propertyNames.filter((name, index) => propertyNames.indexOf(name) !== index);
        if (duplicates.length > 0) {
            accept('error', `Duplicate properties found: ${duplicates.join(', ')}`, {
                node: agentDef,
                property: 'properties'
            });
        }
    }
    
    /**
     * Validate individual properties against RCS specification
     */
    checkProperty(property: Property, accept: ValidationAcceptor): void {
        const propName = property.name;
        
        // Type checking based on RCS spec
        const expectedType = RCS_AGENT_SPEC.propertyTypes[propName as keyof typeof RCS_AGENT_SPEC.propertyTypes];
        if (expectedType) {
            this.validatePropertyType(property, expectedType, accept);
        }
        
        // Constraint checking
        const constraints = RCS_AGENT_SPEC.propertyConstraints[propName as keyof typeof RCS_AGENT_SPEC.propertyConstraints];
        if (constraints) {
            this.validatePropertyConstraints(property, constraints, accept);
        }
    }
    
    private validatePropertyType(property: Property, expectedType: string, accept: ValidationAcceptor): void {
        // This is where you'd implement type checking logic
        // For example, if expectedType is 'string', ensure property.value is a STRING
        // If expectedType is 'ConfigDefinition', ensure property.value references a valid config object
        
        // Example implementation for string types:
        if (expectedType === 'string') {
            // Check if the value is a string literal
            // This would depend on your Value rule structure
            // You might check if property.value.$type === 'StringLiteral' or similar
        }
    }
    
    private validatePropertyConstraints(property: Property, constraints: any, accept: ValidationAcceptor): void {
        // Example: validate string length constraints
        if (constraints.maxLength || constraints.minLength) {
            // Extract string value and validate length
            // This would depend on your specific Value AST structure
        }
    }
}
