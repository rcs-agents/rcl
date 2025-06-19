# RCL tmLanguage Comprehensive Syntax Highlighting Plan

## ARCHITECTURE CORRECTION

### ❌ Current Problematic Setup
- **Base Generation**: Langium auto-generates `packages/language/syntaxes/rcl.tmLanguage.json`
- **Extension Copy**: Build process copies to `packages/extension/syntaxes/rcl.tmLanguage.json`
- **Runtime Extension**: `esbuild.mjs` extends the copied grammar in the **extension** package

**Problems:**
1. Two different tmLanguage files (basic vs enhanced)
2. Enhancement logic trapped in VSCode extension
3. Other IDE extensions can't access enhanced grammar
4. Language package isn't the source of truth

### ✅ Corrected Architecture
**Single Source of Truth in Language Package:**
1. **Langium generates** base tmLanguage in `packages/language/syntaxes/rcl.base.tmLanguage.json`
2. **Language package** enhances it with embedded languages → `packages/language/syntaxes/rcl.tmLanguage.json`
3. **Extension package** simply copies the final enhanced version
4. **Other IDE extensions** can use the complete tmLanguage from language package

## Current State Analysis

### Existing tmLanguage Setup (Needs Refactoring)
- **Base Generation**: Langium auto-generates basic grammar
- **Enhancement Logic**: Currently in extension/esbuild.mjs (❌ Wrong location)
- **Embedded Support**: Already supports JavaScript (`$js>`), TypeScript (`$ts>`), and generic (`$>`) expressions (✅ Working well)

### Current Limitations
- Monolithic tmLanguage file (auto-generated)
- Basic keyword highlighting only
- Limited semantic context awareness
- No syntax-aware scoping for different RCL constructs
- Missing theme-friendly scope naming conventions
- **Architecture flaw**: Enhancement logic in wrong package

## Comprehensive Plan: IDE-Agnostic tmLanguage Architecture

### Phase 0: Architecture Correction (HIGH PRIORITY)

#### 0.1 Restructure Build Process
**New Language Package Structure:**
```
packages/language/
├── syntaxes/
│   ├── rcl.base.tmLanguage.json     # Langium auto-generated base
│   ├── rcl.tmLanguage.json          # Final enhanced grammar (source of truth)
│   ├── core/                        # Modular components
│   │   ├── comments.tmLanguage.json
│   │   ├── keywords.tmLanguage.json
│   │   └── identifiers.tmLanguage.json
│   ├── embedded/
│   │   ├── expressions.tmLanguage.json
│   │   └── javascript.injection.tmLanguage.json
│   └── build/
│       └── enhance-tmlanguage.ts    # Enhancement script (moved from extension)
├── scripts/
│   └── build-tmlanguage.ts          # Main build orchestrator
└── package.json                     # Add tmLanguage build scripts
```

#### 0.2 Move Enhancement Logic to Language Package
**Transfer from `packages/extension/esbuild.mjs` to `packages/language/scripts/build-tmlanguage.ts`:**

```typescript
// packages/language/scripts/build-tmlanguage.ts
import * as fs from 'node:fs';
import * as path from 'node:path';

export function enhanceTmLanguage(): void {
  const baseGrammarPath = path.join(__dirname, '../syntaxes/rcl.base.tmLanguage.json');
  const enhancedGrammarPath = path.join(__dirname, '../syntaxes/rcl.tmLanguage.json');

  if (!fs.existsSync(baseGrammarPath)) {
    throw new Error('Base tmLanguage not found. Run Langium generation first.');
  }

  const baseGrammar = JSON.parse(fs.readFileSync(baseGrammarPath, 'utf-8'));

  // Add embedded language patterns (moved from esbuild.mjs)
  const enhancedGrammar = addEmbeddedLanguageSupport(baseGrammar);

  // Add semantic modules
  const finalGrammar = addSemanticModules(enhancedGrammar);

  fs.writeFileSync(enhancedGrammarPath, JSON.stringify(finalGrammar, null, 2));
  console.log('✅ Enhanced tmLanguage generated at', enhancedGrammarPath);
}

function addEmbeddedLanguageSupport(grammar: any): any {
  // Move existing embedded language logic from esbuild.mjs here
  // ... (existing embedded language patterns)
  return grammar;
}
```

