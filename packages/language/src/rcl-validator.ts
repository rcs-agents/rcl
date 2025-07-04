import type { Section, TypeConversion } from './parser/ast/index.js';
import { isRclFile } from './parser/ast/type-guards.js';
import type { RclFile } from './parser/ast/core/file-structure.js';
import type { FlowRule } from './parser/ast/flow-system/index.js';
import { ValidationAcceptor } from 'langium';
import { DependencyValidator } from './validation/dependency-validator.js';
import { SectionValidator } from './validation/section-validator.js';
import { TypeValidator } from './validation/type-validator.js';
import { ConstraintValidator } from './validation/constraint-validator.js';
import { ReferenceResolver } from './validation/reference-resolver.js';
import type { RclServices } from './rcl-module.js';
import { SectionTypeRegistry } from './services/section-registry.js';

/**
 * Registry for custom validation checks.
 */
export class RclValidator {
  private sectionValidator: SectionValidator;
  private dependencyValidator: DependencyValidator;
  private typeValidator: TypeValidator;
  private constraintValidator: ConstraintValidator;
  private referenceResolver: ReferenceResolver;

  constructor(services: RclServices) {
    this.sectionValidator = new SectionValidator(new SectionTypeRegistry());
    this.dependencyValidator = new DependencyValidator();
    this.typeValidator = new TypeValidator();
    this.constraintValidator = new ConstraintValidator();
    this.referenceResolver = new ReferenceResolver();
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
    if (isRclFile(rclFile)) {
      const rootSection = rclFile.agentSection;
      if (rootSection) {
        const rootSectionType = rootSection.type;
        if (rootSectionType !== 'AgentDefinition') {
          accept('error', 'The root of an RCL file must be an "Agent" section.', { node: rootSection });
        }
        
        // Run comprehensive validation on the agent definition
        this.constraintValidator.validateAgentDefinition(rootSection, accept);
      } else {
        accept('error', 'RCL file must contain an Agent section.', { node: rclFile });
      }
      
      // Resolve and validate all references
      this.referenceResolver.resolveFileReferences(rclFile, accept);
      
      // Check for circular dependencies if agent section exists
      if (rclFile.agentSection) {
        const resolution = this.referenceResolver.resolveFileReferences(rclFile, accept);
        this.referenceResolver.checkCircularDependencies(rclFile.agentSection, resolution, accept);
      }
    }
  }

  /**
   * Validate flow rules for circular dependencies and reachability
   */
  checkFlowRule(flowRule: FlowRule, accept: ValidationAcceptor): void {
    this.dependencyValidator.checkFlowRuleCycles(flowRule, accept);
    this.dependencyValidator.checkFlowReachability(flowRule, accept);
    this.dependencyValidator.checkFlowReferences(flowRule, accept);
  }

  /**
   * Validate type conversions
   */
  checkTypeConversion(typeConversion: TypeConversion, accept: ValidationAcceptor): void {
    this.typeValidator.checkTypeConversion(typeConversion, accept);
  }
}

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: RclServices) {
  // Validation is currently disabled in the simplified module structure
  // TODO: Re-enable validation when custom parser integration is complete
  return;
}
