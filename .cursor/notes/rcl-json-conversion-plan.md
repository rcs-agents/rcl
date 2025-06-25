# RCL to JSON Conversion Plan

## Overview
Convert RCL files to JSON with three main sections:
- `agent`: Agent configuration matching agent-config.schema.json
- `flows`: XState configurations for flow rules
- `messages`: Message definitions matching agent-message.schema.json

## Analysis of Current Structure

### RCL AST Structure (from ast.ts)
- `RclFile`: Root with `imports` and `agentSection`
- `Section`: Has `sectionType`, `sectionName`, `attributes`, `subSections`, `flowContent`
- `Attribute`: Has `key` and `value`
- `FlowRule`: Has `source` and `target` (FlowOperand)
- `LiteralValue`: Various value types (string, number, boolean, atom, null)

### Target JSON Structure
```json
{
  "agent": { /* agent-config.schema.json compliant */ },
  "flows": { 
    "flowId": { /* XState configuration */ }
  },
  "messages": {
    "messageId": { /* agent-message.schema.json compliant */ }
  }
}
```

## Implementation Plan

### 1. Create JSON Conversion Services

#### 1.1 Agent Configuration Converter
- Extract agent section attributes
- Map to agent-config.schema.json structure
- Handle nested Config section attributes
- Convert RCL values to JSON types

#### 1.2 Flow Converter 
- Extract flow sections and rules
- Convert flow rules to XState configuration
- Handle flow operands (symbols, variables, attributes, strings)
- Create state transitions with placeholders for actions

#### 1.3 Message Converter
- Extract message sections from Messages subsection
- Map message attributes to agent-message.schema.json
- Handle different message types (authentication, transaction, etc.)
- Convert suggestions, rich cards, etc.

### 2. Update CLI Generator

#### 2.1 Add JSON Generation Method
- Create `generateJson()` method in generator.ts
- Use the new conversion services
- Output formatted JSON

#### 2.2 Update CLI Commands
- Modify existing generate command or add new json command
- Add JSON output option

### 3. Value Conversion Utilities

#### 3.1 RCL Value to JSON Converter
- Handle LiteralValue types
- Convert atoms (`:ATOM`) to strings
- Handle type conversions
- Process embedded expressions (placeholders)

#### 3.2 Schema Mapping Utilities
- Map RCL attribute names to schema property names
- Handle required vs optional properties
- Apply default values where needed

## Implementation Steps

### Phase 1: Core Services
1. Create `RclToJsonConverter` service
2. Implement `AgentConfigConverter`
3. Implement `MessageConverter` 
4. Implement `FlowConverter`

### Phase 2: Value Processing
1. Create `ValueConverter` utility
2. Handle all RCL value types
3. Implement schema property mapping

### Phase 3: CLI Integration
1. Update generator.ts with JSON output
2. Add CLI command/option
3. Test with example.rcl

### Phase 4: Testing & Validation
1. Test against provided schemas
2. Validate XState configurations
3. Handle edge cases and errors

## Key Challenges

### 1. Flow Rule to XState Conversion
- Map RCL flow syntax to XState states/transitions
- Handle conditional flow rules (`when` clauses)
- Create appropriate state machine structure

### 2. Message Type Detection
- Determine message traffic type from section type
- Map RCL message syntax to schema structure
- Handle shortcuts vs full syntax

### 3. Value Type Conversion
- Convert RCL atoms to appropriate JSON types
- Handle embedded expressions as placeholders
- Preserve type information for validation

## File Structure
```
packages/language/src/
├── services/
│   ├── json-conversion/
│   │   ├── rcl-to-json-converter.ts
│   │   ├── agent-config-converter.ts
│   │   ├── message-converter.ts
│   │   ├── flow-converter.ts
│   │   └── value-converter.ts
│   └── ...
└── ...
```

## Implementation Status

### ✅ Completed
1. ✅ Created ValueConverter service - handles RCL value to JSON conversion
2. ✅ Created RclToJsonConverter - main orchestrator service
3. ✅ Created AgentConfigConverter - converts agent sections to agent-config.schema.json format
4. ✅ Created FlowConverter - converts flow sections to XState configurations  
5. ✅ Created MessageConverter - converts message sections to agent-message.schema.json format
6. ✅ Updated CLI generator to use new JSON conversion services
7. ✅ Added JSON export to language package index
8. ✅ Added new CLI command `json` for generating JSON output

### 📝 Usage
```bash
# Generate JSON from RCL file
bun run packages/cli/bin/cli.js json examples/example.rcl

# Generate JSON to specific directory
bun run packages/cli/bin/cli.js json examples/example.rcl -d ./output
```

### 🔄 Next Steps for Testing
1. Test with example.rcl file
2. Validate output against schemas
3. Handle edge cases and errors
4. Add unit tests for conversion services 