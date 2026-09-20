---
description: Audit a Figma plugin for security, code quality, UX, and performance. Produces a structured report with severity-ranked findings. Accessibility is a separate dimension — run /figma-plugin-kit:a11y alongside this for a complete picture.
---

# Figma plugin audit

Audit the specified plugin across four areas: **Security**, **Code Quality**, **UX**, and **Performance**. Accessibility is a separate dimension — run `/figma-plugin-kit:a11y` alongside this for a complete picture.

## Setup

If the user did not specify a plugin name, ask for it now. Do not proceed without knowing which plugin to audit.

Identify the plugin directory under the monorepo. Read these files in full before starting:
- `src/code.ts` — main thread logic
- `src/PluginUI.svelte` — UI component
- `src/manifest.json` (or `manifest.json`) — plugin metadata
- `CHANGELOG.md` — recent fixes (scan the last 20–30 lines to identify issues already addressed)

If the plugin has additional source files (e.g. `src/generators.ts`, `src/utils.ts`), read those too before auditing.

Do not audit code that the CHANGELOG shows was already fixed in the most recent version. Note fixed items if they're instructive, but mark them clearly.

---

## How to report

Use this exact structure for the output:

```
# [Plugin Name] — Audit Report

**Date:** [today]
**Scope:** Security, code quality, UX, performance — run `/figma-plugin-kit:a11y` separately for the accessibility dimension

---

## Security
...

## Code Quality
...

## UX
...

## Performance
...

---

## Summary

| Area | Finding | Severity |
|---|---|---|
| ... | ... | ... |

**Most impactful fixes:** [2–4 highest-value items]
```

For each finding:
- Number it within its section
- Reference the exact file and line number: `src/code.ts:142`
- Describe what the bug/issue is and why it matters
- State the fix concisely if it's non-obvious

Severity scale:
- **High** — crash, data loss, or UI freeze
- **Medium** — silent failure, incorrect behavior, or significant performance regression
- **Low** — correctness, consistency, or minor inefficiency
- **Info** — worth noting, not worth prioritizing

If a category has no findings, say so in one sentence. Do not invent findings to fill space.

---

## Security checklist

Work through these in order. For each one, search the source before marking it clean.

### Message validation (code.ts)
- All fields destructured from `msg` in `figma.ui.onmessage` are validated with type guards before use — not just truthiness checks
- Object payloads (e.g. `mapping`, `options`) validated as non-null, non-array objects before iterating their values
- String values used as node IDs (passed to `getNodeByIdAsync`, `getNodeById`) validated as non-empty strings
- Numeric values validated as finite numbers before use in calculations

### Manifest (manifest.json)
- `allowedDomains` is `["none"]` unless the plugin genuinely needs network access
- `documentAccess` is scoped correctly (`"dynamic-page"` or `"readonly"` as appropriate)
- `enableProposedApi` is `false` unless required

### DOM / injection (PluginUI.svelte)
- No `eval()`, `new Function()`, or `dangerouslySetInnerHTML` patterns
- `{@html ...}` used only with build-time SVG imports or other trusted, non-user-controlled content — never with user strings
- No credentials, API keys, or tokens in source files

### Storage safety (code.ts)
- `clientStorage.getAsync` results are type-checked and defaulted — not passed directly to functions that assume a specific shape

---

## Code quality checklist

### Deprecated API usage (code.ts)
Figma migrated several synchronous APIs to async equivalents when dynamic page loading was introduced. Using the old sync versions is a correctness issue in plugins with `"documentAccess": "dynamic-page"`. Check for these patterns:

| Deprecated (sync) | Replacement (async) |
|---|---|
| `figma.getNodeById(id)` | `await figma.getNodeByIdAsync(id)` |
| `figma.getStyleById(id)` | `await figma.getStyleByIdAsync(id)` |
| `figma.getLocalTextStyles()` | `await figma.getLocalTextStylesAsync()` |
| `node.mainComponent` | `await node.getMainComponentAsync()` |
| `node.instances` | `await node.getInstancesAsync()` |
| `node.fillStyleId = id` | `await node.setFillStyleIdAsync(id)` |

If the plugin's manifest has `"documentAccess": "dynamic-page"`, any of the sync forms above will either return stale data or throw.

### Null safety (code.ts + any generator files)
- `findOne()`, `findChild()`, `getNodeByIdAsync()` results null-checked before property access
- No non-null assertions (`!`) on values that can legitimately be null
- `importComponentByKeyAsync` return values are not redundantly type-checked after import (the API already narrows the type)

### Error handling (code.ts)
- The `figma.ui.onmessage` async handler is wrapped in `try/catch/finally`
- The `finally` block always posts a done/error message to the UI so the UI never stays in a loading state after an error
- All standalone Promise chains have `.catch()` — no fire-and-forget `.then()` without error handling
- `clientStorage` calls are guarded against rejection

### Page loading (code.ts)
If the plugin accesses nodes on pages other than `figma.currentPage`, it must call `await page.loadAsync()` before accessing `page.children` or calling page-level methods (`appendChild`, `findAll`, `exportAsync`). Skipping this throws a runtime exception — it is not a graceful failure.

Only flag this if the plugin actually accesses multiple pages. Plugins that only work on `figma.currentPage` are unaffected.

### Dead code
- No commented-out code blocks left in source
- No stale header comments describing past changes ("It now includes...", "Previously...")
- No unused variables (TypeScript `noUnusedLocals` should catch these, but check manually)
- No dead branches after type-narrowed checks (e.g. checking `.type === "COMPONENT"` after `importComponentByKeyAsync` which already returns `ComponentNode`)
- No filter/transform steps that are already made redundant by a prior step

