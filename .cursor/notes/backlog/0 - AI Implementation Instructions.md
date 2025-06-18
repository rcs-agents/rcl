# AI Implementation Instructions for RCL Language Server

## 📋 Overview

You are tasked with implementing the RCL Language Server features according to the numbered plans in this backlog folder. These instructions provide guidelines for systematic, reliable implementation.

---

## 🏗️ Project Structure & Build System

### **Monorepo Structure**
```
rcl/
├── package.json                    # Root workspace with scripts
├── packages/
│   ├── language/                   # Langium language server
│   │   ├── package.json           # Language package scripts
│   │   └── src/                    # Grammar, validators, services
│   ├── cli/                        # CLI tools
│   │   └── package.json           # CLI package scripts
│   └── extension/                  # VSCode extension
│       ├── package.json           # Extension package scripts
│       └── src/                    # Extension implementation
└── .cursor/notes/backlog/          # Implementation plans (this folder)
```

### **Key NPM Scripts**

#### **Root Package (package.json)**
- `bun run build` - Build all packages in dependency order
- `bun run build:clean` - Clean and rebuild everything
- `bun run dev` - Watch mode for language + extension development
- `bun run langium:generate` - Generate Langium grammar artifacts
- `bun run langium:watch` - Watch mode for grammar generation
- `bun run test` - Run language tests
- `bun run reinstall` - Generate grammar + reinstall extension

#### **Language Package (packages/language/package.json)**
- `bun run build` - Compile TypeScript to JavaScript
- `bun run langium:generate` - Generate AST, module, grammar files
- `bun run langium:watch` - Watch grammar changes and regenerate
- `bun run test` - Run vitest unit tests

#### **Extension Package (packages/extension/package.json)**
- `bun run build` - Build extension for VSCode
- `bun run watch` - Watch mode for extension development
- `bun run reinstall-extension` - Package and install extension in VSCode

#### **CLI Package (packages/cli/package.json)**
- `bun run build` - Compile TypeScript for CLI
- `bun run cli` - Run the CLI tool

---

## 🔧 Implementation Guidelines

### **1. Use Bun for All Package Management**
- ✅ **DO:** `bun add langium@^3.5.0` to add dependencies
- ❌ **DON'T:** Manually edit package.json and run `bun install`
- **Reason:** Bun handles lockfile updates and version resolution automatically

### **2. Use `command` Prefix for Shell Built-ins**
- ✅ **DO:** `command ls -la | command cat`
- ✅ **DO:** `command git status | command cat`
- ✅ **DO:** `command tail -n 20 file.log | command cat`
- ❌ **DON'T:** `ls -la` (may use aliased versions)
- **Reason:** Prevents issues with shell aliases and ensures consistent behavior

### **3. Always Pipe Output Through `command cat`**
- ✅ **DO:** `bun run build | command cat`
- ✅ **DO:** `command git diff | command cat`
- **Reason:** Ensures complete output is displayed in terminal results

### **4. Systematic Implementation Process**

#### **For Each Plan:**
1. **Read the plan completely** - Understand objectives and success criteria
2. **Identify checkpoints** - Plan where to test builds/functionality
3. **Implement incrementally** - Small commits, frequent testing
4. **Test at checkpoints** - Run `bun run build` and verify functionality
5. **Ask for decisions** - Don't fill medium/large gaps in plans autonomously

#### **Build Testing Schedule:**
- **After grammar changes:** `bun run langium:generate && bun run build`
- **After service additions:** `bun run build && bun run test`
- **After major changes:** `bun run build:clean` (full rebuild)
- **Before completion:** `bun run reinstall` (test full integration)

### **5. Decision-Making Boundaries**

#### **✅ Small Decisions (OK to make autonomously):**
- Variable/function naming that follows existing patterns
- Import statement organization
- Minor code style consistency fixes
- Error message wording improvements
- Choosing between equivalent implementation approaches

#### **❌ Medium/Large Decisions (ASK USER):**
- Architecture changes not specified in plans
- Adding new dependencies not mentioned in plans
- Changing existing API contracts or interfaces
- Performance optimization strategies
- Alternative implementation approaches that significantly deviate from plans
- Error handling strategies not specified
- Configuration file structures

### **6. Git Commit Strategy**

#### **During Implementation:**
- **Frequent small commits** after each logical step
- **Semantic commit messages** following conventional commits:
  ```
  feat(language): add RclCustomTokenBuilder for multi-mode lexing
  fix(grammar): resolve boolean keyword conflicts with PROPER_WORD
  refactor(services): extract completion context analysis logic
  test(validation): add tests for section type validation
  docs(plan): update implementation status in grammar plan
  ```

