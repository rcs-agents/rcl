#!/usr/bin/env node

/**
 * Build script for GitHub Pages documentation
 * Copies internal READMEs and generates LLMs.txt files
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const siteDir = join(projectRoot, 'site');

console.log('🔧 Building documentation for GitHub Pages...');

// Ensure site directories exist
const internalDocsDir = join(siteDir, '_internal_docs');
const userDocsDir = join(siteDir, '_user_docs');

if (!existsSync(internalDocsDir)) {
  mkdirSync(internalDocsDir, { recursive: true });
}

// User documentation mappings with front matter
const userDocs = [
  {
    source: 'docs/README.md',
    target: 'site/_user_docs/overview.md',
    title: 'Documentation Overview',
    description: 'Navigate the documentation sections',
    order: 0
  },
  {
    source: 'docs/getting-started.md',
    target: 'site/_user_docs/getting-started.md',
    title: 'Getting Started',
    description: 'Build your first TextMate grammar in 15 minutes',
    order: 1
  },
  {
    source: 'docs/api-reference.md',
    target: 'site/_user_docs/api-reference.md',
    title: 'API Reference',
    description: 'Complete function and type reference',
    order: 2
  },
  {
    source: 'docs/using-scopes.md',
    target: 'site/_user_docs/using-scopes.md',
    title: 'Using Scopes',
    description: 'Master type-safe scope management',
    order: 3
  },
  {
    source: 'docs/textmate-scopes.md',
    target: 'site/_user_docs/textmate-scopes.md',
    title: 'TextMate Scopes Reference',
    description: 'Complete scope naming guide',
    order: 4
  },
  {
    source: 'docs/modules-overview.md',
    target: 'site/_user_docs/modules-overview.md',
    title: 'Modules Overview',
    description: 'Deep dive into toolkit architecture',
    order: 5
  },
  {
    source: 'docs/troubleshooting.md',
    target: 'site/_user_docs/troubleshooting.md',
    title: 'Troubleshooting',
    description: 'Solutions for common issues',
    order: 6
  }
];

// Copy user docs with front matter
console.log('📖 Copying user documentation...');
for (const doc of userDocs) {
  const sourcePath = join(projectRoot, doc.source);
  const targetPath = join(projectRoot, doc.target);
  
  if (!existsSync(sourcePath)) {
    console.warn(`⚠️  Warning: ${doc.source} not found, skipping...`);
    continue;
  }
  
  if (!existsSync(userDocsDir)) {
    mkdirSync(userDocsDir, { recursive: true });
  }
  
  let content = readFileSync(sourcePath, 'utf-8');
  
  // Fix markdown links to point to Jekyll URLs
  content = content
    // Fix relative links to other docs
    .replace(/\[([^\]]+)\]\(([^)]+)\.md\)/g, (match, text, path) => {
      // Handle relative paths within docs
      if (!path.startsWith('http') && !path.startsWith('/')) {
        return `[${text}]({{ '/docs/${path}/' | relative_url }})`;
      }
      return match;
    })
    // Fix specific internal doc links
    .replace(/\[([^\]]+)\]\(\.\.\/([^)]+)\/README\.md\)/g, (match, text, path) => {
      const internalPath = path.replace(/\//g, '-').toLowerCase();
      return `[${text}]({{ '/internal/${internalPath}/' | relative_url }})`;
    })
    // Fix any remaining README.md links
    .replace(/README\.md/g, '');
  
  // Add Jekyll front matter
  const frontMatter = `---
title: ${doc.title}
description: ${doc.description}
order: ${doc.order}
---

`;
  
  const processedContent = frontMatter + content;
  writeFileSync(targetPath, processedContent);
  console.log(`✅ Copied ${doc.source} -> ${doc.target}`);
}

// Internal documentation mappings
const internalDocs = [
  {
    source: 'src/README.md',
    target: 'site/_internal_docs/src.md',
    title: 'Source Code Architecture',
    description: 'Core implementation and contributor guide',
    order: 1
  },
  {
    source: 'src/helpers/README.md',
    target: 'site/_internal_docs/helpers.md',
    title: 'Helpers Module',
    description: 'Regex construction utilities for contributors',
    order: 2
  },
  {
    source: 'src/scopes/README.md',
    target: 'site/_internal_docs/scopes.md',
    title: 'Scopes Architecture',
    description: 'Type-safe scope system internals',
    order: 3
  },
  {
    source: 'src/scopes/well-known/README.md',
    target: 'site/_internal_docs/well-known-scopes.md',
    title: 'Well-Known Scopes',
    description: 'Predefined scope categories and structure',
    order: 4
  },
  {
    source: 'src/terminals/README.md',
    target: 'site/_internal_docs/terminals.md',
    title: 'Terminals Module',
    description: 'Pre-built patterns for common constructs',
    order: 5
  },
  {
    source: 'src/testing/README.md',
    target: 'site/_internal_docs/testing.md',
    title: 'Testing Framework',
    description: 'Internal testing architecture and APIs',
    order: 6
  },
  {
    source: 'src/validation/README.md',
    target: 'site/_internal_docs/validation.md',
    title: 'Validation System',
    description: 'Grammar and pattern validation internals',
    order: 7
  }
];

// Copy internal docs with front matter
console.log('📝 Copying internal documentation...');
for (const doc of internalDocs) {
  const sourcePath = join(projectRoot, doc.source);
  const targetPath = join(projectRoot, doc.target);
  
  if (!existsSync(sourcePath)) {
    console.warn(`⚠️  Warning: ${doc.source} not found, skipping...`);
    continue;
  }
  
  const content = readFileSync(sourcePath, 'utf-8');
  
  // Add Jekyll front matter
  const frontMatter = `---
title: ${doc.title}
description: ${doc.description}
order: ${doc.order}
source_file: ${doc.source}
---

`;
  
  const processedContent = frontMatter + content;
  writeFileSync(targetPath, processedContent);
  console.log(`✅ Copied ${doc.source} -> ${doc.target}`);
}

console.log('✨ Documentation build complete!');