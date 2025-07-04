# Remaining Test Fixes Needed

## Overview
After implementing the specification-compliant grammar, 86 tests are failing primarily due to structural differences between the old and new grammar. The main issues are:

## Key Changes Required

### 1. AST Structure Changes
**OLD**: `result.ast.sections.find(s => s.sectionType === 'agent')`
**NEW**: `result.ast.agentDefinition`

### 2. Agent Definition Requirements  
**OLD**: `name: "Test"`
**NEW**: `displayName: "Test"` (required) + `brandName: "..."` (optional)

### 3. Complete Agent Structure Required
**OLD**: Could have incomplete agents
**NEW**: Must have all required sections:
```rcl
agent Agent Name:
  displayName: "Required Display Name"
  brandName: "Optional Brand Name"
  
  flow Flow Name:
    :start -> :end
    
  messages Messages:
    text "Hello World"
```

### 4. Message Format Changes
**OLD**: `messageName: text "content"`
**NEW**: `text "content"` (shortcut format)

### 5. Section Keywords Changes
**OLD**: `config:`, `defaults:`, `messages:`  
**NEW**: `agentConfig Config:`, `agentDefaults Defaults:`, `messages Messages:`

## Files Requiring Updates

### High Priority (Failing Tests)
1. `tests/grammar/comprehensive-parser.test.ts` ✅ MOSTLY FIXED
2. `tests/integration/discrepancy-validation.test.ts` ✅ PARTIALLY FIXED  
3. `tests/grammar/integration.test.ts` ✅ FIXED
4. `tests/grammar/rcl-custom-parser.test.ts`
5. `tests/grammar/embedded-code.test.ts`

### Medium Priority
6. `tests/error-handling/parser-errors.test.ts`
7. `tests/performance/language-performance.test.ts`
8. `tests/validation/semantic-validation.test.ts`

### Low Priority (LSP/Tooling)
9. `tests/lsp/completion.test.ts`
10. `tests/lsp/hover.test.ts`
11. `tests/lsp/linking.test.ts`

## Systematic Fix Pattern

For each test file:

1. **Update Agent Definitions**:
   ```diff
   - agent Test:
   -   name: "Test"
   + agent Test:
   +   displayName: "Test"
   +   
   +   flow Test Flow:
   +     :start -> :end
   +     
   +   messages Messages:
   +     text "Hello"
   ```

2. **Update AST Access**:
   ```diff
   - const agentSection = result.ast!.sections.find(s => s.sectionType === 'agent');
   - expect(agentSection!.name).toBe('Test');
   + const agent = result.ast!.agentDefinition!;
   + expect(agent.name).toBe('Test');
   + expect(agent.displayName).toBe('Test');
   ```

3. **Update Section Access**:
   ```diff
   - const flowSection = result.ast!.sections.find(s => s.sectionType === 'flow');
   + const flowSection = result.ast!.agentDefinition!.flowSections[0];
   ```

## Test Expectations to Update

- Flow rules: `flowSection.flowRules` → `flowSection.rules`
- Messages: `messagesSection.messages` → `messagesSection.shortcuts` (for shortcuts)
- Agent properties: Access via `agentDefinition.displayName`, etc.

## Grammar Benefits 

The new grammar correctly enforces the RCL specification:
✅ Required `displayName` field
✅ Proper section cardinality (at least 1 flow, exactly 1 messages)  
✅ Correct import syntax with space-separated paths
✅ Message shortcuts support
✅ Multi-line expressions use indentation (not braces)

## Next Steps

1. Run the grammar rebuild: `bun run build:lang`
2. Systematically update tests using the patterns above
3. Focus on high-priority failing tests first
4. The grammar changes are specification-compliant and should be maintained