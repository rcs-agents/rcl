# Using TextMate Scopes with `tmgrammar-toolkit`

The `tmgrammar-toolkit` provides a convenient and type-safe way to work with standard TextMate scope names when creating your tmLanguage grammars. This guide explains how to use the exported `scopes` object.

## Importing Scopes

First, import the `scopes` object from the `tmgrammar-toolkit` package (or the relevant file if you're working within the toolkit itself):

~~~typescript
import { scopes } from 'tmgrammar-toolkit'; // Or your relative path e.g., '../src/scopes';
~~~

## Accessing Scope Segments

The `scopes` object is structured hierarchically, mirroring the dot-separated nature of TextMate scopes. You can access specific scope segments by traversing the object:

~~~typescript
const keywordControl = scopes.keyword.control;
const conditionalScope = scopes.keyword.control.conditional;
const commentLine = scopes.comment.line;
~~~

## Getting the String Value

Each scope segment object can be easily converted to its string representation.

### 1. Using Template Literals (Recommended)

The most straightforward way is to use the scope object directly in a template literal. The object's `Symbol.toPrimitive` method handles the conversion.

~~~typescript
const rule = {
  name: `${scopes.keyword.control.conditional}.myLang`, // "keyword.control.conditional.myLang"
  match: `if|else`
};

console.log(`The scope is: ${scopes.keyword.operator}`); // "The scope is: keyword.operator"
~~~

### 2. Explicit `toString()` Call

You can also explicitly call the `toString()` method:

~~~typescript
const scopeString = scopes.entity.name.function.toString(); // "entity.name.function"
console.log(scopeString);
~~~

### 3. String Coercion

JavaScript's string coercion will also work:

~~~typescript
const fullScope = "" + scopes.storage.type; // "storage.type"
console.log(String(scopes.invalid.illegal)); // "invalid.illegal"
~~~

## Appending Language Suffixes

A common requirement is to append a language-specific suffix to a scope (e.g., `.javascript`, `.python`). Each scope segment is a callable function that accepts a language suffix string:

~~~typescript
const conditionalJs = scopes.keyword.control.conditional('javascript');
// Result: "keyword.control.conditional.javascript"

const keywordPython = scopes.keyword('python');
// Result: "keyword.python"

const commentBlockPhp = scopes.comment.block('php');
// Result: "comment.block.php"

console.log(conditionalJs);
~~~

This provides a clean and readable way to construct full language-specific scopes.

## Editor Integration (IntelliSense and Documentation)

Thanks to TypeScript and the JSDoc comments embedded in the `scopes` definition, you get excellent editor support:

*   **Autocompletion**: As you type `scopes.`, your editor will suggest available scope segments.
*   **Hover Documentation**: Hovering over any part of a scope path (e.g., `scopes.keyword` or `scopes.keyword.control`) will display its specific documentation, explaining its purpose and linking back to the `textmate-scopes.md` reference.

Example:
~~~typescript
// Hover over 'keyword' in scopes.keyword:
// (JSDoc for KeywordScope appears)
//
// Root scope for `keyword`.
// Defines scopes for reserved words and operators that have special meaning in a language.
// Full path: `keyword`
// From: [textmate-scopes.md](packages/tmgrammar-toolkit/docs/textmate-scopes.md#keyword)
const myKeywordScope = scopes.keyword;
~~~

This significantly improves the developer experience when working with TextMate scopes, making it easier to find and use the correct ones.

## Example Usage in a Grammar Rule

Here's how you might use it when defining a rule in a tmLanguage JSON file (conceptually, as you'd typically generate this JSON):

~~~json
{
  "name": "meta.function.myLang", // Constructed perhaps as `${scopes.meta.function('myLang')}`
  "begin": "(function)\\s+([a-zA-Z_][a-zA-Z0-9_]*)",
  "beginCaptures": {
    "1": { "name": "storage.type.function.myLang" }, // `${scopes.storage.type.function('myLang')}`
    "2": { "name": "entity.name.function.myLang" }  // `${scopes.entity.name.function('myLang')}`
  },
  "end": "\\}",
  // ...
}
~~~

By using the `scopes` object, you ensure consistency and reduce the chance of typos in your scope names. 