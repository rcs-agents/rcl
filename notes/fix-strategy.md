# Test Fix Strategy

## Key Information:
- Skip TextMate scope issues until the very end (syntax files are outdated)
- Grammar folder will be deleted (not using Langium grammar anymore, using custom AST/lexer/parser)
- Focus on core parser/lexer functionality first
- User is sleeping, no questions needed

## Priority Order:
1. Fix missing module imports
2. Fix agent definition property issues (agentDefinition vs agentSection)
3. Fix import statement parsing (namespace paths with spaces)
4. Fix embedded code parsing
5. Fix type tag parsing
6. TextMate scope issues (LAST)

## Current Status:
- Working on missing module imports in integration tests
- Need to update test expectations to match actual AST structure