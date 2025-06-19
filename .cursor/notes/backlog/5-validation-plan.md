# Validation & Error Handling Plan ✅ COMPLETE

## ✅ **IMPLEMENTATION STATUS: COMPLETE**
**Date Completed:** December 2024
**Files Created:**
- `packages/language/src/validation/dependency-validator.ts`
- `packages/language/src/validation/type-validator.ts`
- `examples/validation_test.rcl`

**Files Modified:**
- `packages/language/src/rcl-validator.ts`

**Build Status:** ✅ Passing
**Integration Status:** ✅ Registered in ValidationRegistry

### **Key Achievements:**
- **Dependency Loop Detection:** Circular dependency detection in flow rules with DFS algorithm
- **Flow Reachability Analysis:** Warns about unreachable flow operands
- **Type System Validation:** Comprehensive validation for 13+ data types (email, date, time, datetime, phone, url, duration, number, integer, float, currency, percentage, latitude, longitude, coordinate)
- **Type Modifier Validation:** Support for type modifiers with appropriate constraints
- **Enhanced Error Messages:** Clear, actionable error messages with error codes
- **Performance Optimized:** Fast validation algorithms suitable for real-time editing

### **Validation Features Implemented:**
1. **Flow Rule Validation:**
   - Circular dependency detection using graph algorithms
   - Unreachable node analysis
   - Flow operand reference validation

2. **Type Conversion Validation:**
   - 13 built-in type validators with comprehensive patterns
   - Proper error messages with examples
   - Type modifier support and validation

3. **Integration:**
   - Full integration with existing validation infrastructure
   - Proper service registration in RclModule
   - Compatible with Langium ValidationRegistry

### **Next Step:** Move to Plan 3 completion (reference provider logic enhancement) or additional validation features as needed

---

## Overview