### TypeScript quality (PluginUI.svelte)
- Svelte state arrays are explicitly typed — not inferred as `never[]` from `let x = []`
- Message payload types match between what `code.ts` sends and what the UI handler expects

### Svelte-specific
- Per-row components do not share mutable object references (menu items, options arrays) — each row must have its own copy
- `setTimeout` references are stored and cleared before being reset (prevents overlapping timers from rapid user actions)
- `isLoading` (or equivalent) is set to `true` at the start of every async dispatch, not just some of them

### Copy and notifications (code.ts + PluginUI.svelte)
- `figma.notify()` strings: sentence case, no emoji (per AGENTS.md copy guidelines)
- Button labels: verb + noun format, not generic ("Create variants" not "Generate")
- Loading state label matches the action verb ("Creating..." not "Loading...")

### Settings persistence (code.ts)
- All user-configurable toggles, inputs, and selections are saved to `clientStorage` and restored on open
- No setting resets to a hardcoded default on every plugin open when the user has previously set it

---

## UX checklist

### Action buttons
- The primary action button is disabled whenever required inputs are missing or invalid
- When disabled, there is a tooltip or visible explanation for why (not just a greyed-out button)
- `aria-disabled="true"` is preferred over `disabled` when the reason needs to be announced (keeps element focusable)
- The button does not become active before async loading has confirmed readiness (initial state uses `null`, not `0` or `false`, to distinguish "not yet known" from "confirmed empty")

### Loading and async feedback
- A loading state (spinner, disabled button, or visual indicator) is shown during both the outgoing request and the incoming response — not just one of them
- The loading state cannot be triggered twice (button disabled or `isLoading` set before dispatch)
- If an async operation can hang (e.g. variable fetch, library import), there is a timeout with a recovery message — not an infinite spinner

### Result and error notifications (`figma.notify`)
- A result of 0 is never presented the same way as success — "Swapped 0 icons" is not acceptable as a success notification; it must be an error or explain why nothing happened
- Zero-result messages explain the most likely cause, not just the outcome
- Success notifications for destructive or bulk operations include "Press Ctrl/Cmd+Z to undo."
- Error messages suggest a next step — they do not just describe what went wrong

### Input validation
- Empty required text inputs block the action or produce a clear error notification — the plugin does not silently proceed and return 0 results
- Inputs that control scoped operations (e.g. layer name, prefix) are validated before dispatch, not just on the plugin side

### Layout and state representation
- `EmptyState` is used only for "nothing here yet" — not for active selection status, counts, or feedback that changes while the plugin is in use
- Match/result counts are shown in section headers when the user needs to know how many items were found
- No valid user scenario can be blocked indefinitely with no path to recovery

### Consistency with the collection
- If other plugins in this collection show an undo hint on success, this one should too
- Same-option selections (e.g. source === target collection) are blocked when they would produce a no-op

---

## Performance checklist

### Parallelism (code.ts)
- Independent async Figma API calls are run with `Promise.all` — not sequential `await` in a loop or one after another
  - Component library imports (`importComponentByKeyAsync`)
  - Variable collection fetches (`getVariableCollectionByIdAsync`)
  - Font loads (`loadFontAsync`) — especially across multiple families or generators
  - Mode lookups
- Async work is collected and batched before a processing loop — not awaited inside the loop

### Avoiding redundant calls within a single handler (code.ts)
Figma's document is live while the plugin UI is open. The `documentchange` event fires asynchronously when the user edits the file, and Figma's own documentation warns: *"If your plugin stays open for a while and stores references to nodes, you should write your code defensively and check that the nodes haven't been removed by the user."* Module-level variables in `code.ts` persist across message handlers (the sandbox stays alive until `figma.closePlugin()` is called), but any document data stored in those variables can go stale if the user edits the file between handlers.

Module-level caches of live document state are only safe if every cached node reference is checked via `node.removed` before use. For derived data structures (maps of component data, collection scans, usage indexes), that re-validation is complex and error-prone — re-fetching per handler is simpler and correct.

The safe pattern is to **pass expensive results as arguments within a single handler** rather than re-fetching inside the same call chain. Check for these intra-handler redundancies:
- `getLocalVariablesAsync`, `getLocalTextStylesAsync` — fetched once at init and passed into the operation that follows in the same handler, not called again
- `getMainComponentAsync` — called at most once per instance per handler; if a preceding scan already resolved it, the downstream function should accept the pre-built result as a parameter rather than calling a second scan

Do **not** flag it as an issue if a handler re-fetches data that a prior handler already fetched — that is intentional, because document state may have changed between the two user actions.

### Page loading scope (code.ts)
`figma.loadAllPagesAsync()` loads every page in the document into memory simultaneously. The docs explicitly warn this causes memory issues and slow loading in large files. Flag it if:
- It is called when the plugin only needs one or two specific pages — `page.loadAsync()` on just those pages is correct
- It is called on every message handler invocation rather than once when the document is genuinely needed in full

Do not flag it if the plugin's core operation genuinely requires traversing the entire document.

### Traversal efficiency (code.ts)
- `findOne()` / `findAll()` called once and results reused — not called independently per method on the same nodes (e.g. resolving the same child nodes in four separate methods)
- Tree traversals that only need the first match short-circuit — they do not collect all matches and then use `[0]`
- `findAll()` scope is as narrow as possible — not always rooted at `figma.currentPage` when a frame or component is the appropriate starting point
- The root node is excluded from child searches (a component named "image" should not match itself as its own image layer)

### Scale safety (code.ts)
- Operations on user selections handle large selections gracefully — either with a size warning, batching, or a progress indication
- No O(n×m) algorithms where a lookup map or pre-indexed structure would reduce complexity (e.g. matching source icons against target icons)
