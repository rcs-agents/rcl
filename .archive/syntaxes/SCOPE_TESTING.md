# RCL Scope Testing & Inspection Guide

## 🔍 Overview

This guide explains how to test and inspect TextMate grammar scopes in RCL language files. Scope inspection is crucial for ensuring our syntax highlighting works correctly across different editors and themes.

## 🛠️ Available Tools

### 1. Programmatic Scope Inspector
**Location**: `packages/language/scripts/test-scope-inspector.ts`
**Purpose**: Programmatically analyze what scopes are applied to RCL code

### 2. VSCode Built-in Inspector
**Command**: `Developer: Inspect Editor Tokens and Scopes`
**Purpose**: Interactive scope inspection within VSCode

## 📋 Quick Start

### Run Comprehensive Tests
```bash
cd packages/language
bun run test:scopes
```

### Inspect Specific Code
```bash
# Inspect a code snippet
bun run inspect:scopes "agent Test Agent"

# Inspect an entire file  
bun run inspect:file ../../examples/example.rcl
```

### Build and Test tmLanguage
```bash
# Build enhanced grammar
bun run build:tmlanguage

# Test build process
bun run test:tmlanguage

# Test scopes
bun run test:scopes
```

## 🧪 Test Cases

The scope inspector includes pre-defined test cases for common RCL patterns:

### 1. Agent Section Declaration
```rcl
agent Test Agent
```
**Expected Scopes**:
- `agent` → `keyword.other.agent.rcl`
- `Test Agent` → `entity.name.section.agent.rcl`

### 2. Config Section with Boolean
```rcl
Config
  enabled: True
```
**Expected Scopes**:
- `Config` → `keyword.other.config.rcl`
- `enabled` → `variable.other.attribute.rcl`
- `True` → `constant.language.boolean.true.rcl`

### 3. JavaScript Embedded Expression
```rcl
value: $js> new Date().toISOString()
```
**Expected Scopes**:
- `value` → `variable.other.attribute.rcl`
- `$js>` → `keyword.control.embedded.marker.js.rcl`
- `new Date().toISOString()` → `source.js`

### 4. Multi-line String
```rcl
description: |
  This is a multi-line
  string with proper
  indentation
```
**Expected Scopes**:
- `description` → `variable.other.attribute.rcl`
- `|` → `punctuation.definition.string.multiline.begin.rcl`

## 🔬 Using VSCode Scope Inspector

### Step 1: Open an RCL File
1. Open any `.rcl` file in VSCode
2. Position cursor on text you want to inspect

### Step 2: Run Inspector Command
1. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Type: `Developer: Inspect Editor Tokens and Scopes`
3. Press Enter

### Step 3: Analyze Results
The inspector shows:
- **textmate scopes**: All TextMate scopes applied at cursor position
- **language**: Language identifier
- **token**: Current token information

### Example Output
```
textmate scopes:
  source.rcl
  keyword.other.agent.rcl

language: rcl

token:
  range: [0, 5]
  text: "agent"
```

## 📊 Scope Naming Conventions

### Standard TextMate Scopes
We follow TextMate conventions for consistency across editors:

#### Keywords
- `keyword.other.agent.rcl` - Agent section keyword
- `keyword.other.config.rcl` - Config section keyword  
- `keyword.control.flow.rcl` - Flow control keywords
- `keyword.control.embedded.marker.js.rcl` - Embedded JS markers

#### Entities
- `entity.name.section.agent.rcl` - Agent names
- `entity.name.section.message.rcl` - Message names
- `entity.name.attribute.rcl` - Attribute names

#### Variables  
- `variable.other.attribute.rcl` - Attribute names
- `variable.parameter.rcl` - Parameter references

#### Constants
- `constant.language.boolean.true.rcl` - Boolean true
- `constant.language.boolean.false.rcl` - Boolean false
- `constant.language.null.rcl` - Null values
- `constant.numeric.rcl` - Numbers

