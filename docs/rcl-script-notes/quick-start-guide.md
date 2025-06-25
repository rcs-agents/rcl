## Setting a value

In RCL, values are declared as in writing: a `:` introduces a definition, while `is` makes an assertion about it.

When you write `phone: "+1234567890"` you are declaring that the value of `phone` is the text `"+1234567890"`.
If you write `phone is "+1234567890"` you are making a statement, or assertion, about the value of the `phone`.

You can check if the assertion is true or not and do something based on that:

```elixir
if the Phone is "+1234567890"
  call Phone
otherwise
  do nothing
```

or

```elixir
if the phone is "+1234567890", call phone, otherwise, do nothing.
```

<details>
<summary>How the single line syntax is translated into code</summary>

For the coders reading this, here's how the single line syntax above is translated into code:

- the `the` is an embedded comment, so the parser drops it
  - code: `if phone is "+1234567890", call phone, otherwise, do nothing.`
- the `.` is an alias for `end`
  - code: `if phone is "+1234567890", call phone, otherwise, do nothing end`
- `do ... end` creates a block, so let's write it as a function call:
  - code: `if phone is "+1234567890", call phone, otherwise, do(nothing)`
- `otherwise` (like `else`) are functions that take a _single_ **optional** parameter (a `block`), so that comma after it cannot be a part of its arguments list, so let's add the `()` to make it clear:
  - code: `if phone is "+1234567890", call phone, otherwise(), do(nothing)`
- `call` is also a function that takes a single parameter, let's wrap it in `()`
  - code: `if phone is "+1234567890", call(phone), otherwise(), do(nothing)`
- Finally, `if` is a function that takes 3 or 4 parameters, so let's wrap them too.
  - code: `if(phone is "+1234567890", call(phone), otherwise(), do(nothing))`

The `if` function has the following signatures:

```elixir
if(condition: expr, then: expr, else: expr)
if(condition: expr, then: expr, _: None, else: expr)
```

The actual parser rules that make this work are:

- Statements are evaluated from right to left
- The parser _knows_ how many arguments a function takes, and takes them _greedily_
- Parentheses around function parameters are optional
- Any lowercase word that _is not_ a registered keyword is treated as an embedded comment

> [!IMPORTANT]
> HOW DA HELL we'll look at `Call Phone` and know if it is a function call or a "Title Identifier"?
> I.e., does it mean `call(phone)` (a function call) or `callPhone` (a reference)?