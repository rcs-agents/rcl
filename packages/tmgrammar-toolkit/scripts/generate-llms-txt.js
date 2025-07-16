#!/usr/bin/env node

/**
 * Generates llms.txt and llms-full.txt files according to https://llmstxt.org
 * 
 * llms.txt: Essential information for LLMs about the project
 * llms-full.txt: Complete codebase and documentation
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, relative, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const siteDir = join(projectRoot, 'site');

console.log('🤖 Generating LLMs.txt files...');

// Read package.json for project metadata
const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf-8'));

// Generate timestamp
const timestamp = new Date().toISOString();

// Helper function to recursively read files
function readFilesRecursively(dir, extensions = ['.ts', '.js', '.md'], exclude = []) {
  const files = [];
  
  function traverse(currentPath) {
    const items = readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = join(currentPath, item);
      const relativePath = relative(projectRoot, fullPath);
      
      // Skip excluded paths
      if (exclude.some(pattern => relativePath.includes(pattern))) {
        continue;
      }
      
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (extensions.includes(extname(fullPath))) {
        files.push({
          path: relativePath,
          content: readFileSync(fullPath, 'utf-8')
        });
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Generate llms.txt (essential information)
function generateLlmsTxt() {
  const content = `# ${packageJson.name}

${packageJson.description}

Version: ${packageJson.version}
Repository: ${packageJson.repository?.url || 'N/A'}
License: ${packageJson.license}
Generated: ${timestamp}

## Overview

TextMate Toolkit is a modern, type-safe toolkit for creating TextMate grammars with TypeScript. It provides:

- Type-safe grammar authoring with comprehensive validation
- Testing framework for grammar verification
- CLI tools for development workflow
- Pre-built patterns for common language constructs
- Advanced scope management system

## Quick Start

\`\`\`bash
# Install
npm install tmgrammar-toolkit

# Create grammar
import { createGrammar, scopes, regex } from 'tmgrammar-toolkit';

const grammar = createGrammar('MyLang', 'source.mylang', ['mylang'], [
  { key: 'keywords', match: regex.keywords(['if', 'else']), scope: scopes.keyword.control }
]);

# Generate JSON
bunx tmt emit grammar.ts -o grammar.json
\`\`\`

## Key Files

### Documentation
- README.md: Main project documentation
- docs/getting-started.md: First grammar tutorial
- docs/api-reference.md: Complete API documentation
- docs/modules-overview.md: Architecture deep dive

### Core Implementation
- src/types.ts: TypeScript interface definitions
- src/factory.ts: Grammar creation functions
- src/emit.ts: JSON/PList generation
- src/scopes/: Type-safe scope management
- src/helpers/: Regex construction utilities
- src/terminals/: Pre-built language patterns

### CLI
- src/cli/: Command-line interface
- src/cli/commands/: Individual CLI commands (emit, test, validate, snap)

## Architecture

The toolkit follows a layered architecture:
1. Types layer (types.ts) - Core TextMate grammar interfaces
2. Factory layer (factory.ts) - Clean construction APIs
3. Processing layer (emit.ts, validation/) - Grammar processing and validation
4. Helper layer (scopes/, helpers/, terminals/) - Developer convenience APIs
5. CLI layer (cli/) - Command-line interface

## Usage Patterns

Most common workflow:
1. Define rules using TypeScript interfaces
2. Create grammar with createGrammar()
3. Test with built-in testing framework
4. Emit to JSON/PList format
5. Integrate with VS Code or other editors

The toolkit emphasizes type safety, developer experience, and performance.`;

  writeFileSync(join(siteDir, 'llms.txt'), content);
  console.log('✅ Generated llms.txt');
}

// Generate llms-full.txt (complete codebase)
function generateLlmsFullTxt() {
  // Essential files for understanding the codebase
  const essentialFiles = [
    'README.md',
    'package.json',
    'src/types.ts',
    'src/factory.ts',
    'src/emit.ts',
    'src/index.ts'
  ];

  // Documentation files
  const docFiles = readFilesRecursively(join(projectRoot, 'docs'), ['.md']);
  
  // Source code files (excluding test files and build artifacts)
  const srcFiles = readFilesRecursively(
    join(projectRoot, 'src'), 
    ['.ts', '.js'], 
    ['node_modules', 'dist', 'build', '.test.', '.spec.']
  );

  // Example files
  const exampleFiles = existsSync(join(projectRoot, 'examples')) 
    ? readFilesRecursively(join(projectRoot, 'examples'), ['.ts', '.js', '.md'])
    : [];

  let content = `# ${packageJson.name} - Complete Codebase

${packageJson.description}

Version: ${packageJson.version}
Generated: ${timestamp}

This file contains the complete codebase for LLM analysis and understanding.

## Project Structure

\`\`\`
${packageJson.name}/
├── docs/                    # User documentation
├── src/                     # Source code
│   ├── cli/                # Command-line interface
│   ├── scopes/             # Type-safe scope system
│   ├── helpers/            # Regex utilities
│   ├── terminals/          # Pre-built patterns
│   ├── testing/            # Testing framework
│   └── validation/         # Grammar validation
├── examples/               # Example implementations
└── tests/                  # Test suite
\`\`\`

`;

  // Add essential files first
  content += '\n## Essential Files\n\n';
  for (const filePath of essentialFiles) {
    const fullPath = join(projectRoot, filePath);
    if (existsSync(fullPath)) {
      const fileContent = readFileSync(fullPath, 'utf-8');
      content += `### ${filePath}\n\n\`\`\`\n${fileContent}\n\`\`\`\n\n`;
    }
  }

  // Add documentation
  content += '\n## Documentation\n\n';
  for (const file of docFiles) {
    content += `### ${file.path}\n\n\`\`\`markdown\n${file.content}\n\`\`\`\n\n`;
  }

  // Add source code
  content += '\n## Source Code\n\n';
  for (const file of srcFiles.sort((a, b) => a.path.localeCompare(b.path))) {
    const ext = extname(file.path).slice(1);
    content += `### ${file.path}\n\n\`\`\`${ext}\n${file.content}\n\`\`\`\n\n`;
  }

  // Add examples
  if (exampleFiles.length > 0) {
    content += '\n## Examples\n\n';
    for (const file of exampleFiles) {
      const ext = extname(file.path).slice(1);
      content += `### ${file.path}\n\n\`\`\`${ext}\n${file.content}\n\`\`\`\n\n`;
    }
  }

  writeFileSync(join(siteDir, 'llms-full.txt'), content);
  console.log('✅ Generated llms-full.txt');
}

// Generate both files
generateLlmsTxt();
generateLlmsFullTxt();

console.log('🤖 LLMs.txt generation complete!');