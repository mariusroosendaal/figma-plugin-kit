---
description: "figma-plugin-utilities reference — layout components, message helpers, color/validation utils, and Figma helpers. Usage: /figma-plugin-kit:utils [topic]"
---

# figma-plugin-utilities reference

[figma-plugin-utilities](https://github.com/mariusroosendaal/figma-plugin-utilities) — shared Svelte layout components and utility functions for Figma plugin UIs.

If `$ARGUMENTS` names a specific component or utility, show just that. Otherwise give the full reference.

## Installation

```bash
npm install figma-plugin-utilities
```

## Imports

```javascript
// UI components + utilities
import {
  PluginLayout, Header, Footer, StatusBar,
  EmptyState, ListItem, LoadingState, FieldGroup, CheckboxCard,
  sendToPlugin, createMessageHandler,
  rgbToHex, hexToRgb, getLuminance, getContrastRatio, meetsContrastLevel,
  validateUrl, validateJsonString, sanitizeInput, sanitizeName,
  validateEmail, validateNumber, isEmpty,
  formatErrorMessage, handleAsyncError, createUserErrorMessage,
  logError, withErrorHandling, safeAsync, parseJsonSafe,
  notifyError, notifySuccess, notifyWarning,
  setDefaultWidth, getContentHeight, resizeToFit, autoResize,
} from "figma-plugin-utilities";

// Figma-sandbox helpers (use in code.ts only, not in UI)
import {
  sendToUI, showError, showSuccess, focusNodes, loadFont,
  getCollections, getVariables, getSelection, handleResize,
  saveToStorage, loadFromStorage,
} from "figma-plugin-utilities/lib/figma-helpers";
```

---

## Layout components

### PluginLayout

Scrollable main content area. Place between `<Header>` and `<Footer>`.

```svelte
<PluginLayout>
  <!-- Plugin content -->
</PluginLayout>
```

Props: `className`.

---

### Header

Top bar with optional `left`, `center` and `right` slots.

```svelte
<Header title="My Plugin" />

<!-- With icon buttons -->
<Header title="My Plugin">
  <svelte:fragment slot="left">
    <IconButton iconName={IconBack} on:click={goBack} />
  </svelte:fragment>
  <svelte:fragment slot="right">
    <IconButton iconName={IconSettings} on:click={openSettings} />
  </svelte:fragment>
</Header>

<!-- No bottom border -->
<Header title="Settings" noBorder />
```

Props: `title`, `noBorder`, `className`. Slots: `left`, `center`, `right`.

---

### Footer

Sticky bottom bar. Three layout variants.

```svelte
<!-- Right-aligned (default) -->
<Footer>
  <Button variant="primary" on:click={handleAction}>Create variants</Button>
</Footer>

<!-- Split: left + right slots -->
<Footer variant="split">
  <svelte:fragment slot="left">
    <Button variant="secondary" on:click={cancel}>Cancel</Button>
  </svelte:fragment>
  <svelte:fragment slot="right">
    <Button variant="primary" on:click={save}>Save settings</Button>
  </svelte:fragment>
</Footer>

<!-- Full-width -->
<Footer variant="full">
  <Button variant="primary">Generate styles</Button>
</Footer>
```

Props: `variant` (`"right"` | `"split"` | `"full"`), `className`. Slots: `left`, `right` (split only).

---

### StatusBar

Toast notification bar. Auto-dismisses `info` and `success` after 4 seconds.

```svelte
<script>
  let status = { message: "", type: "info" };
</script>

<StatusBar
  message={status.message}
  type={status.type}
  on:close={() => (status = { message: "", type: "info" })}
/>
```

Set status from anywhere:
```javascript
status = { message: "Variables created", type: "success" };
status = { message: "Select a frame first", type: "warning" };
status = { message: "Plugin API unavailable", type: "error" };
```

Props: `message`, `type` (`"info"` | `"success"` | `"warning"` | `"error"`), `class`. Events: `close`.

---

### EmptyState

Placeholder for empty lists or error states.

```svelte
<EmptyState message="No frames found" />

<!-- With icon and action -->
<EmptyState
  message="No variables yet"
  icon="variables"
  actions={[
    { label: "Create variables", handler: handleCreate },
    { label: "Import JSON", handler: handleImport },
  ]}
/>
```

Props: `message`, `icon`, `actions` (array of `{ label, handler }`), `action` (a single `{ label, handler }`), `size` (`"small"` | `"medium"` | `"large"`), `centered` (default `true`), `role` (default `"status"`; use `"alert"` when the state reports a failure), `class`.

---

### ListItem

Selectable row with metadata slot and optional action menu.

```svelte
<script>
  let selectedId = null;
  const menuItems = [
    { label: "Rename", value: "rename" },
    { label: "Delete", value: "delete" },
  ];
</script>

{#each items as item (item.id)}
  <ListItem
    id={item.id}
    title={item.name}
    active={selectedId === item.id}
    {menuItems}
    on:click={(e) => (selectedId = e.detail.id)}
    on:menuSelect={(e) => handleAction(e.detail.id, e.detail.action)}
  >
    <span>{item.type}</span>
  </ListItem>
{/each}
```

Props: `id`, `title`, `active`, `menuItems`, `menuOpen` (bindable), `menuButtonElement` (the anchor the menu opens against), `hasBadge` (renders the `badge` slot), `class`. Slots: default (metadata), `badge`.
Events: `click` (`detail.id`), `menuSelect` (`detail.id`, `detail.action`), `menuToggle` (`detail.id`, `detail.open`), `menuClose` (`detail.id`).

---

### LoadingState

Centred message, as `role="status"`. There is no spinner — UI3 does not use one here.

```svelte
{#if loading}
  <LoadingState message="Creating variables..." />
{/if}
```

Props: `message` (default `"Loading..."`), `class`.

---

### FieldGroup

Label + input wrapper for forms.

```svelte
<FieldGroup label="Collection name">
  <Input bind:value={name} placeholder="e.g. Colors" />
</FieldGroup>

<FieldGroup label="Mode">
  <Dropdown menuItems={modes} bind:value={selectedMode} />
</FieldGroup>
```

Props: `label`, `labelFor` (renders `<label for>`, so clicking the label focuses the control — set it for `Input` and `Textarea`; a `Dropdown` is a button and cannot be targeted this way, so name it with `ariaLabel` instead), `size`.

---

### CheckboxCard

Large checkbox with card styling, good for multi-select option lists.

```svelte
<CheckboxCard bind:checked={includeSmall}>
  Small
  <svelte:fragment slot="secondary">— 375px</svelte:fragment>
</CheckboxCard>

<CheckboxCard bind:checked={includeLarge} disabled>
  Large
</CheckboxCard>
```

Props: `checked`, `disabled`. Slot: `secondary` (optional sub-label). Events: `change` (with `{ checked }`).

---

## Message utilities

### `sendToPlugin` (UI → plugin thread)

```javascript
import { sendToPlugin } from "figma-plugin-utilities";

// Send type only
sendToPlugin("run-export");

// Send type + payload
sendToPlugin("create-variables", { collection: "Colors", values: [...] });
```

### `createMessageHandler` (plugin thread → UI)

```javascript
import { createMessageHandler } from "figma-plugin-utilities";

window.onmessage = createMessageHandler({
  success: (msg) => {
    status = { message: msg.message, type: "success" };
  },
  error: (msg) => {
    status = { message: msg.message, type: "error" };
  },
  data: (msg) => {
    items = msg.items;
  },
});
```

---

## Color utilities

```javascript
import { hexToRgb, rgbToHex, getLuminance, getContrastRatio, meetsContrastLevel } from "figma-plugin-utilities";

// Figma uses 0–1 float range for RGB
const rgb = hexToRgb("#FF0000");       // { r: 1, g: 0, b: 0 }, or null if the hex is malformed
const hex = rgbToHex({ r: 1, g: 0, b: 0 });  // "#FF0000"

// Luminance (0–1, used to compute contrast)
const lum = getLuminance({ r: 1, g: 0, b: 0 });

// WCAG contrast
const ratio = getContrastRatio(color1, color2);  // e.g. 4.5
const passes = meetsContrastLevel(ratio, "AA");  // true / false
// Levels: "AA" (4.5:1), "AAA" (7:1), "AA-large" (3:1), "AAA-large" (4.5:1)
```

---

## Validation utilities

```javascript
import {
  validateUrl, validateJsonString,
  sanitizeInput, sanitizeName,
  validateEmail, validateNumber, isEmpty,
} from "figma-plugin-utilities";

const url = validateUrl("https://example.com");
// { valid: true } or { valid: false, error: "Invalid URL format" }
validateUrl("", { required: false });          // { valid: true } — empty is allowed

const json = validateJsonString('{"key": "value"}');
// { valid: true, parsed: { key: "value" } } or { valid: false, error: "..." }
validateJsonString(text, { maxSizeKB: 512, requireObject: true });

const clean = sanitizeName("My Plugin!!!", 200); // "My Plugin" — strips special chars, "Untitled" if nothing is left
const safe = sanitizeInput("  hello  ", 50);     // stringifies, truncates to maxLength, strips control characters, trims

validateEmail("user@example.com");             // { valid: true }
validateNumber("42", { min: 1, max: 100, integer: true });  // { valid: true, value: 42 }
isEmpty("");       // true
isEmpty([]);       // true
isEmpty({});       // true
isEmpty("hello");  // false
```

---

## Error handling utilities

```javascript
import {
  safeAsync, parseJsonSafe,
  formatErrorMessage, handleAsyncError,
  createUserErrorMessage, logError, withErrorHandling,
} from "figma-plugin-utilities";

// Wrap any async operation — returns { ok, value } or { ok: false, error }
const result = await safeAsync(() => fetch(url), "Loading data");
if (result.ok) {
  console.log(result.value);
} else {
  console.error(result.error.userMessage);
}

// Safe JSON parse
const parsed = parseJsonSafe(jsonString);
// { ok: true, value: {...} } or { ok: false, error: "..." }

// Format a caught error. Returns an object, not a string; `context` prefixes the message
const formatted = formatErrorMessage(error, "Creating variables");
// { message, userMessage, technical }

// The same thing under an older name — handleAsyncError(error, operation) takes a caught
// error, not a function, and returns the formatted object
const formatted2 = handleAsyncError(error, "Creating variables");

// Just the line to show the user
const userMsg = createUserErrorMessage(error, "Failed to create variables");

// Log a caught error. `context` is a string — an object prints as [object Object]
logError(error, "createVariables");

// Run an async function, log anything it throws, then rethrow. It calls fn() with no
// arguments, so bind them at the call site
const variables = await withErrorHandling(() => createVariables(data), "Creating variables");
```

---

## Notification utilities

```javascript
import { notifyError, notifySuccess, notifyWarning } from "figma-plugin-utilities";

notifySuccess("Saved settings successfully");
notifyWarning("Using fallback colors");
notifyError("Failed to load variables");
```

---

## Resize utilities

Auto-resize the plugin window to fit content. The UI sends a `"resize"` message; `handleResize` in `code.ts` applies it.

```svelte
<!-- PluginUI.svelte -->
<script>
  import { autoResize } from "figma-plugin-utilities";
  let container;

  // Watch for content changes and resize automatically
  $: if (container) autoResize({ container, minHeight: 200, maxHeight: 600 });
</script>

<div bind:this={container}>
  <!-- content that may grow/shrink -->
</div>
```

```typescript
// code.ts — handle the resize message
import { handleResize } from "figma-plugin-utilities/lib/figma-helpers";

figma.ui.onmessage = (msg) => {
  if (msg.type === "resize") handleResize(msg);
};
```

- `setDefaultWidth(width)` — set the default width used for all resize calls
- `getContentHeight(container)` — measure element's `scrollHeight`
- `resizeToFit(options?)` — one-shot resize: `{ width, height, minHeight, maxHeight, padding, container }`
- `autoResize(options)` — watch a container via `ResizeObserver`, returns a cleanup function: `{ container, width, minHeight, maxHeight, padding, debounce, threshold }`

---

## Figma helpers (code.ts only)

These run in the plugin sandbox — import them in `code.ts`, not in Svelte UI files.

### `sendToUI`

```typescript
import { sendToUI } from "figma-plugin-utilities/lib/figma-helpers";

sendToUI("success", { message: "Variables created!" });
sendToUI("data", { items: figma.currentPage.children });
```

### `showError` / `showSuccess`

```typescript
import { showError, showSuccess } from "figma-plugin-utilities/lib/figma-helpers";

showError("Select at least one frame");   // default 5s timeout
showSuccess("Variables created!", 3000);
```

### `getCollections` / `getVariables`

```typescript
import { getCollections, getVariables } from "figma-plugin-utilities/lib/figma-helpers";

const collections = await getCollections();  // VariableCollection[]
const colorVars = await getVariables("COLOR");  // Variable[] — type is optional
```

### `getSelection`

```typescript
import { getSelection } from "figma-plugin-utilities/lib/figma-helpers";

const all = getSelection();                          // all selected nodes
const frames = getSelection<FrameNode>("FRAME");     // filtered by type
```

### `handleResize`

```typescript
import { handleResize } from "figma-plugin-utilities/lib/figma-helpers";

figma.ui.onmessage = (msg) => {
  if (msg.type === "resize") handleResize(msg);  // resizes the plugin window
};
```

### `focusNodes`

```typescript
import { focusNodes } from "figma-plugin-utilities/lib/figma-helpers";

focusNodes(figma.currentPage.selection);
// or
focusNodes([specificNode]);
```

### `loadFont`

```typescript
import { loadFont } from "figma-plugin-utilities/lib/figma-helpers";

await loadFont("Inter", "Regular");
await loadFont("Inter", "Bold");
```

### `saveToStorage` / `loadFromStorage`

```typescript
import { saveToStorage, loadFromStorage } from "figma-plugin-utilities/lib/figma-helpers";

await saveToStorage("settings", { width: 300, includeAll: true });

// Second argument is the default value if nothing is stored yet
const settings = await loadFromStorage("settings", { width: 300, includeAll: false });
```

---

## Spec frame builders (code.ts only)

Typed builders for the frames a spec or documentation generator draws on the canvas — auto-layout frames, text, token chips, colour swatches and table cells — with a light and a dark palette. Every builder that can return either takes `as: "component"` to produce a `ComponentNode` instead of a `FrameNode`.

```typescript
import {
  specTokens, loadSpecFonts,
  createAutoLayoutFrame, createAutoLayoutComponent, createText,
  createTokenChip, createColorSwatch, createTableCell, createTableHeader,
} from "figma-plugin-utilities/lib/figma-frame-builders";

// Load every font the builders use, once, before drawing anything
await loadSpecFonts();

const theme = specTokens.themes.dark;   // or .light

const row = createAutoLayoutFrame({
  name: "row",
  direction: "HORIZONTAL",   // "HORIZONTAL" | "VERTICAL" | "NONE"
  spacing: 8,
  padding: { top: 12, right: 20, bottom: 12, left: 20 },  // or a single number
  fill: theme.cellFill,
  cornerRadius: 2,
  width: 960,                // omitting width/height hugs the content
  border: { color: theme.cellBorder, width: 1 },
});

row.appendChild(createText({
  characters: "color/bg/default",
  font: specTokens.fonts.code,   // body | bodyBold | subheading | heading | code
  color: theme.text,
  lineHeight: 1.3,               // a multiplier, not px
  letterSpacing: 0.1875,
  width: 240,                    // sets textAutoResize to HEIGHT
}));

row.appendChild(createTokenChip({ label: "#FFFFFF", background: theme.chipBg, textColor: theme.text }));
row.appendChild(createColorSwatch({ color: specTokens.accentColors.blue, size: 40, inverse: true }));

const cell = createTableCell({ variant: "token", theme, text: "Background", chipLabel: "#FFFFFF", swatch: true });
const header = createTableHeader({ variant: "header", theme, title: "Colour" });
```

`specTokens` carries `accentColors` (`green`, `blue`, `purple`, `red`, annotated with their WCAG grade), `fonts` and `themes` (`light`, `dark`). Types exported alongside: `PaddingSpec`, `SpecTheme`, `NodeKind`, `NodeFor`.

`createTableCell` takes `variant` (`"text"` | `"header"` | `"token"`), `theme`, `text`, `chipLabel`, `chipBackground`, `swatch`, `swatchColor`, `chipSource` and `swatchSource` (instance an existing component instead of building one), `width`, `height`, `textSizing` (`"fill"` | `"hug"`). `createTableHeader` takes `variant` (`"header"` | `"subheader"`), `theme`, `title`, `width`, `height`.
