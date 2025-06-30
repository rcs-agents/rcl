import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { LangiumDocument } from 'langium';
import type { CancellationToken } from 'vscode-languageserver-protocol';
import type { RclFile, RclAstType, Section, FlowRule, TypeConversion } from './generated/ast.js';
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
    let rootSectionType = rclFile.agentSection.type;

    if (rootSectionType !== KW.Agent) {
      accept('error', `Root section must be of type '${KW.Agent}', found '${rootSectionType || 'unknown'}'`, {
        node: rclFile.agentSection,
        property: 'type'
      });
    }
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
    Section: validator.checkSection,
    RclFile: validator.checkRclFile,
    FlowRule: validator.checkFlowRule,
    TypeConversion: validator.checkTypeConversion
  };
  registry.register(checks, validator);
}
