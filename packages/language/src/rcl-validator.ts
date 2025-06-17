import type { ValidationAcceptor, ValidationChecks, AstNode } from 'langium';
import type { RclAstType, Section, RclFile } from './generated/ast.js';
import { isSection } from './generated/ast.js';
import type { RclServices } from './rcl-module.js';
import { SectionTypeRegistry } from './services/section-registry.js';
import { SectionValidator } from './validation/section-validator.js';

/**
 * Registry for custom validation checks.
 */
export class RclValidator {
    private sectionRegistry: SectionTypeRegistry;
    private sectionValidator: SectionValidator;
    
    constructor() {
        this.sectionRegistry = new SectionTypeRegistry();
        this.sectionValidator = new SectionValidator(this.sectionRegistry);
    }
    
    /**
     * Main section validation - validates any section based on its type
     */
    checkSection(section: Section, accept: ValidationAcceptor): void {
        this.sectionValidator.validateSection(section, accept);
    }
    
    /**
     * Validate RCL file structure
     */
    checkRclFile(rclFile: RclFile, accept: ValidationAcceptor): void {
        // Ensure there is exactly one agent section at the root
        if (!rclFile.agentSection) {
            accept('error', 'RCL file must contain exactly one agent section', {
                node: rclFile
            });
            return;
        }
        
        // Ensure the root section is an agent section
        let rootSectionType = rclFile.agentSection.sectionType;
        
        // Check if it's a reserved name section
        if (!rootSectionType && (rclFile.agentSection as any).reservedName) {
            const reservedTypeMap: Record<string, string> = {
                'Config': 'agentConfig',
                'Defaults': 'agentDefaults', 
                'Messages': 'messages'
            };
            rootSectionType = reservedTypeMap[(rclFile.agentSection as any).reservedName];
        }
        
        if (rootSectionType !== 'agent') {
            accept('error', `Root section must be of type 'agent', found '${rootSectionType || 'unknown'}'`, {
                node: rclFile.agentSection,
                property: 'sectionType'
            });
        }
    }
    
    /**
     * Validate message section parameters (expiration settings)
     */
    checkMessageSectionParameters(section: Section, accept: ValidationAcceptor): void {
        const sectionType = section.sectionType;
        
        // Only message sections can have parameters
        if (sectionType && sectionType.includes('message')) {
            if (section.sectionParam) {
                // Validate that the parameter is either a timestamp or duration
                this.validateMessageExpiration(section, accept);
            }
        } else if (section.sectionParam) {
            accept('error', `Section type '${sectionType}' does not support parameters`, {
                node: section,
                property: 'sectionParam'
            });
        }
    }
    
    /**
     * Validate message expiration parameter
     */
    private validateMessageExpiration(section: Section, accept: ValidationAcceptor): void {
        if (!section.sectionParam) return;
        
        // Check if it's a type-tagged timestamp
        const param = section.sectionParam;
        
        // This is a simplified validation - in a full implementation,
        // you'd check the actual TypedValue structure more thoroughly
        if (param && typeof param === 'object') {
            // If it's a TypeConversion with date/datetime type, that's valid for expireTime
            // If it's a string ending with 's', that's valid for ttl
            // For now, we'll accept any TypedValue and let runtime validation handle specifics
        }
    }
    
    /**
     * Validate reserved section names
     */
    checkReservedSectionNames(section: Section, accept: ValidationAcceptor): void {
        const sectionName = this.getSectionName(section);
        const parentSection = this.getParentSection(section);
        
        if (!parentSection || !sectionName) return;
        
        // Get parent section type (need to handle reserved names in parent too)
        let parentSectionType = parentSection.sectionType;
        if (!parentSectionType && (parentSection as any).reservedName) {
            const reservedTypeMap: Record<string, string> = {
                'Config': 'agentConfig',
                'Defaults': 'agentDefaults', 
                'Messages': 'messages'
            };
            parentSectionType = reservedTypeMap[(parentSection as any).reservedName];
        }
        
        if (!parentSectionType) return;
        
        const reservedSubSections = this.sectionRegistry.getReservedSubSections(parentSectionType);
        const reservedMatch = reservedSubSections.find(r => r.name === sectionName);
        
        if (reservedMatch) {
            // For reserved names, the type is automatically implied
            // So we just need to ensure they're used in the right context
            if ((section as any).reservedName) {
                // This is a reserved name section, which is correct
                return;
            } else if (section.sectionType) {
                // This is an explicit section type using a reserved name
                const actualType = section.sectionType;
                if (actualType !== reservedMatch.impliedType) {
                    accept('error', `Reserved section name '${sectionName}' requires type '${reservedMatch.impliedType}', but found '${actualType}'`, {
                        node: section,
                        property: 'sectionType'
                    });
                }
            }
        }
    }
    
    /**
     * Get section name as string
     */
    private getSectionName(section: Section): string | undefined {
        // Check if section has a reserved name
        if ((section as any).reservedName) {
            return (section as any).reservedName;
        }
        
        // section.sectionName is now directly a string due to "SectionName returns string: ProperNoun;"
        if (section.sectionName) {
            return section.sectionName;
        }
        return undefined;
    }
    
    /**
     * Get parent section of a section
     */
    private getParentSection(section: Section): Section | undefined {
        let current: AstNode | undefined = section.$container;
        while (current) {
            if (isSection(current)) {
                return current;
            }
            current = current.$container;
        }
        return undefined;
    }
}

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: RclServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.RclValidator;
    const checks: ValidationChecks<RclAstType> = {
        Section: [
            validator.checkSection,
            validator.checkMessageSectionParameters,
            validator.checkReservedSectionNames
        ],
        RclFile: validator.checkRclFile
    };
    registry.register(checks, validator);
}
