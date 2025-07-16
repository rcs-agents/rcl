# RCL Compiler Output Specification

## Overview

The RCL compiler transforms RCL files into two output formats: JSON and JavaScript/TypeScript modules. This document defines the expected structure and schema for these outputs.

## Output Formats

### 1. JSON Output (`-f json`)

The JSON output contains three main sections:

```json
{
  "agent": {
    "name": "AgentName",
    "displayName": "Agent Display Name",
    "rcsBusinessMessagingAgent": {
      "description": "Agent description",
      "logoUri": "https://example.com/logo.png",
      "color": "#RRGGBB",
      "phoneNumbers": [{
        "number": "+1234567890",
        "label": "Phone Label"
      }]
    }
  },
  "flows": {
    "FlowId": {
      "id": "FlowId",
      "initial": "MessageId",
      "states": {
        "MessageId": {
          "entry": {
            "type": "sendParent",
            "event": {
              "type": "DISPLAY_MESSAGE",
              "messageId": "MessageId"
            }
          },
          "on": {
            "postback_data_value": {
              "target": "NextMessageId",
              "actions": {
                "type": "xstate.assign",
                "assignment": {
                  "contextVar": "value"
                }
              }
            }
          }
        }
      },
      "context": {}
    }
  },
  "messages": {
    "MessageId": {
      "contentMessage": {
        "text": "Message content",
        "suggestions": [{
          "reply": {
            "text": "Suggestion Text",
            "postbackData": "postback_data_value"
          }
        }]
      },
      "messageTrafficType": "PROMOTION"
    }
  }
}
```

### 2. JavaScript Output (`-f js`)

The JavaScript output is an ES module with named exports:

```javascript
// Messages dictionary - Maps message IDs to normalized AgentMessage objects
export const messages = { /* ... */ };

// Flow configurations - XState machine definitions
export const flows = { /* ... */ };

// Agent configuration
export const agent = { /* ... */ };

// Utility functions
export function getMessage(messageId) { /* ... */ }
export function getFlow(flowId) { /* ... */ }
export function createMachine(flowId, options = {}) { /* ... */ }

// Default export
export default { messages, flows, agent, getMessage, getFlow, createMachine };
```

## Schema Compliance

### Messages
- Must conform to `@schemas/agent-message.schema.json`
- Required fields: `contentMessage`, `messageTrafficType`
- Text content limited to 2048 characters
- Suggestions limited to 11 items
- Suggestion text limited to 25 characters
- **postbackData Generation**: 
  - Generated from suggestion text using the expression in `defaults.postbackData`
  - Default pattern: lowercase text with non-alphanumeric replaced by underscore
  - Example: `"Order Coffee"` → `"order_coffee"`
  - Example: `"Small $3.50"` → `"small__3_50"`

### Agent Configuration
- Must conform to `@schemas/agent-config.schema.json`
- Required field: `displayName`
- Optional fields: `name`, `brandName`, `rcsBusinessMessagingAgent`

### Flows
- XState-compatible machine configurations
- Must have `id`, `initial`, and `states` properties
- State transitions follow XState format
- **Important**: Each message ID corresponds to a state in the flow
  - When a user receives a message, they are "on" that state
  - Message suggestions create transitions to other states (messages)
  - Transitions use the `postbackData` value as the event name
  - States should have `entry` actions that send `DISPLAY_MESSAGE` events:
    ```json
    "entry": {
      "type": "sendParent",
      "event": {
        "type": "DISPLAY_MESSAGE",
        "messageId": "MessageId"
      }
    }
    ```
  - Use `xstate.assign` actions to update context variables
  - Use `after` for automatic delayed transitions
  - Use `always` for immediate transitions without user input

## Current Implementation Status

### Working Examples
- **simple.rcl**: Basic text messages and flows
- **travel-agent.rcl**: Multi-message example with replies

### Complex Features (In Progress)
- **realistic.rcl**: Contains advanced features that require grammar improvements:
  - URLs with dots (travel.example.com)
  - Embedded JavaScript expressions ($js>)
  - Complex multi-line strings
  - Advanced type tags
  - Rich cards and carousels

## Testing

Test fixtures are located in `/apps/extension/test-fixtures/` with expected output files:
- `simple.rcl` + `simple-expected.json`
- `travel-agent.rcl` + `travel-agent-expected.json`

The extension test suite validates that compiler output matches expected JSON structures.

## Future Enhancements

1. **Grammar Improvements**: Support for complex URLs, embedded expressions
2. **Rich Content**: Full rich card and carousel support
3. **Type Tags**: Complete type tag validation and processing
4. **Interactive Diagrams**: Flow visualization with Sprotty integration