#### 0.3 Update Langium Config
```json
// packages/language/langium-config.json
{
  "projectName": "Rcl",
  "languages": [{
    "id": "rcl",
    "grammar": "src/rcl.langium",
    "fileExtensions": ["rcl"],
    "textMate": {
      "out": "syntaxes/rcl.base.tmLanguage.json"  // Generate base, not final
    }
  }]
}
```

#### 0.4 Update Language Package Scripts
```json
// packages/language/package.json
{
  "scripts": {
    "langium:generate": "langium generate",
    "build:tmlanguage": "bun run scripts/build-tmlanguage.ts",
    "build": "tsc -b tsconfig.src.json && bun run build:tmlanguage",
    "langium:watch": "langium generate --watch",
    "watch": "concurrently \"bun run langium:watch\" \"chokidar 'syntaxes/rcl.base.tmLanguage.json' -c 'bun run build:tmlanguage'\""
  }
}
```

#### 0.5 Simplify Extension Package
```json
// packages/extension/package.json
{
  "scripts": {
    "build:prepare": "shx mkdir -p ./syntaxes/ && shx cp -f ../language/syntaxes/rcl.tmLanguage.json ./syntaxes/rcl.tmLanguage.json",
    "build": "bun run build:prepare && tsc -b tsconfig.json && node esbuild.mjs"
  }
}
```

**Remove tmLanguage logic from `packages/extension/esbuild.mjs`** - it just does bundling now.

### Phase 1: Semantic Modularization

#### 1.1 Create Base Grammar Structure (In Language Package)
```
packages/language/syntaxes/
├── rcl.base.tmLanguage.json         # Langium auto-generated
├── rcl.tmLanguage.json              # Final enhanced grammar (THE source of truth)
├── core/
│   ├── comments.tmLanguage.json     # Comment patterns
│   ├── keywords.tmLanguage.json     # Language keywords
│   ├── identifiers.tmLanguage.json  # Identifiers and names
│   └── punctuation.tmLanguage.json  # Operators, delimiters
├── sections/
│   ├── agent-sections.tmLanguage.json     # Agent, Config, Defaults sections
│   ├── message-sections.tmLanguage.json   # Message-related sections
│   └── flow-sections.tmLanguage.json      # Flow control sections
├── data-types/
│   ├── primitives.tmLanguage.json   # Strings, numbers, booleans, null
│   ├── collections.tmLanguage.json  # Lists, maps, arrays
│   └── references.tmLanguage.json   # References and imports
├── embedded/
│   ├── expressions.tmLanguage.json  # Expression syntax ($js>, $ts>, $>)
│   └── multiline-strings.tmLanguage.json # Multi-line string patterns
└── injections/
    ├── javascript.injection.tmLanguage.json
    ├── typescript.injection.tmLanguage.json
    └── generic.injection.tmLanguage.json
```

#### 1.2 IDE Extension Consumption
**VSCode Extension:**
```json
// packages/extension/package.json
{
  "contributes": {
    "grammars": [{
      "language": "rcl",
      "scopeName": "source.rcl",
      "path": "syntaxes/rcl.tmLanguage.json"  // Final enhanced grammar
    }]
  }
}
```

**Other IDE Extensions (Sublime, Atom, etc.):**
```javascript
// They can directly consume from the language package
import rclGrammar from 'rcl-language/syntaxes/rcl.tmLanguage.json';
```

### Phase 2: Enhanced Embedded Language Support (Keep Existing Logic)

#### 2.1 Current Support (✅ Working - Just Move Location)
- Single-line: `$js> code`, `$ts> code`, `$> code`
- Multi-line: `$js>>>`, `$ts>>>`, `$>>>`