#### **Final Commit (when plan is complete):**
```bash
command git add -A
command git commit -m "feat(language): implement [PLAN_NAME]

Complete implementation of [plan objective]:

### Changes Made:
- [List major changes]
- [List new features added]
- [List bugs fixed]

### Files Modified:
- [List key files changed]

### Testing:
- [List tests run]
- [List functionality verified]

Resolves: [plan name and number]
"
```

---

## 📚 Key Technical Context

### **Existing Infrastructure (DO NOT REPLACE)**
The project already has sophisticated, well-implemented:
- **Completion Provider** (`RclCompletionProvider`) - Context-aware autocompletion
- **Validation System** (`RclValidator`, `SectionValidator`) - Schema-based validation
- **Section Registry** (`SectionTypeRegistry`) - Section type constants and metadata
- **Service Architecture** - Proper Langium dependency injection setup
- **Build Pipeline** - Grammar generation and extension packaging

### **Grammar System Understanding**
- **Langium-based** - Grammar files in `src/grammar/` subdirectories
- **AST generation** - `bun run langium:generate` creates TypeScript AST types
- **Indentation-aware** - Already uses `IndentationAwareTokenBuilder`
- **Extension integration** - Auto-generates TextMate grammar

### **Import Strategy**
- **Use node: prefix** for Node.js built-ins: `import * as fs from 'node:fs'`
- **ESM modules** - All packages use `"type": "module"`
- **File extensions** - Use `.js` extensions in imports (TypeScript compilation)

---

## 🚀 Implementation Workflow

### **Before Starting Any Plan:**
1. **Read plan thoroughly** - Understand goals, approach, timeline
2. **Check current state** - Run `bun run build` to ensure clean starting point
3. **Review existing code** - Understand what's already implemented
4. **Plan checkpoints** - Identify where to test during implementation

### **During Implementation:**
1. **Work incrementally** - Implement one feature/component at a time
2. **Test frequently** - Run builds and tests at logical breakpoints
3. **Commit regularly** - Small, focused commits with clear messages
4. **Ask when uncertain** - Don't guess on medium/large design decisions

### **Checkpoint Testing Commands:**
```bash
# Basic build test
bun run build | command cat

# Full clean rebuild
bun run build:clean | command cat

# Language tests
bun run test | command cat

# Grammar regeneration + full test
bun run langium:generate && bun run build | command cat

# Full integration test
bun run reinstall | command cat
```

### **When Complete:**
1. **Final build test** - `bun run build:clean`
2. **Final functionality test** - `bun run reinstall`
3. **Comprehensive commit** - Detailed commit message with full change summary
4. **Update plan status** - Mark plan as completed with implementation notes

---

## ⚠️ Common Pitfalls to Avoid

1. **Don't modify IndentationAwareTokenBuilder directly** - Extend it instead
2. **Don't replace existing services** - Enhance or add to them
3. **Don't skip Langium generation** - Always run `langium:generate` after grammar changes
4. **Don't assume build success** - Always verify with `bun run build`
5. **Don't make large architectural decisions** - Ask the user first
6. **Don't forget file extensions** - Use `.js` in TypeScript imports
7. **Don't modify dependencies manually** - Use `bun add/remove`

---

## 🎯 Success Criteria for Each Plan

Every completed plan should result in:
- ✅ **Clean build** - `bun run build` succeeds without errors
- ✅ **Passing tests** - `bun run test` succeeds (if tests exist)
- ✅ **Extension installs** - `bun run reinstall` works without errors
- ✅ **Functionality works** - Features described in plan are demonstrable
- ✅ **Git history** - Clear, semantic commit messages documenting changes
- ✅ **Plan updated** - Implementation notes added to plan document

---

## 📞 When to Ask the User

**ALWAYS ask before:**
- Making architecture changes not specified in plans
- Adding dependencies not mentioned in plans
- Changing existing APIs or contracts
- Implementing alternative approaches that deviate significantly from plans
- Making decisions that affect multiple packages
- Encountering unexpected technical obstacles

**Example questions:**
- "The plan suggests approach X, but I see that existing code uses pattern Y. Should I follow the existing pattern or implement as specified?"
- "I need to add dependency Z for feature X. The plan doesn't specify this. Should I proceed?"
- "I encountered issue X that's not covered in the plan. How would you like me to handle this?"

Remember: **It's better to ask and get guidance than to make assumptions that require rework later.**