Based on [Langium Dependency Loops validation](https://langium.org/docs/recipes/validation/dependency-loops/) and [Configuration via Services](https://langium.org/docs/reference/configuration-services/), we need to implement comprehensive validation for RCL that handles:

1. **Dependency loop detection** in flow rules and section references
2. **Semantic validation** for section types, attributes, and values
3. **Type checking** for embedded code and type conversions
4. **Reference validation** for identifiers and cross-references
5. **Schema compliance** checking against agent configuration schemas

---

## Problem Analysis

### 🎯 **Core Validation Requirements**

#### 1. **Dependency Loops in Flow Rules**
```rcl
flow CircularFlow
    :start -> CheckUser
    CheckUser -> ValidateData
    ValidateData -> CheckUser  # ❌ Circular dependency
    CheckUser -> :end
```

#### 2. **Section Reference Validation**
```rcl
agent TestAgent
    startFlow: NonExistentFlow  # ❌ Reference to undefined flow

flow ActualFlow
    :start -> :end
```

#### 3. **Type System Validation**
```rcl
agent TestAgent
    timeout: <duration>invalid_duration</duration>  # ❌ Invalid duration format
    email: <email>not-an-email</email>              # ❌ Invalid email format
    age: <number>not-a-number</number>               # ❌ Invalid number format
```

#### 4. **Schema Compliance**
```rcl
agent TestAgent
    invalidAttribute: "value"     # ❌ Not a valid agent attribute
    required_field: Missing       # ❌ Required field missing
```

#### 5. **Embedded Code Validation**
```rcl
agent TestAgent
    validation: $js> invalid javascript syntax  # ❌ Syntax error in embedded code
    transform: $ts> const x: InvalidType = 5;   # ❌ TypeScript type error
```

---

## Implementation Strategy

### 📋 **Phase 1: Core Validation Infrastructure**

**File:** `packages/language/src/validation/rcl-validator.ts`

```typescript
import { ValidationAcceptor, ValidationChecks, ValidationRegistry } from 'langium';
import { RclAstType } from '../generated/ast.js';

export class RclValidator {

    registerChecks(registry: ValidationRegistry): void {
        const checks: ValidationChecks<RclAstType> = {
            // Core structure validation
            RclFile: this.checkRclFile,
            Section: this.checkSection,
            Attribute: this.checkAttribute,

            // Reference validation
            Identifier: this.checkIdentifierReference,
            FlowOperand: this.checkFlowOperandReference,

            // Type validation
            TypeConversion: this.checkTypeConversion,
            BooleanLiteral: this.checkBooleanLiteral,

            // Flow validation
            FlowRule: this.checkFlowRule,

            // Embedded code validation
            EmbeddedCodeBlock: this.checkEmbeddedCode,

            // Import validation
            ImportStatement: this.checkImportStatement
        };

        registry.register(checks, this);
    }

    checkRclFile(rclFile: RclFile, accept: ValidationAcceptor): void {
        this.checkAgentSectionRequired(rclFile, accept);
        this.checkImportCycles(rclFile, accept);
        this.checkUniqueImports(rclFile, accept);
    }

    checkSection(section: Section, accept: ValidationAcceptor): void {
        this.checkSectionType(section, accept);
        this.checkSectionName(section, accept);
        this.checkRequiredAttributes(section, accept);
        this.checkAttributeSchema(section, accept);
        this.checkNestedSectionConstraints(section, accept);
    }

    checkAttribute(attribute: Attribute, accept: ValidationAcceptor): void {
        this.checkAttributeNameConventions(attribute, accept);
        this.checkAttributeValueType(attribute, accept);
        this.checkAttributeConstraints(attribute, accept);
    }

    checkFlowRule(flowRule: FlowRule, accept: ValidationAcceptor): void {
        this.checkFlowOperandReferences(flowRule, accept);
        this.checkFlowRuleCycles(flowRule, accept);
        this.checkFlowRuleReachability(flowRule, accept);
    }
}
```

### 📋 **Phase 2: Dependency Loop Detection**

**File:** `packages/language/src/validation/dependency-validator.ts`

```typescript
export class DependencyValidator {

    checkFlowRuleCycles(flowRule: FlowRule, accept: ValidationAcceptor): void {
        const parentSection = this.getParentFlowSection(flowRule);
        if (!parentSection) return;

        const flowRules = this.getAllFlowRules(parentSection);
        const flowGraph = this.buildFlowGraph(flowRules);

        const cycles = this.detectCycles(flowGraph);

        cycles.forEach(cycle => {
            const cycleDescription = cycle.map(node => this.getFlowOperandDisplay(node)).join(' -> ');

            accept('error', `Circular dependency detected in flow: ${cycleDescription}`, {
                node: flowRule,
                property: 'source',
                code: 'circular-flow-dependency'
            });
        });
    }

    private buildFlowGraph(flowRules: FlowRule[]): FlowGraph {
        const graph = new Map<string, Set<string>>();

        flowRules.forEach(rule => {
            const source = this.getFlowOperandValue(rule.source);
            const target = this.getFlowOperandValue(rule.target);

            if (!graph.has(source)) {
                graph.set(source, new Set());
            }
            graph.get(source)!.add(target);
        });

        return graph;
    }

    private detectCycles(graph: FlowGraph): string[][] {
        const visited = new Set<string>();
        const recursionStack = new Set<string>();
        const cycles: string[][] = [];

        for (const node of graph.keys()) {
            if (!visited.has(node)) {
                this.dfsDetectCycle(graph, node, visited, recursionStack, [], cycles);
            }
        }

        return cycles;
    }

    private dfsDetectCycle(
        graph: FlowGraph,
        node: string,
        visited: Set<string>,
        recursionStack: Set<string>,
        currentPath: string[],
        cycles: string[][]
    ): void {
        visited.add(node);
        recursionStack.add(node);
        currentPath.push(node);

        const neighbors = graph.get(node) || new Set();

        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                this.dfsDetectCycle(graph, neighbor, visited, recursionStack, currentPath, cycles);
            } else if (recursionStack.has(neighbor)) {
                // Found a cycle
                const cycleStart = currentPath.indexOf(neighbor);
                const cycle = currentPath.slice(cycleStart).concat([neighbor]);
                cycles.push(cycle);
            }
        }

        recursionStack.delete(node);
        currentPath.pop();
    }

    checkSectionReferenceCycles(section: Section, accept: ValidationAcceptor): void {
        const sectionGraph = this.buildSectionReferenceGraph(section);
        const cycles = this.detectSectionCycles(sectionGraph);

        cycles.forEach(cycle => {
            accept('error', `Circular section reference detected: ${cycle.join(' -> ')}`, {
                node: section,
                property: 'sectionName',
                code: 'circular-section-reference'
            });
        });
    }
}

type FlowGraph = Map<string, Set<string>>;
```

### 📋 **Phase 3: Type System Validation**

**File:** `packages/language/src/validation/type-validator.ts`

```typescript
export class TypeValidator {

    checkTypeConversion(typeConversion: TypeConversion, accept: ValidationAcceptor): void {
        const typeName = typeConversion.type;
        const value = this.getTypeConversionValue(typeConversion);

        const validator = this.getTypeValidator(typeName);
        if (!validator) {
            accept('error', `Unknown type: ${typeName}`, {
                node: typeConversion,
                property: 'type',
                code: 'unknown-type'
            });
            return;
        }

        const validationResult = validator.validate(value);
        if (!validationResult.isValid) {
            accept('error', `Invalid ${typeName}: ${validationResult.message}`, {
                node: typeConversion,
                property: 'value',
                code: 'invalid-type-value'
            });
        }
    }

    private getTypeValidator(typeName: string): TypeValidatorFunction | undefined {
        const validators: Record<string, TypeValidatorFunction> = {
            'date': this.validateDate,
            'time': this.validateTime,
            'datetime': this.validateDateTime,
            'email': this.validateEmail,
            'phone': this.validatePhone,
            'url': this.validateUrl,
            'duration': this.validateDuration,
            'number': this.validateNumber
        };

        return validators[typeName];
    }

    private validateEmail(value: string): ValidationResult {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
            isValid: emailRegex.test(value),
            message: emailRegex.test(value) ? '' : 'Invalid email format'
        };
    }

    private validateDate(value: string): ValidationResult {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(value)) {
            return { isValid: false, message: 'Date must be in YYYY-MM-DD format' };
        }

        const date = new Date(value);
        const isValidDate = date instanceof Date && !isNaN(date.getTime());
        return {
            isValid: isValidDate,
            message: isValidDate ? '' : 'Invalid date value'
        };
    }

    private validateDuration(value: string): ValidationResult {
        const durationRegex = /^(\d+)(ms|s|m|h|d)$/;
        const match = durationRegex.exec(value);

        if (!match) {
            return {
                isValid: false,
                message: 'Duration must be a number followed by ms, s, m, h, or d (e.g., 30s, 5m, 2h)'
            };
        }

        const [, amount, unit] = match;
        const numericAmount = parseInt(amount, 10);

        if (numericAmount <= 0) {
            return { isValid: false, message: 'Duration must be positive' };
        }

        return { isValid: true, message: '' };
    }

    private validatePhone(value: string): ValidationResult {
        // International phone number format
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        return {
            isValid: phoneRegex.test(value.replace(/[\s\-\(\)]/g, '')),
            message: phoneRegex.test(value.replace(/[\s\-\(\)]/g, '')) ? '' : 'Invalid phone number format'
        };
    }
}

interface ValidationResult {
    isValid: boolean;
    message: string;
}

type TypeValidatorFunction = (value: string) => ValidationResult;
```

### 📋 **Phase 4: Schema Validation**

**File:** `packages/language/src/validation/schema-validator.ts`

```typescript
export class SchemaValidator {

    checkAttributeSchema(section: Section, accept: ValidationAcceptor): void {
        const sectionType = this.getSectionType(section);
        const schema = this.getSchemaForSectionType(sectionType);

        if (!schema) {
            accept('warning', `No schema found for section type: ${sectionType}`, {
                node: section,
                property: 'sectionType',
                code: 'no-schema'
            });
            return;
        }

        // Check for unknown attributes
        section.attributes?.forEach(attr => {
            const attrName = this.getAttributeName(attr);
            if (!schema.attributes[attrName]) {
                accept('error', `Unknown attribute '${attrName}' for section type '${sectionType}'`, {
                    node: attr,
                    property: 'key',
                    code: 'unknown-attribute'
                });
            }
        });

        // Check for required attributes
        Object.entries(schema.attributes).forEach(([attrName, attrSchema]) => {
            if (attrSchema.required) {
                const hasAttribute = section.attributes?.some(attr =>
                    this.getAttributeName(attr) === attrName
                );

                if (!hasAttribute) {
                    accept('error', `Required attribute '${attrName}' is missing`, {
                        node: section,
                        property: 'sectionName',
                        code: 'missing-required-attribute'
                    });
                }
            }
        });
    }

    checkAttributeValueType(attribute: Attribute, accept: ValidationAcceptor): void {
        const attrName = this.getAttributeName(attribute);
        const parentSection = this.getParentSection(attribute);
        const sectionType = this.getSectionType(parentSection);

        const schema = this.getSchemaForSectionType(sectionType);
        if (!schema?.attributes[attrName]) return;

        const expectedType = schema.attributes[attrName].type;
        const actualValue = attribute.value;

        if (!this.isValueOfType(actualValue, expectedType)) {
            accept('error', `Attribute '${attrName}' expects ${expectedType} but got ${this.getValueType(actualValue)}`, {
                node: attribute,
                property: 'value',
                code: 'type-mismatch'
            });
        }
    }

    private getSchemaForSectionType(sectionType: string): SectionSchema | undefined {
        const schemas: Record<string, SectionSchema> = {
            'agent': {
                attributes: {
                    'name': { type: 'string', required: true },
                    'description': { type: 'string', required: false },
                    'version': { type: 'string', required: false },
                    'enabled': { type: 'boolean', required: false },
                    'timeout': { type: 'duration', required: false },
                    'retries': { type: 'number', required: false }
                }
            },
            'message': {
                attributes: {
                    'text': { type: 'string', required: true },
                    'delay': { type: 'duration', required: false },
                    'priority': { type: 'number', required: false }
                }
            },
            'flow': {
                attributes: {
                    'name': { type: 'string', required: false },
                    'timeout': { type: 'duration', required: false }
                }
            }
        };

        return schemas[sectionType];
    }

    private isValueOfType(value: Value, expectedType: string): boolean {
        if (isLiteralValue(value)) {
            if (value.val_str && expectedType === 'string') return true;
            if (value.val_num && expectedType === 'number') return true;
            if (value.val_bool && expectedType === 'boolean') return true;
        }

        if (isTypeConversion(value)) {
            return value.type === expectedType;
        }

        return false;
    }
}

interface SectionSchema {
    attributes: Record<string, AttributeSchema>;
}

interface AttributeSchema {
    type: string;
    required: boolean;
    constraints?: string[];
    examples?: string[];
}
```

### 📋 **Phase 5: Embedded Code Validation**

**File:** `packages/language/src/validation/embedded-code-validator.ts`

```typescript
export class EmbeddedCodeValidator {

    checkEmbeddedCode(codeBlock: EmbeddedCodeBlock, accept: ValidationAcceptor): void {
        const language = this.getEmbeddedLanguage(codeBlock);
        const content = this.getCodeContent(codeBlock);

        if (language === 'javascript' || language === 'typescript') {
            this.validateJavaScriptTypeScript(codeBlock, content, language, accept);
        }
    }

    private validateJavaScriptTypeScript(
        codeBlock: EmbeddedCodeBlock,
        content: string,
        language: 'javascript' | 'typescript',
        accept: ValidationAcceptor
    ): void {
        try {
            // Basic syntax validation using a lightweight parser
            const syntaxErrors = this.checkJavaScriptSyntax(content);

            syntaxErrors.forEach(error => {
                accept('error', `${language} syntax error: ${error.message}`, {
                    node: codeBlock,
                    code: 'embedded-code-syntax-error'
                });
            });

            if (language === 'typescript') {
                const typeErrors = this.checkTypeScriptTypes(content);

                typeErrors.forEach(error => {
                    accept('error', `TypeScript type error: ${error.message}`, {
                        node: codeBlock,
                        code: 'embedded-code-type-error'
                    });
                });
            }

        } catch (error) {
            accept('error', `Failed to validate embedded ${language} code: ${error.message}`, {
                node: codeBlock,
                code: 'embedded-code-validation-error'
            });
        }
    }

    private checkJavaScriptSyntax(content: string): SyntaxError[] {
        // Simplified syntax checking - in practice, you might use:
        // - Acorn parser for JavaScript
        // - TypeScript compiler API for TypeScript
        // - ESLint for more sophisticated validation

        const errors: SyntaxError[] = [];

        try {
            // Basic bracket matching
            const brackets = this.extractBrackets(content);
            if (!this.isBalanced(brackets)) {
                errors.push(new SyntaxError('Unbalanced brackets'));
            }

            // Basic function syntax check
            if (content.includes('function') && !this.hasValidFunctionSyntax(content)) {
                errors.push(new SyntaxError('Invalid function syntax'));
            }

        } catch (error) {
            errors.push(error as SyntaxError);
        }

        return errors;
    }

    private checkTypeScriptTypes(content: string): TypeError[] {
        // This would integrate with TypeScript compiler API
        // For now, basic type annotation checking
        const errors: TypeError[] = [];

        // Check for basic type annotation syntax
        const typeAnnotationRegex = /:\s*([a-zA-Z][a-zA-Z0-9]*)/g;
        const matches = content.matchAll(typeAnnotationRegex);

        for (const match of matches) {
            const typeName = match[1];
            if (!this.isValidTypeScriptType(typeName)) {
                errors.push(new TypeError(`Unknown type: ${typeName}`));
            }
        }

        return errors;
    }

    private isValidTypeScriptType(typeName: string): boolean {
        const builtInTypes = [
            'string', 'number', 'boolean', 'object', 'undefined', 'null',
            'any', 'unknown', 'never', 'void', 'Array', 'Promise'
        ];

        return builtInTypes.includes(typeName);
    }
}

class SyntaxError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SyntaxError';
    }
}

class TypeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TypeError';
    }
}
```

---

## Service Registration

### 🛠️ **Update RclModule**

**File:** `packages/language/src/rcl-module.ts`

```typescript
import { RclValidator } from './validation/rcl-validator.js';
import { DependencyValidator } from './validation/dependency-validator.js';
import { TypeValidator } from './validation/type-validator.js';
import { SchemaValidator } from './validation/schema-validator.js';
import { EmbeddedCodeValidator } from './validation/embedded-code-validator.js';

export class RclValidationRegistry extends ValidationRegistry {
    constructor(services: RclServices) {
        super(services);

        const rclValidator = new RclValidator();
        const dependencyValidator = new DependencyValidator();
        const typeValidator = new TypeValidator();
        const schemaValidator = new SchemaValidator();
        const embeddedCodeValidator = new EmbeddedCodeValidator();

        // Register all validation checks
        rclValidator.registerChecks(this);
        dependencyValidator.registerChecks(this);
        typeValidator.registerChecks(this);
        schemaValidator.registerChecks(this);
        embeddedCodeValidator.registerChecks(this);
    }
}

export const RclModule: Module<RclServices, PartialLangiumServices & RclAddedServices> = {
    // ... existing services

    validation: {
        ValidationRegistry: (services) => new RclValidationRegistry(services),
    }
};
```

---

## Testing Strategy

### 🧪 **Validation Tests**

```typescript
describe('RclValidator', () => {
    test('should detect circular flow dependencies', async () => {
        const input = `
agent Test
    flow CircularFlow
        :start -> CheckUser
        CheckUser -> ValidateData
        ValidateData -> CheckUser
        CheckUser -> :end
        `;

        const diagnostics = await validateDocument(input);

        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0].message).toContain('Circular dependency detected');
        expect(diagnostics[0].code).toBe('circular-flow-dependency');
    });

    test('should validate type conversions', async () => {
        const input = `
agent Test
    email: <email>invalid-email</email>
    date: <date>2024-13-45</date>
    duration: <duration>invalid</duration>
        `;

        const diagnostics = await validateDocument(input);

        expect(diagnostics).toHaveLength(3);
        expect(diagnostics.map(d => d.message)).toEqual([
            expect.stringContaining('Invalid email'),
            expect.stringContaining('Invalid date'),
            expect.stringContaining('Invalid duration')
        ]);
    });

    test('should check required attributes', async () => {
        const input = `
agent Test
    # Missing required 'name' attribute
    description: "Test agent"
        `;

        const diagnostics = await validateDocument(input);

        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0].message).toContain("Required attribute 'name' is missing");
    });

    test('should validate embedded JavaScript syntax', async () => {
        const input = `
agent Test
    validation: $js> function test() { invalid syntax here
        `;

        const diagnostics = await validateDocument(input);

        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0].message).toContain('syntax error');
    });
});
```

---

## Success Criteria

### ✅ **Must Have**
1. **Dependency Loop Detection:** Detect and report circular dependencies in flow rules
2. **Type Validation:** Validate type conversions and literal values
3. **Schema Compliance:** Check attributes against section schemas
4. **Reference Validation:** Ensure all references point to existing elements
5. **Clear Error Messages:** Provide actionable error descriptions with codes

### 🎯 **Should Have**
1. **Embedded Code Validation:** Basic syntax checking for JavaScript/TypeScript
2. **Quick Fixes:** Suggest automatic fixes for common errors
3. **Warning vs Error Classification:** Appropriate severity levels
4. **Performance:** Fast validation for large files

### 🌟 **Nice to Have**
1. **Advanced Type Checking:** Full TypeScript integration for embedded code
2. **Custom Validation Rules:** User-defined validation rules
3. **Batch Validation:** Validate multiple files simultaneously
4. **Integration with External Tools:** ESLint, TypeScript compiler, etc.

---

## Timeline

- **Core Validation Infrastructure:** 3 days
- **Dependency Loop Detection:** 4 days
- **Type System Validation:** 3 days
- **Schema Validation:** 3 days
- **Embedded Code Validation:** 4 days
- **Testing & Integration:** 3 days

**Total: 20 days**