**Action**: Move existing logic from `esbuild.mjs` to `build-tmlanguage.ts`

### Phase 3: Advanced Syntax Features

#### 3.1 Contextual Highlighting
**Section-Aware Scoping:**
- Different attribute highlighting based on section type
- Valid attribute name suggestions per section
- Section-specific keyword highlighting

**Data Type Validation Scoping:**
- Type-aware value highlighting
- Invalid value detection
- Reference resolution highlighting

#### 3.2 Flow Control Highlighting
**Flow Patterns:**
```json
{
  "name": "meta.flow.rule.rcl",
  "begin": "\\b(if|when|unless|match)\\b",
  "beginCaptures": {
    "1": { "name": "keyword.control.flow.rcl" }
  },
  "end": "\\b(then|do|end)\\b",
  "endCaptures": {
    "1": { "name": "keyword.control.flow.rcl" }
  },
  "patterns": [
    { "include": "#expressions" },
    { "include": "#embedded-code" }
  ]
}
```

#### 3.3 Multi-line String Enhancement
**String Type Patterns:**
- `|` - Trim common leading, one newline at end
- `|-` - Trim common leading, no trailing newline
- `+|` - Preserve leading, one newline at end
- `+|+` - Preserve all whitespace/newlines

```json
{
  "name": "string.quoted.multiline.trim.rcl",
  "begin": "\\|\\s*$",
  "end": "^(?=\\S)",
  "beginCaptures": {
    "0": { "name": "punctuation.definition.string.multiline.begin.rcl" }
  },
  "patterns": [
    {
      "name": "string.quoted.multiline.content.rcl",
      "match": ".*"
    }
  ]
}
```

### Phase 4: Build System Integration

#### 4.1 Enhanced Build Process
**New Build Steps:**
1. **Base Grammar Generation**: Langium generates base structure
2. **Modular Assembly**: Combine semantic modules into main grammar
3. **Embedded Enhancement**: Add embedded language support
4. **Validation**: Validate grammar syntax and scope coverage
5. **Theme Testing**: Test against popular themes

#### 4.2 Grammar Assembly Script
```typescript
// buildTmLanguage.ts
interface GrammarModule {
  path: string;
  include: string;
  priority: number;
}

const modules: GrammarModule[] = [
  { path: './core/comments.tmLanguage.json', include: '#comments', priority: 1 },
  { path: './core/keywords.tmLanguage.json', include: '#keywords', priority: 2 },
  { path: './sections/agent-sections.tmLanguage.json', include: '#agent-sections', priority: 3 },
  // ... more modules
];

function assembleGrammar(baseGrammar: any, modules: GrammarModule[]): any {
  // Combine base Langium grammar with semantic modules
  // Preserve embedded language enhancements
  // Add proper includes and repository entries
}
```

#### 4.3 Updated esbuild.mjs
**Enhanced Extension Logic:**
- Keep existing embedded code patterns
- Add semantic module loading
- Preserve runtime grammar assembly
- Add development-time validation

### Phase 5: Testing and Validation

#### 5.1 Grammar Testing Suite
**Test Cases:**
- All RCL language constructs
- Embedded expression patterns
- Complex nesting scenarios
- Edge cases and error conditions
- Theme compatibility tests

#### 5.2 Example Test Files
```rcl
# test-syntax-highlighting.rcl
agent Test Agent
  # Comments should be highlighted properly

  Config
    # Different attribute types
    simpleValue: "string"
    numericValue: 42
    booleanValue: True
    nullValue: Null

    # Embedded expressions
    dynamicValue: $js> new Date().toISOString()
    complexExpression: $ts>
      const result = calculateValue();
      return result.toString();

    # Multi-line strings
    multiLineContent: |
      This is a multi-line string
      with proper indentation
      and syntax highlighting

  Messages
    message Welcome Message
      text: "Welcome to our service!"

      suggestion
        action text: "Get Started", postbackData: "start" do
          openUrlAction url: $js> generateWelcomeUrl()
        end
```

