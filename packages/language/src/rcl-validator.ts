import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { LangiumDocument, AstNode } from 'langium';
import type { CancellationToken } from 'vscode-languageserver-protocol';
import type { RclFile, RclAstType, Section, FlowRule, TypeConversion, ReservedSectionName } from './generated/ast.js';
import { isSection } from './generated/ast.js';
import type { RclServices } from './rcl-module.js';
import { SectionTypeRegistry } from './services/section-registry.js';
import { SectionValidator } from './validation/section-validator.js';
import { DependencyValidator } from './validation/dependency-validator.js';
import { TypeValidator } from './validation/type-validator.js';
import { KW } from './constants.js';

/**
 * Registry for custom validation checks.
 */
export class RclValidator {
  private sectionRegistry: SectionTypeRegistry;
  private sectionValidator: SectionValidator;
  private dependencyValidator: DependencyValidator;
  private typeValidator: TypeValidator;

  constructor(services: RclServices) {
    this.sectionRegistry = new SectionTypeRegistry();
    this.sectionValidator = new SectionValidator(this.sectionRegistry);
    this.dependencyValidator = new DependencyValidator();
    this.typeValidator = new TypeValidator();
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
    const agentSectionNode = rclFile.agentSection as Section & { reservedName?: ReservedSectionName };
    if (!rootSectionType && agentSectionNode.reservedName) {
      const reservedTypeMap: Record<string, string> = {
        [KW.Config]: KW.AgentConfig,
        [KW.Defaults]: KW.AgentDefaults,
        [KW.MessagesReserved]: KW.Messages
      };
      rootSectionType = reservedTypeMap[agentSectionNode.reservedName];
    }

    if (rootSectionType !== KW.Agent) {
      accept('error', `Root section must be of type '${KW.Agent}', found '${rootSectionType || 'unknown'}'`, {
        node: rclFile.agentSection,
        property: 'sectionType'
      });
    }
  }

  /**
   * Validate message section parameters (expiration settings)
   * Note: Section parameters are currently not supported in the grammar
   */
  checkMessageSectionParameters(section: Section, accept: ValidationAcceptor): void {
    // Temporarily disabled until section parameters are added back to the grammar
    // const sectionType = section.sectionType;
    // This validation will be re-enabled when section parameters are supported
  }

  /**
   * Validate reserved section names
   */
  checkReservedSectionNames(section: Section, accept: ValidationAcceptor): void {
    const sectionName = this.getSectionName(section);
    const parentSectionNode = this.getParentSection(section);

    if (!parentSectionNode || !sectionName) return;

    // Get parent section type (need to handle reserved names in parent too)
    let parentSectionType = parentSectionNode.sectionType;
    const typedParentSection = parentSectionNode as Section & { reservedName?: ReservedSectionName };
    if (!parentSectionType && typedParentSection.reservedName) {
      const reservedTypeMap: Record<string, string> = {
        [KW.Config]: KW.AgentConfig,
        [KW.Defaults]: KW.AgentDefaults,
        [KW.MessagesReserved]: KW.Messages
      };
      parentSectionType = reservedTypeMap[typedParentSection.reservedName];
    }

    if (!parentSectionType) return;

    const reservedSubSections = this.sectionRegistry.getReservedSubSections(parentSectionType);
    const reservedMatch = reservedSubSections.find(r => r.name === sectionName);

    if (reservedMatch) {
      // For reserved names, the type is automatically implied
      // So we just need to ensure they're used in the right context
      const typedSection = section as Section & { reservedName?: ReservedSectionName };
      if (typedSection.reservedName) {
        // This is a reserved name section, which is correct
        return;
      }
      if (section.sectionType) {
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
    const typedSection = section as Section & { reservedName?: ReservedSectionName };
    if (typedSection.reservedName) {
      return typedSection.reservedName;
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

  /**
   * Validate flow rules for circular dependencies and reachability
   */
  checkFlowRule(flowRule: FlowRule, accept: ValidationAcceptor): void {
    this.dependencyValidator.checkFlowRuleCycles(flowRule, accept);
    this.dependencyValidator.checkFlowReachability(flowRule, accept);
  }

  /**
   * Validate type conversions
   */
  checkTypeConversion(typeConversion: TypeConversion, accept: ValidationAcceptor): void {
    this.typeValidator.checkTypeConversion(typeConversion, accept);
  }

  protected checkDocument(
    document: LangiumDocument<RclFile>,
    cancelToken: CancellationToken
  ): Promise<void> {
    // Implementation placeholder
    return Promise.resolve();
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
    RclFile: validator.checkRclFile,
    FlowRule: validator.checkFlowRule,
    TypeConversion: validator.checkTypeConversion
  };
  registry.register(checks, validator);
}
