---
layout: default
title: TextMate Toolkit Documentation
---

# TextMate Toolkit Documentation

Modern, type-safe toolkit for creating TextMate grammars with TypeScript.

## Documentation Sections

<div class="documentation-grid">
  
  <div class="doc-section user-docs">
    <h3>📖 How to Use</h3>
    <p>User guides and tutorials for building TextMate grammars</p>
    
    <div class="doc-links">
      {% assign user_docs = site.user_docs | sort: 'order' %}
      {% for doc in user_docs %}
      <a href="{{ doc.url | relative_url }}" class="doc-link">
        <strong>{{ doc.title }}</strong>
        {% if doc.description %}<span>{{ doc.description }}</span>{% endif %}
      </a>
      {% endfor %}
    </div>
  </div>

  <div class="doc-section internal-docs">
    <h3>🔧 How it Works</h3>
    <p>Internal architecture and contributor documentation</p>
    
    <div class="doc-links">
      {% assign internal_docs = site.internal_docs | sort: 'order' %}
      {% for doc in internal_docs %}
      <a href="{{ doc.url | relative_url }}" class="doc-link">
        <strong>{{ doc.title }}</strong>
        {% if doc.description %}<span>{{ doc.description }}</span>{% endif %}
      </a>
      {% endfor %}
    </div>
  </div>

</div>

## Quick Start

```bash
# Install
npm install tmgrammar-toolkit

# Create your first grammar
echo 'import { createGrammar, scopes, regex } from "tmgrammar-toolkit";

const grammar = createGrammar("MyLang", "source.mylang", ["mylang"], [
  { 
    key: "keywords", 
    match: regex.keywords(["if", "else", "while"]), 
    scope: scopes.keyword.control 
  }
]);

export default grammar;' > my-grammar.ts

# Generate TextMate JSON
bunx tmt emit my-grammar.ts -o my-grammar.json
```

## LLM Resources

For AI/LLM analysis and understanding:

- **[llms.txt]({{ '/llms.txt' | relative_url }})** - Essential project information
- **[llms-full.txt]({{ '/llms-full.txt' | relative_url }})** - Complete codebase and documentation

These files follow the [LLMs.txt specification](https://llmstxt.org) for optimal AI consumption.

## External Links

- **[GitHub Repository](https://github.com/svallory/tmgrammar-toolkit)** - Source code and issues
- **[npm Package](https://www.npmjs.com/package/tmgrammar-toolkit)** - Package installation
- **[Examples](https://github.com/svallory/tmgrammar-toolkit/tree/main/examples)** - Real-world grammar implementations