#### 5.3 Theme Compatibility Matrix
Test against popular themes:
- Dark+ (default)
- Light+ (default)
- Monokai
- Solarized Dark/Light
- Material Theme variants
- Custom themes

### Phase 6: Documentation and Examples

#### 6.1 Developer Documentation
- **Grammar Architecture**: How the modular system works
- **Scope Reference**: Complete scope naming reference
- **Theme Integration**: Guidelines for theme authors
- **Extension Guide**: How to add new language constructs

#### 6.2 Example Configurations
**VS Code Settings:**
```json
{
  "editor.tokenColorCustomizations": {
    "textMateRules": [
      {
        "scope": "entity.name.section.rcl",
        "settings": {
          "foreground": "#569CD6",
          "fontStyle": "bold"
        }
      },
      {
        "scope": "meta.embedded.inline.javascript.rcl",
        "settings": {
          "background": "#1E1E1E"
        }
      }
    ]
  }
}
```

## Implementation Priority (Updated)

### ✅ COMPLETED (Combined Implementation)
**Phase 0 + 1 + 2** - Architecture Correction, Modular Structure & Embedded Languages
1. ✅ **Architecture Fixed** - tmLanguage enhancement moved to language package
2. ✅ **Embedded Languages Preserved** - All `$js>`, `$ts>`, `$>` patterns working
3. ✅ **Modular Grammar Structure** - Split into 9 semantic components
4. ✅ **Build System Enhanced** - Automated assembly process in language package

**Phase 3** - Advanced Syntax Features
1. ✅ **Contextual Highlighting** - Section-aware scoping implemented
2. ✅ **Advanced Flow Control** - Enhanced flow syntax highlighting
3. ✅ **Multi-line String Enhancement** - 5 string pattern types implemented

### High Priority (Phase 4-5)
1. **Build System Integration** - Enhanced validation and testing
2. **Testing Infrastructure** - Automated testing suite

### Medium Priority (Phase 6)
1. **Documentation** - Comprehensive guides and examples
2. **Theme Compatibility** - Extensive theme testing

### Low Priority (Phase 5-6)
1. **Theme Compatibility** - Extensive theme testing
2. **Documentation** - Comprehensive guides and examples
3. **Advanced Features** - Cutting-edge highlighting features

## Benefits of Corrected Architecture

### ✅ For Language Package
- **Single Source of Truth**: Complete, enhanced tmLanguage in one place
- **IDE Agnostic**: Any editor supporting TextMate can use it
- **Maintainability**: All grammar logic in one package
- **Reusability**: Other projects can depend on rcl-language for syntax highlighting

### ✅ For Extension Packages
- **Simplicity**: Just copy final grammar, no complex logic
- **Consistency**: All extensions use same enhanced grammar
- **Focus**: Extensions focus on IDE-specific features, not grammar

### ✅ For Users
- **Consistency**: Same highlighting across all IDEs
- **Quality**: Enhanced features available everywhere
- **Future-Proof**: New IDE support is easy to add

## Migration Steps

### Step 1: Move Enhancement Logic
1. Create `packages/language/scripts/build-tmlanguage.ts`
2. Move embedded language logic from `esbuild.mjs`
3. Update Langium config to generate `.base.tmLanguage.json`
4. Test that enhancement still works

### Step 2: Update Build Process
1. Add tmLanguage build scripts to language package
2. Simplify extension build process
3. Update workspace build orchestration
4. Test full build flow

### Step 3: Add Modular Support
1. Create modular tmLanguage components
2. Enhance build script to assemble modules
3. Improve semantic scoping
4. Test highlighting quality

---

**Next Steps**:
1. **IMMEDIATE**: Fix architecture by moving enhancement logic to language package
2. Preserve existing embedded language functionality
3. Update build processes and scripts
4. Test cross-IDE compatibility