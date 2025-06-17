import { 
    getSectionTypeConstants, 
    getSectionTypeSchema,
    getAllSectionTypeNames, 
    isValidSectionType,
    type SectionTypeConstants,
    type ReservedSubSection 
} from './section-type-constants.js';

/**
 * Registry that manages section type constants and provides validation metadata.
 * This registry uses embedded language specification constants rather than external configuration files.
 */
export class SectionTypeRegistry {
    
    constructor() {
        console.log(`Initialized section type registry with ${getAllSectionTypeNames().length} section types`);
    }
    
    /**
     * Get constants for a specific section type
     */
    getConstants(sectionType: string): SectionTypeConstants | undefined {
        return getSectionTypeConstants(sectionType);
    }
    
    /**
     * Check if a section type is valid
     */
    isValidSectionType(sectionType: string): boolean {
        return isValidSectionType(sectionType);
    }
    
    /**
     * Get all allowed attributes for a section type
     */
    getAllowedAttributes(sectionType: string): string[] {
        const constants = this.getConstants(sectionType);
        return constants?.allowedAttributes || [];
    }
    
    /**
     * Get all required attributes for a section type
     */
    getRequiredAttributes(sectionType: string): string[] {
        const constants = this.getConstants(sectionType);
        return constants?.requiredAttributes || [];
    }
    
    /**
     * Get reserved subsections for a section type
     */
    getReservedSubSections(sectionType: string): ReservedSubSection[] {
        const constants = this.getConstants(sectionType);
        return constants?.reservedSubSections || [];
    }
    
    /**
     * Get message traffic type for message section types
     */
    getMessageTrafficType(sectionType: string): string | undefined {
        const constants = this.getConstants(sectionType);
        return constants?.messageTrafficType;
    }
    
    /**
     * Check if a section type allows unique subsection IDs
     */
    requiresUniqueSubSectionIds(sectionType: string): boolean {
        const constants = this.getConstants(sectionType);
        return constants?.uniqueSubSectionIds || false;
    }
    
    /**
     * Get all allowed subsection types for a section type
     */
    getAllowedSubSections(sectionType: string): string[] {
        const constants = this.getConstants(sectionType);
        return constants?.allowedSubSections || [];
    }
    
    /**
     * Get minimum required subsections count
     */
    getMinRequiredSubSections(sectionType: string): Record<string, number> {
        const constants = this.getConstants(sectionType);
        return constants?.minRequiredSubSections || {};
    }
    
    /**
     * Get available shortcuts for a section type
     */
    getShortcuts(sectionType: string): string[] {
        const constants = this.getConstants(sectionType);
        return constants?.shortcuts || [];
    }
    
    /**
     * Get JSON schema reference for a section type
     */
    getJsonSchema(sectionType: string): string | object | undefined {
        const constants = this.getConstants(sectionType);
        return constants?.jsonSchema;
    }
    
    /**
     * Get JSON schema object for runtime validation (if available)
     */
    getSchemaObject(sectionType: string): object | undefined {
        return getSectionTypeSchema(sectionType);
    }
    
    /**
     * Get all registered section types
     */
    getAllSectionTypes(): string[] {
        return getAllSectionTypeNames();
    }
} 