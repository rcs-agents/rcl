import type { ValidationAcceptor } from 'langium';
import type { Section, Attribute } from '#src/parser/ast';
import type { SectionTypeRegistry } from '#src/services/section-registry.js';
import type { SectionTypeConstants } from '#src/services/section-type-constants.js';

/**
 * Validation result for section validation
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

/**
 * Generic section validator that validates sections based on their type configuration
 */
export class SectionValidator {
    private registry: SectionTypeRegistry;
    
    constructor(registry: SectionTypeRegistry) {
        this.registry = registry;
    }
    
    /**
     * Validate a section against its type configuration
     */
    validateSection(section: Section, accept: ValidationAcceptor): void {
        const sectionType = section.type;
        if (!sectionType) {
            accept('error', 'Unable to determine section type', {
                node: section,
                property: 'type'
            });
            return;
        }
        
        const config = this.registry.getConstants(sectionType);
        if (!config) {
            accept('error', `Unknown section type: ${sectionType}`, {
                node: section,
                property: 'type'
            });
            return;
        }
        
        // Validate attributes
        this.validateAttributes(section, config, accept);
        
        // Validate required attributes
        this.validateRequiredAttributes(section, config, accept);
        
        // Validate allowed subsections
        this.validateAllowedSubSections(section, config, accept);
        
        // Validate minimum required subsections
        this.validateMinRequiredSubSections(section, config, accept);
        
        // Validate unique subsection IDs
        this.validateUniqueSubSectionIds(section, config, accept);
    }
    
    /**
     * Validate that only allowed attributes are present
     */
    private validateAttributes(section: Section, config: SectionTypeConstants, accept: ValidationAcceptor): void {
        const allowedAttributes = config.allowedAttributes || [];
        
        if ('attributes' in section && Array.isArray(section.attributes)) {
            for (const attribute of section.attributes) {
                const attrKey = (attribute as Attribute).key;
                if (attrKey && !allowedAttributes.includes(attrKey)) {
                    accept('error', `Attribute '${attrKey}' is not allowed in ${config.name} section`, {
                        node: section,
                        property: 'attributes'
                    });
                }
            }
        }
    }
    
    /**
     * Validate that all required attributes are present
     */
    private validateRequiredAttributes(section: Section, config: SectionTypeConstants, accept: ValidationAcceptor): void {
        const requiredAttributes = config.requiredAttributes || [];
        const presentAttributes = ('attributes' in section && Array.isArray(section.attributes))
            ? section.attributes.map(attr => (attr as Attribute).key).filter(key => key !== undefined)
            : [];
        
        for (const required of requiredAttributes) {
            if (!presentAttributes.includes(required)) {
                accept('error', `Missing required attribute '${required}' in ${config.name} section`, {
                    node: section,
                    property: 'name'
                });
            }
        }
    }
    
    /**
     * Validate allowed subsections
     */
    private validateAllowedSubSections(section: Section, config: SectionTypeConstants, accept: ValidationAcceptor): void {
        const allowedSubSections = config.allowedSubSections || [];
        const subSections = this.getSubSections(section);

        for (const subSection of subSections) {
            const subSectionType = subSection.type;
            
            if (subSectionType && !allowedSubSections.includes(subSectionType)) {
                accept('error', `Subsection type '${subSectionType}' is not allowed in ${config.name} section`, {
                    node: subSection,
                    property: 'type'
                });
            }
        }
    }
    
    /**
     * Validate minimum required subsections
     */
    private validateMinRequiredSubSections(section: Section, config: SectionTypeConstants, accept: ValidationAcceptor): void {
        const minRequired = config.minRequiredSubSections || {};
        const subSectionCounts: Record<string, number> = {};
        const subSections = this.getSubSections(section);
        
        // Count subsections by type
        for (const subSection of subSections) {
            const subSectionType = subSection.type;
            if (subSectionType) {
                subSectionCounts[subSectionType] = (subSectionCounts[subSectionType] || 0) + 1;
            }
        }
        
        // Check minimum requirements
        for (const [requiredType, minCount] of Object.entries(minRequired)) {
            const actualCount = subSectionCounts[requiredType] || 0;
            if (actualCount < minCount) {
                accept('error', `${config.name} section requires at least ${minCount} ${requiredType} subsection(s), found ${actualCount}`, {
                    node: section,
                    property: 'name'
                });
            }
        }
    }
    
    /**
     * Validate unique subsection IDs
     */
    private validateUniqueSubSectionIds(section: Section, config: SectionTypeConstants, accept: ValidationAcceptor): void {
        if (!config.uniqueSubSectionIds) return;
        
        const seenIds = new Set<string>();
        const subSections = this.getSubSections(section);
        
        for (const subSection of subSections) {
            const subSectionId = this.getSectionName(subSection);
            if (subSectionId) {
                if (seenIds.has(subSectionId)) {
                    accept('error', `Duplicate subsection ID '${subSectionId}' in ${config.name} section`, {
                        node: subSection,
                        property: 'name'
                    });
                }
                seenIds.add(subSectionId);
            }
        }
    }
    
    private getSubSections(section: Section): Section[] {
        if ('flows' in section && Array.isArray((section as any).flows)) {
            return (section as any).flows;
        }
        if ('messages' in section && Array.isArray((section as any).messages)) {
            return (section as any).messages;
        }
        return [];
    }
    
    /**
     * Extract section name from section node
     */
    private getSectionName(section: Section): string | undefined {
        return section.name;
    }
} 