#### Strings
- `string.quoted.double.rcl` - Double-quoted strings
- `string.quoted.multiline.rcl` - Multi-line strings
- `string.quoted.multiline.content.rcl` - Multi-line content

#### Punctuation
- `punctuation.definition.string.begin.rcl` - String delimiters
- `punctuation.separator.colon.rcl` - Attribute colons
- `punctuation.separator.comma.rcl` - List separators

#### Embedded Languages
- `meta.embedded.inline.javascript.rcl` - Inline JS expressions
- `meta.embedded.block.typescript.rcl` - Multi-line TS blocks
- `source.js` - JavaScript code content
- `source.ts` - TypeScript code content

## 🐛 Debugging Scope Issues

### Common Problems & Solutions

#### 1. Missing Scopes
**Problem**: Expected scopes not appearing
**Solutions**:
- Check if grammar was rebuilt: `bun run build:tmlanguage`
- Verify pattern is in modular components
- Test with simple case first

#### 2. Wrong Scope Applied
**Problem**: Incorrect scope on token
**Solutions**:
- Check pattern priority in `GRAMMAR_MODULES`
- Verify regex patterns in component files
- Test pattern in isolation

#### 3. Embedded Languages Not Working
**Problem**: JavaScript/TypeScript not highlighted
**Solutions**:
- Ensure VSCode has JS/TS extensions installed
- Check embedded pattern `contentName` is correct
- Verify `source.js`/`source.ts` scope is applied

#### 4. Multi-line Patterns Broken
**Problem**: Multi-line strings/code not highlighted
**Solutions**:
- Check `begin`/`end` patterns handle indentation
- Verify rule stack continuity
- Test with various indentation levels

### Debugging Workflow

1. **Isolate the Problem**
   ```bash
   bun run inspect:scopes "problematic code snippet"
   ```

2. **Check Component Files**
   - Look in `packages/language/syntaxes/core/`
   - Look in `packages/language/syntaxes/sections/`
   - Look in `packages/language/syntaxes/embedded/`

3. **Test Individual Patterns**
   - Copy pattern to test file
   - Use online TextMate grammar tester
   - Verify regex in isolation

4. **Rebuild and Test**
   ```bash
   bun run build:tmlanguage && bun run test:scopes
   ```

## 🎨 Theme Testing

### Test with Multiple Themes
1. **Dark+ (default dark)**
2. **Light+ (default light)** 
3. **Monokai**
4. **Solarized Dark/Light**
5. **Material Theme variants**

### Custom Theme Configuration
Add to VSCode `settings.json`:
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

## 📈 Performance Considerations

### Grammar Size Impact
- **Base grammar**: ~1.1KB (Langium generated)
- **Enhanced grammar**: ~29.3KB (with all modules)
- **Load time**: Minimal impact on editor startup

### Pattern Optimization
- Use specific patterns before general ones
- Avoid overlapping regex patterns
- Test with large files (>1000 lines)

## 🔧 Maintenance

### Adding New Scopes
1. **Update component files** in `syntaxes/` subdirectories
2. **Add test cases** to `test-scope-inspector.ts`
3. **Rebuild grammar**: `bun run build:tmlanguage`
4. **Test scopes**: `bun run test:scopes`
5. **Update documentation** (this file)

### Regular Testing
Run before releases:
```bash
bun run build:clean
bun run test:scopes
bun run test:tmlanguage
```

## 📚 Additional Resources

- [TextMate Grammar Documentation](https://macromates.com/manual/en/language_grammars)
- [VSCode Syntax Highlighting Guide](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide)
- [TextMate Scope Naming](https://www.sublimetext.com/docs/scope_naming.html)
- [Oniguruma Regex Documentation](https://github.com/kkos/oniguruma/blob/master/doc/RE)

## 🆘 Getting Help

If scope inspection reveals issues:

1. **Check this documentation** for common solutions
2. **Run comprehensive tests**: `bun run test:scopes`
3. **Compare with working examples** in `/examples`
4. **Test in multiple editors** (VSCode, Sublime, etc.)
5. **Check grammar build logs** for warnings/errors 