# RclScript Todo

## Resolve function call followed by Proper Noun

Problem: In the statement `Call Phone`, is `Phone` part of the function name or its first argument?

## Define the "embedded comments" rule

The [Cognate](https://github.com/cognate-lang/cognate) language has a simple rule: if it starts with a lowercase letter, it's a comment, every keyword and identifier must start with a capital letter.

While RclScript also emphasizes readability and uses capitalized identifiers, its approach to distinguishing keywords and embedded natural language within statements is based on a combination of carefully chosen compound keywords and an explicit embedded comment system.

## RclScript Keyword and Comment System

The clarity of RclScript relies on two main pillars:

1.  **Compound Keywords**: Many RclScript keywords are multi-word phrases (e.g., `for each`, `is in`). This inherently distinguishes them from common single English words, reducing ambiguity.
2.  **Embedded Comment Delimiters**: To intersperse natural language, provide explanations, or include proper nouns within an executable statement, RclScript uses explicit delimiters:
    *   An embedded comment **starts with ` _`** (a space followed by an underscore).
    *   An embedded comment **ends with `_ `** (an underscore followed by a space) or by the **end of the line**.

Any text within these delimiters is treated as non-executable commentary. This system is used for all forms of natural language embedding, including disambiguating potential keywords by using a descriptive phrase inside the comment delimiters.

### Reserved RclScript Keywords

This table lists the keywords reserved in RclScript, their general JavaScript equivalent, and examples of how to use their natural language synonyms within embedded comments if needed for disambiguation.

| Keyword           | JavaScript Equivalent        | Natural Language (within ` _..._ `) | Example of Keyword vs. Commented Phrase                                                                 |
|-------------------|------------------------------|--------------------------------------|---------------------------------------------------------------------------------------------------------|
| `for each`        | `for...of` loop              | `_ for all _` / `_ for every _`      | `for each Item in Order-Items` vs. `process Order _ for all items listed _`                             |
| `is in`           | `collection.includes()`      | `_ is located in _` / `_ is part of _` | `if Product is in Approved-List then...` vs. `log Message _ if product is part of campaign _`           |
| `is between`      | `x >= min && x <= max`       | `_ ranges from ... to ... _`         | `if Price is between 10 and 20 then...` vs. `set Range _ ranges from minimum to maximum _`                |
| `is equal to`     | `===`                        | `_ equals _` / `_ is the same as _`  | `if Status is equal to "Active" then...` vs. `verify Input _ equals the expected value _`               |
| `is greater than` | `>`                          | `_ exceeds _` / `_ is more than _`   | `if Quantity is greater than 100 then...` vs. `check Stock _ exceeds threshold _`                         |
| `is less than`    | `<`                          | `_ is below _` / `_ is under _`      | `if Discount is less than 5 then...` vs. `alert User _ if value is below minimum _`                     |
| `has`             | `obj.hasOwnProperty()`       | `_ includes _` / `_ possesses _`     | `if Customer has Premium-Status then...` vs. `describe Object _ includes specific features _`             |
| `contains`        | `array.includes()`, `str.includes()`| `_ includes _` / `_ holds _`       | `if Message contains "error" then...` vs. `log Data _ includes vital information _`                     |
| `starts with`     | `string.startsWith()`        | `_ begins with _`                    | `if Filename starts with "tmp_" then...` vs. `parse Text _ begins with a header _`                      |
| `ends with`       | `string.endsWith()`          | `_ finishes with _`                  | `if Document ends with ".pdf" then...` vs. `format Report _ finishes with a summary _`                  |
| `and also`        | `&&`                         | `_ and _` / `_ in addition to _`     | `if Is-Verified and also Is-Active then...` vs. `validate Input _ and check format _`                 |
| `or else`         | `||`                         | `_ or _` / `_ otherwise _`           | `if Is-Preferred or else Is-Standard then...` vs. `select Option _ or use default _`                    |
| `is not`          | `!==` / `!`                  | `_ is not _` / `_ isn't _`           | `if User is not null then...` vs. `check Value _ isn't empty _`                                       |
| `if then`         | `if () {}`                   | `_ if _` / `_ assuming _`            | `if then apply Discount` vs. `proceed _ if all checks pass _`                                         |
| `when then`       | `switch/case` or `if/else if`| `_ when _` / `_ upon _`              | `when Case-Value then perform Action` vs. `notify User _ when process completes _`                      |
| `while do`        | `while () {}`                | `_ while _` / `_ as long as _`       | `while do process Items` vs. `wait _ while system is busy _`                                          |
| `try to`          | `try {} catch {}`            | `_ attempt to _`                     | `try to Save-Data` vs. `log Action _ attempt to connect _`                                            |
| `set to`          | `variable = value`           | `_ set as _` / `_ assign as _`       | `set Status to "Complete"` vs. `configure System _ set as primary _`                                |
| `add to`          | `array.push()`, `val + add`  | `_ include in _` / `_ append to _`   | `add Item to Shopping-Cart` vs. `update Record _ include in history log _`                            |
| `remove from`     | `array.splice()`, `val - sub`| `_ delete from _` / `_ exclude from _`| `remove User from Active-List` vs. `clean Data _ delete from temporary storage _`                     |

### Handling Proper Nouns and General Embedded Text with ` _` Delimiters

The ` _` delimiter system is also used for embedding any descriptive text, including proper nouns that are capitalized but should not be treated as RclScript identifiers.

*   **Previous Flaw of Using Quotes (Now Obsolete):** The earlier idea of using quotes (e.g., `"Rio de Janeiro"`) to denote proper nouns within statements was problematic. Quotes are reserved for string literals, and this could lead to parsing ambiguity or misinterpretation (e.g., the parser potentially trying to access a property on the string `"Rio de Janeiro"`).

*   **The ` _` Delimiter Solution (Current and Final):**
    ```elixir
    # Example with a proper noun, clearly a comment:
    set Timezone to UTC-3 _since we are in Rio de Janeiro_

    # The comment can also extend to the end of the line:
    set User-Location to Default-City _as user is in Rio de Janeiro

    # Further examples illustrating clarity:
    process Payment-Request _using the Bank-Gateway for verification_ and then Log-Transaction
    verify Customer-Profile _which should be complete_ before Activating-Account
    calculate Final-Amount _after applying all relevant tax rules for California_ then Display-Total
    ```
This system ensures that any text initiated by ` _` and terminated by `_ ` or the end of the line is unequivocally treated as non-executable commentary. This perfectly handles proper nouns, descriptive phrases, and any other natural language snippets embedded within statements, without syntax clashes or ambiguity.

This combination of compound keywords and the explicit ` _` embedded comment system resolves all previously identified ambiguities regarding keyword versus natural language interpretation within RclScript statements.

Programming languages that are "more like english" reserve, at most, the following keywords:

**Control Flow & Branching**
	•	if, else, elif, then, otherwise
	•	switch, match, case, when, default
	•	for, while, do, until, repeat, loop
	•	break, continue, pass, skip, next
	•	return, yield, exit, halt, stop

**Functions & Procedures**
	•	function, method, procedure, routine, operator
	•	call, invoke, execute, run, perform
	•	lambda, def, arrow
	•	get, set, init, create, build, make

**Object-Oriented Programming**
	•	class, struct, interface, enum, trait, mixin, record
	•	extends, implements, inherits, override, virtual, abstract, static
	•	this, self, super, base, parent, new, instance

**Visibility & Access Control**
	•	public, private, protected, internal, readonly, final, sealed
	•	visible, hidden, expose, restrict

**Variables & Types**
	•	var, let, const, define, declare
	•	type, typeof, instance, instanceof, kind
	•	as, is, has, in, of, from, to

**Boolean & Null Values**
	•	true, false, yes, no
	•	null, undefined, nothing, empty, void
	•	any, some, none, all, every

**Logic & Comparison**
	•	and, or, not, xor, nor, nand
	•	equals, compare, less, greater, between
	•	like, unlike, similar, different
	•	with, without, having, lacking

**Data Structures & Collections**
	•	array, list, map, set, dict, dictionary, tuple
	•	vector, stack, queue, tree, graph, table
	•	collection, container, sequence, range

**Iteration & Collection Operations**
	•	each, every, filter, select, where, find
	•	map, reduce, fold, collect, group, sort
	•	first, last, head, tail, take, drop
	•	size, length, count, contains, includes

**Concurrency & Threading**
	•	async, await, sync, parallel, concurrent
	•	thread, task, job, worker, process
	•	lock, unlock, mutex, atomic, volatile
	•	race, join, fork, spawn

**Error Handling & Flow Control**
	•	try, catch, finally, throw, raise, fail
	•	rescue, recover, handle, ignore
	•	retry, resume, suspend, abort
	•	ensure, guarantee, check, validate

**Memory & Resource Management**
	•	delete, free, release, dispose, cleanup
	•	allocate, reserve, acquire, obtain
	•	manage, track, monitor, watch

**Input/Output Operations**
	•	read, write, print, output, input, scan
	•	open, close, flush, stream, pipe
	•	load, save, store, fetch, retrieve

**File System & Paths**
	•	file, directory, folder, path, location
	•	exists, create, copy, move, rename, remove
	•	navigate, browse, search, explore

**Network & Communication**
	•	send, receive, request, response, reply
	•	connect, disconnect, bind, listen, accept
	•	client, server, socket, port, address
	•	upload, download, transfer, share

**Time & Scheduling**
	•	now, today, time, date, timestamp, duration
	•	delay, wait, sleep, timeout, schedule
	•	before, after, during, within, since, until

**String & Text Processing**
	•	concat, join, split, replace, substitute
	•	match, search, find, locate, extract
	•	contains, starts, ends, begins, finishes
	•	trim, strip, pad, format, encode, decode
	•	upper, lower, capitalize, normalize

**Mathematical Operations**
	•	add, subtract, multiply, divide, modulo
	•	power, sqrt, abs, round, floor, ceil
	•	min, max, sum, average, median, random

**Modules & Code Organization**
	•	import, export, include, require, using
	•	namespace, module, package, library, component
	•	expose, hide, share, distribute

**Testing & Debugging**
	•	test, expect, assert, verify, confirm
	•	debug, trace, log, warn, error, info
	•	mock, stub, spy, intercept, monitor

**Configuration & Environment**
	•	config, setting, option, parameter, argument
	•	env, environment, context, scope, global, local
	•	override, default, fallback, inherit

**Annotations & Metadata**
	•	annotation, attribute, tag, label, mark
	•	describe, document, note, comment, explain
	•	hint, suggest, recommend, prefer

**Event Handling & Reactive Programming**
	•	event, emit, trigger, fire, dispatch
	•	listen, observe, watch, monitor, track
	•	subscribe, unsubscribe, notify, signal
	•	react, respond, handle, process

But we are creating a script language for defining business logic which does it's best to read like english. 

In RclScript the user will not be able to create classes, define named functions, or define types. They will only be able to define
anonymous (lambda) functions, operate on existing objects injected into the global `context` variable, perform operations on native types (via operators or functions of the ECMAScript standard library), calculations, loops, and control flow.

So, for our purposes, the we only need to reserve the following keywords:

**Control Flow & Branching**
	•	if, else, then, otherwise
	•	when, case, default
	•	for, while, until, repeat
	•	break, continue, next, stop

**Variables & Assignment**
	•	let, set, define
	•	as, is, has, in, of

**Boolean & Logic**
	•	true, false, yes, no
	•	and, or, not
	•	null, empty, nothing

**Comparison & Conditions**
	•	equals, less, greater, between
	•	like, contains, includes
	•	with, without, having

**Anonymous Functions**
	•	function, lambda, do
	•	return, yield

**Collection Operations** 
	•	each, every, where, find
	•	first, last, count, size
	•	map, filter, select, collect

**Mathematical Operations**
	•	add, subtract, multiply, divide
	•	sum, average, min, max, round

**Context & Data Access**
	•	context, get, take, from
	•	exists, missing, available

**Error Handling**
	•	try, catch, handle, ignore
	•	fail, ensure, check

**Flow Control**
	•	wait, done, skip, pass

## Keyword Marking vs Escaping for Embedded Comments

Given RclScript's goal of reading like natural English, we need to decide how to distinguish between keywords and regular English words in embedded comments.

### Option 1: Mark Keywords (Recommended)
Mark words when they should be treated as language constructs:

**Syntax Options:**
- **Colon suffix**: `if: customer has premium status then: give discount`
- **At prefix**: `@if customer has premium status @then give discount`  
- **Dot suffix**: `if. customer has premium status then. give discount`
- **Capitalization**: `If customer has premium status Then give discount`

**Advantages:**
- Natural English flows by default
- Keywords stand out clearly as language constructs
- No visual noise in comments/natural language
- Follows the principle that comments are the norm, code is the exception

### Option 2: Escape Keywords
Escape keywords when they should be treated as regular words:

**Syntax Options:**
- **Backslash**: `The customer said \if they like it, they'll buy more`
- **Quotes**: `The customer said "if" they like it, they'll buy more`
- **Underscore**: `The customer said _if_ they like it, they'll buy more`

**Disadvantages:**
- Adds visual clutter to natural language
- Makes comments harder to read
- Assumes keywords are the default (contradicts English-first design)

### Recommendation: Colon Suffix (`if:`, `then:`, `else:`)

The colon suffix feels most natural because:
- It mimics how we naturally pause in English: "If you're ready, then we'll begin"
- It's minimal visual impact
- It reads like natural speech patterns
- It clearly delineates control flow without being obtrusive

**Example:**
```elixir
if: customer age is greater than 65 and customer has premium status
then: apply senior discount of 15%
else: apply standard discount of 5%

// This reads naturally: "If the customer said if they like it, 
// they will buy more, then we should follow up next week"
```

## Statement Examples: Keyword Escaping vs Keyword Marking

**Note**: Keyword escaping/promotion is only needed in executable statements, not inside strings or comments.

## Ambiguous Cases: Keywords vs. Embedded Comments in Statements

These examples show **within a known statement**, where we can't determine if a word is a keyword or natural language:

## Solution: Compound Keywords + Embedded Comments

**Compound Keywords**: Use multi-word keywords to eliminate ambiguity
**Embedded Comments**: Use `_` (space-underscore) to start embedded comments, ending with `_` (underscore-space) or end of line

### Reserved Keywords Table

| Keyword | JavaScript Equivalent | Comment Synonym | Example |
|---------|----------------------|-----------------|---------|
| `for each` | `for...of` loop | `for all` | `for each Customer` vs `for all customers` |
| `is in` | `collection.includes()` | `located in` | `is in Premium-List` vs `located in database` |
| `is between` | `x >= min && x <= max` | `ranges between` | `is between 10 and 20` vs `ranges between values` |
| `is equal to` | `===` | `equals` | `is equal to "Premium"` vs `equals the same` |
| `is greater than` | `>` | `exceeds` | `is greater than 100` vs `exceeds normal limits` |
| `is less than` | `<` | `below` | `is less than 50` vs `below average` |
| `has` | `obj.hasOwnProperty()` | `includes` | `has Premium-Status` vs `includes benefits` |
| `contains` | `array.includes()` | `includes` | `contains "error"` vs `includes information` |
| `starts with` | `string.startsWith()` | `begins with` | `starts with "A"` vs `begins with introduction` |
| `ends with` | `string.endsWith()` | `finishes with` | `ends with ".pdf"` vs `finishes with summary` |
| `and also` | `&&` | `and` | `Premium and also Active` vs `active and helpful` |
| `or else` | `||` | `or` | `Premium or else Standard` vs `standard or custom` |
| `is not` | `!==` | `not` | `is not null` vs `not available` |
| `if then` | `if () {}` | `if` | `if then apply discount` vs `if possible` |
| `when then` | `switch/case` | `when` | `when then process` vs `when ready` |
| `while do` | `while () {}` | `while` | `while do process` vs `while waiting` |
| `try to` | `try {} catch` | `attempt to` | `try to validate` vs `attempt to improve` |
| `set to` | `variable = value` | `set as` | `set to "Premium"` vs `set as example` |
| `add to` | `array.push()` | `include in` | `add to Cart-Items` vs `include in report` |
| `remove from` | `array.splice()` | `delete from` | `remove from List` vs `delete from database` |

### Examples with Embedded Comments:

```elixir
# Clear keyword usage:
for each Customer is in Premium-Members
    set Customer.Discount to 15%

# Clear embedded comments:
process Payment-Request _ using Card-Validator for security _ 
calculate Tax-Amount _ somewhere between Base-Rate and Premium-Rate _
verify Customer-Status _ should equal Premium-Level before processing _
```

### Resolving Ambiguity: Compound Keywords & Explicit Embedded Comments

The previously discussed ambiguities, where a single word within a known statement could be interpreted as either a keyword or natural language, are now effectively resolved by two main strategies:

1.  **Compound Keywords**: As detailed in the "Reserved Keywords Table," using multi-word phrases for core keywords (e.g., `for each`, `is in`, `is equal to`, `if then`) clearly distinguishes them from their single-word, often prepositional, counterparts found in natural English.
    *   *Example:* `for each Customer` (keyword) versus `_ for all Customers _` (embedded comment/natural language).
    *   *Example:* `Amount is greater than 100` (keyword) versus `_ amount exceeds 100 _` (embedded comment/natural language).

2.  **Explicit Embedded Comment Delimiters (` _` and `_ ` or EOL)**: This is the refined solution for interspersing natural language, explanations, or proper nouns directly within an executable statement.
    *   An embedded comment begins with ` _` (a space followed by an underscore).
    *   It terminates either with `_ ` (an underscore followed by a space) or by the end of the line.
    *   This approach entirely replaces the previously considered (and problematic) idea of using quotes to disambiguate proper nouns within statements.

**Handling Proper Nouns and General Embedded Text with ` _` Delimiters:**

*   **Flaw of Using Quotes (Now Obsolete):** The suggestion to use quotes for proper nouns (e.g., `set Timezone to "UTC-3" since we are in "Rio de Janeiro"`) was problematic. It created a conflict with the standard use of quotes for string literals and could lead to misinterpretations, such as the parser attempting to treat `"Rio de Janeiro"` as a string variable or object that might have properties (e.g., imagining `"Rio de Janeiro".timezone`).

*   **The ` _` Delimiter Solution:**
    ```elixir
    # Previously ambiguous without explicit comment markers:
    # "Rio De Janeiro" could be one or more identifiers or natural language.
    set Timezone to UTC-3 since we are in Rio De Janeiro

    # Clear and Unambiguous with ` _` embedded comment markers:
    # "since we are in Rio de Janeiro" is clearly a non-executable comment.
    set Timezone to UTC-3 _since we are in Rio de Janeiro_

    # The comment can also extend to the end of the line:
    set Timezone to UTC-3 since we are in _Rio de Janeiro

    # Further examples illustrating clarity with start and end delimiters:
    process Payment-Request _ using the preferred Card-Validator for security reasons _ and then Log-Transaction-Attempt
    verify Customer-Status _ which should be Active or VIP _ before Granting-Access
    calculate Final-Price _ after all discounts and taxes _ then Display-Result
    ```
    This system ensures that any text wrapped by ` _` and `_ ` (or ` _` to EOL) is unequivocally treated as non-executable commentary. This perfectly handles proper nouns (like "Rio de Janeiro"), descriptive phrases, and any other natural language snippets embedded within statements, without syntax clashes or ambiguity.

### Delimiter Choice for Embedded Comments: `_` vs. `~`

You raised an excellent point about whether `~` (tilde) might be a more visually intuitive delimiter than `_` (underscore) for non-programmers. This is a crucial usability consideration.

*   **` _` (Underscore Approach - Used in current examples):**
    *   **Pros:**
        *   Can be relatively subtle, allowing the embedded comment to feel more integrated into the natural flow of the sentence if desired.
        *   Programmers have some peripheral familiarity with underscores, though not typically in this exact delimiting fashion.
    *   **Cons:**
        *   Its subtlety might also be a drawback, potentially making the comment section *less* visually distinct on a quick scan. The boundaries might be slightly less obvious.
    *   *Example*: `set Customer Status to Active _based on their last login date_`

*   **`~` (Tilde Approach):**
    *   **Pros:**
        *   More visually distinct from standard English punctuation and from the underscore character itself. This could make it unequivocally clear to a non-programmer that "this is a special, non-code part of the statement."
        *   The tilde is not commonly used in everyday English text, so its appearance would immediately signal a different type of content, aiding learnability for this specific purpose.
    *   **Cons:**
        *   Might appear slightly more "technical" or "code-like" to some non-programmers precisely *because* it's an uncommon symbol in their usual reading. However, this could also be seen as a benefit for clear demarcation.
    *   *Example*: `set Customer Status to Active ~based on their last login date~`

**Considerations for Non-Programmers:**

*   **Clarity of Demarcation**: `~` likely offers a stronger visual cue that a non-executable segment has begun/ended.
*   **Natural Feel vs. Explicit Marking**: `_` might feel more "blended" into the text, while `~` acts as a more explicit "aside" or "annotation" marker.
*   **Learnability**: Both are simple, single characters. The key will be clear documentation and consistent application of whichever is chosen. If the goal is immediate, unmistakable separation for non-programmers, `~` might have a slight edge due to its rarity in plain text.

The final choice between `_` and `~` depends on whether the design prioritizes maximum visual distinctiveness for the comment (`~`) or a more subtle, integrated feel (`_`). For now, the document examples can continue to use `_` as a placeholder, with the understanding that this could be globally changed to `~` if that's deemed better for the target audience.

With the robust system of compound keywords and this explicit embedded comment mechanism (using either `_` or `~`), all the previously identified dubious cases regarding keyword versus natural language ambiguity within statements are comprehensively resolved. There are no known remaining cases of such ambiguity with this system in place.

### The Core Problem:

In natural business language, we often use the same words that programming languages use as keywords. The challenge is that **RclScript's goal is to be so natural that the boundary between description and implementation becomes blurred**.

### Why This Matters:

- **Parser ambiguity**: The language processor can't determine intent without explicit marking
- **User confusion**: Writers might not know when they're writing code vs. comments
- **Maintenance issues**: Future editors might misinterpret the original intent
- **Debugging complexity**: Errors become harder to trace when intent is unclear

This is why **keyword marking with `:` is essential** - it eliminates these ambiguities by making the user's intent explicit.

**Multiple Keywords:**
- if: Customer Type equals: Premium and: Order Total greater: than 500 then: apply both: seasonal and: loyalty discounts with: maximum savings of: 30%
- for: each item in: cart where: price is: between 50 and: 200 calculate tax then: add to: running total with: shipping
- when: payment is: processed and: inventory is: available then: set: order status to: confirmed and: send confirmation email

### Analysis

The **keyword marking approach** is clearly superior:

1. **Cleaner natural flow** - Less visual interruption in sentences
2. **Intuitive punctuation** - Colons feel natural for continuation/emphasis  
3. **Reduced cognitive load** - Easier to scan and understand intent
4. **Better readability** - Non-programmers can follow the logic more easily
5. **No string/comment pollution** - Keywords in strings and comments remain untouched



