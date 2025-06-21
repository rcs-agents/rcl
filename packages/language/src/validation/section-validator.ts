import type { ValidationAcceptor } from 'langium';
import type { Section, Attribute, ReservedSectionName } from '../generated/ast.js';
import { SectionTypeRegistry } from '../services/section-registry.js';
import { type SectionTypeConstants } from '../services/section-type-constants.js';
import { KW } from '../constants.js';

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
        const sectionType = this.getSectionType(section);
        if (!sectionType) {
            accept('error', 'Unable to determine section type', {
                node: section,
                property: 'sectionType'
            });
            return;
        }
        
        const config = this.registry.getConstants(sectionType);
        if (!config) {
            accept('error', `Unknown section type: ${sectionType}`, {
                node: section,
                property: 'sectionType'
            });
            return;
        }
        
        // Validate attributes
        this.validateAttributes(section, config, accept);
        
        // Validate required attributes
        this.validateRequiredAttributes(section, config, accept);
        
        // Validate reserved subsections
        this.validateReservedSubSections(section, config, accept);
        
        // Validate allowed subsections
        this.validateAllowedSubSections(section, config, accept);
        
        // Validate minimum required subsections
        this.validateMinRequiredSubSections(section, config, accept);
        
        // Validate unique subsection IDs
        this.validateUniqueSubSectionIds(section, config, accept);
    }
    
    /**
     * Extract section type from section node
     */
    private getSectionType(section: Section): string | undefined {
        // Check if section has an explicit type
        if (section.sectionType) {
            // Handle message section types (e.g., "authentication message")
            if (section.sectionType.includes(KW.Message)) {
                return section.sectionType;
            }
            return section.sectionType;
        }
        
        // Check if section has a reserved name that implies a type
        const typedSection = section as Section & { reservedName?: ReservedSectionName };
        if (typedSection.reservedName) {
            const reservedName = typedSection.reservedName;
            // Map reserved names to their implied types
            const reservedTypeMap: Record<string, string> = {
                [KW.Config]: KW.AgentConfig,
                [KW.Defaults]: KW.AgentDefaults,
                [KW.MessagesReserved]: KW.Messages
            };
            return reservedTypeMap[reservedName];
        }
        
        return undefined;
    }
    
    /**
     * Validate that only allowed attributes are present
     */
    private validateAttributes(section: Section, config: SectionTypeConstants, accept: ValidationAcceptor): void {
        const allowedAttributes = config.allowedAttributes || [];
        
        for (const attribute of (section.attributes || [])) {
            const attrKey = (attribute as Attribute).key;
            if (attrKey && !allowedAttributes.includes(attrKey)) {
                accept('error', `Attribute '${attrKey}' is not allowed in ${config.name} section`, {
                    node: attribute,
                    property: 'key'
                });
            }
        }
    }
    
    /**
     * Validate that all required attributes are present
     */
    private validateRequiredAttributes(section: Section, config: SectionTypeConstants, accept: ValidationAcceptor): void {
        const requiredAttributes = config.requiredAttributes || [];
        const presentAttributes = (section.attributes || [])
            .map(attr => (attr as Attribute).key)
            .filter(key => key !== undefined);
        
        for (const required of requiredAttributes) {
            if (!presentAttributes.includes(required)) {
                accept('error', `Missing required attribute '${required}' in ${config.name} section`, {
                    node: section,
                    property: 'attributes'
                });
            }
        }
    }
    
    /**
     * Validate reserved subsections
     */
    private validateReservedSubSections(section: Section, config: SectionTypeConstants, accept: ValidationAcceptor): void {
        const reservedSubSections = config.reservedSubSections || [];
        const subSections = section.subSections || [];
        
        // Check for required reserved subsections
        for (const reserved of reservedSubSections) {
            if (reserved.required) {
                const found = subSections.some(sub => {
                    const subSectionName = this.getSectionName(sub);
                    return subSectionName === reserved.name;
                });
                
                if (!found) {
                    accept('error', `Missing required ${reserved.name} subsection in ${config.name} section`, {
                        node: section,
                        property: 'subSections'
                    });
                }
            }
        }
        
        // Check that reserved names are not used by other section types
        for (const subSection of subSections) {
            const subSectionName = this.getSectionName(subSection);
            if (!subSectionName) continue;
            
            const reservedMatch = reservedSubSections.find(r => r.name === subSectionName);
            if (reservedMatch) {
                const actualType = this.getSectionType(subSection);
                if (actualType !== reservedMatch.impliedType) {
                    accept('error', `Reserved subsection '${subSectionName}' must be of type '${reservedMatch.impliedType}', not '${actualType}'`, {
                        node: subSection,
                        property: 'sectionType'
                    });
                }
            }
        }
    }
    
    /**
     * Validate allowed subsections
     */
    private validateAllowedSubSections(section: Section, config: SectionTypeConstants, accept: ValidationAcceptor): void {
        const allowedSubSections = config.allowedSubSections || [];
        const reservedNames = (config.reservedSubSections || []).map(r => r.name);
        
        for (const subSection of (section.subSections || [])) {
            const subSectionType = this.getSectionType(subSection);
            const subSectionName = this.getSectionName(subSection);
            
            // Skip validation for reserved subsections (handled separately)
            if (subSectionName && reservedNames.includes(subSectionName)) {
                continue;
            }
            
            if (subSectionType && !allowedSubSections.includes(subSectionType)) {
                accept('error', `Subsection type '${subSectionType}' is not allowed in ${config.name} section`, {
                    node: subSection,
                    property: 'sectionType'
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
        
        // Count subsections by type
        for (const subSection of (section.subSections || [])) {
            const subSectionType = this.getSectionType(subSection);
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
                    property: 'subSections'
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
        
        for (const subSection of (section.subSections || [])) {
            const subSectionId = this.getSectionName(subSection);
            if (subSectionId) {
                if (seenIds.has(subSectionId)) {
                    accept('error', `Duplicate subsection ID '${subSectionId}' in ${config.name} section`, {
                        node: subSection,
                        property: 'sectionName'
                    });
                }
                seenIds.add(subSectionId);
            }
        }
    }
    
    /**
     * Extract section name from section node
     */
    private getSectionName(section: Section): string | undefined {
        // Check if section has a reserved name
        const typedSection = section as Section & { reservedName?: ReservedSectionName };
        if (typedSection.reservedName) {
            return typedSection.reservedName;
        }

        // section.sectionName is now directly a string
        if (section.sectionName) {
            return section.sectionName;
        }
        return undefined;
    }
} 