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
  EmptyState, ListItem, LoadingState, FieldGroup, CheckboxCard, Section, DataTable,
  FieldGrid, SteppedField, LadderBadges, CodeExportModal, RampCurve, MappingChip,
  sendToPlugin, createMessageHandler,
  rgbToHex, hexToRgb, isValidHex, getLuminance, getContrastRatio, meetsContrastLevel,
  plural, joinList,
  validateUrl, validateJsonString, sanitizeInput, sanitizeName,
  validateEmail, validateNumber, isEmpty,
  formatErrorMessage, handleAsyncError, createUserErrorMessage,
  logError, withErrorHandling, safeAsync, parseJsonSafe,
  setDefaultWidth, getContentHeight, resizeToFit, autoResize,
} from "figma-plugin-utilities";

// Figma-sandbox helpers (use in code.ts only, not in UI)
import {
  sendToUI, showError, showSuccess, focusNodes, loadFont,
  fontsOf, loadFontOnce, loadNodeFonts, setText,
  handleResize, createSettingsStore,
} from "figma-plugin-utilities/lib/figma-helpers";

// Variable helpers (code.ts only)
import {
  isVariableAlias, isColorValue, toRgba, getVariableLookup,
  resolveVariableValue, resolveVariableValueAsync,
} from "figma-plugin-utilities/lib/figma-variables";

// Color and copy utilities from code.ts (the same functions the root exports to the UI)
import { rgbToHex, isValidHex } from "figma-plugin-utilities/lib/colors";
import { plural, joinList } from "figma-plugin-utilities/lib/format";
```

A plugin that builds both threads in one Vite pass (`"build": "vite build"`) must not import the same module from both: Vite splits it into a chunk `code.js` can't load. Use `lib/colors` or `lib/format` from one thread only, or build each thread on its own (`"build": "vite build && vite build --mode code"`, as Vitrine Tools and Populate do).

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

Props: `title`, `noBorder`, `level` (the title's heading level, 1 by default; 2 or 3 for a bar inside a panel or modal), `className`. Slots: `left`, `center`, `right`. The left padding is 16px, and 8px when the `left` slot has content (tabs, buttons), whose own padding insets them.

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

Props: `variant` (`"right"` | `"split"` | `"full"`), `className`. Slots: `left`, `right` (split only). The padding is 8px, for buttons; a kit `Text` first in the split footer's `left` slot, or last in `right`, sits 16px from the edge.

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

Selectable row with metadata slot, optional buttons and an optional action menu.

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
    <Button slot="actions" variant="secondary" on:click={() => fill(item)}>
      Fill
    </Button>
  </ListItem>
{/each}
```

Props: `id`, `title`, `active`, `menuItems`, `menuOpen` (bindable), `menuButtonElement` (the anchor the menu opens against), `hasBadge` (renders the `badge` slot), `class`. Slots: default (metadata), `badge`, `actions` (buttons inside the item after its text, outside its clickable area, so they don't fire `click`).
Events: `click` (`detail.id`), `menuSelect` (`detail.id`, `detail.action`), `menuToggle` (`detail.id`, `detail.open`), `menuClose` (`detail.id`).

---

### MappingChip

One side of a source → target row, as Data Mapper, the Vitrine audit plugin and Icon Swapper draw it: a filled 24px chip with no border. It is a button — clicking it usually selects or opens what it names. Pair it with a `Dropdown` on the other side and `IconGoSmall` between them, in a grid of `var(--size-small) minmax(0, 1fr) var(--size-small) minmax(0, 1fr)` when rows have a tick.

```svelte
<script>
  import { MappingChip } from "figma-plugin-utilities";
  import { IconInstanceSmall } from "figma-ui3-kit-svelte/icons";
</script>

<MappingChip label={row.sourceName} count={row.uses} tone="secondary" title="Select these icons" on:click={() => reveal(row)} />
<MappingChip label="Button" iconName={IconInstanceSmall} tone="component" preview="Primary" />
<MappingChip label={token.name} chit={token.hex} selected={chosen} />
```

Props: `label`, `preview` (after the label, as "label · preview", in secondary text), `count` (trailing, tertiary, tabular), `iconName` or `chit` (a lead that hangs into the padding; `chit` wins), `tone` (`default` | `secondary` | `component` — text and icon color), `selected` (selection border), `disabled`, `title`, `ariaLabel`, `element` (bindable button), `class`. Slot: `lead` (a marker ahead of the lead, such as a refused write's "!"). Event: `click`.

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

### Section

A titled group of fields, as in Figma's panels: a fieldset headed by `Header`, its title strong on the left and icon buttons on the right.

```svelte
<div class="controls">  <!-- no padding: sections pad themselves -->
  <Section title="Spacing scale">
    <svelte:fragment slot="actions">
      <IconButton iconName={IconAdjust} ariaLabel="Edit breakpoints" on:click={openSetup} />
    </svelte:fragment>
    <FieldGroup label="Number of sets">…</FieldGroup>
  </Section>
  <hr />
  <Section title="Responsive spacing">…</Section>
</div>
```

Props: `title`. Slots: default (the fields, in a column with an 8px gap), `actions`. It pads its content 16px at the sides and bottom and its header runs edge to edge, so its container must not be padded; rule sections apart with an `<hr>` at `margin: 0`.

---

### DataTable

Named rows with a cell per column, laid out as a table — a set's size at each breakpoint, or a style's size and line height before and after an update. Selectable (the default), each row is a button named by its `label`, and selecting it opens the `editor` slot under it; `selectable={false}` makes a read-only table with table roles, for a review.

```svelte
<script>
  let selectedKey = null;
  $: rows = sets.map((set) => ({
    key: set.name,
    name: set.name,
    label: `${set.name}: ${set.values.join(", ")}`,
    cells: set.values.map((v, b) => ({
      text: v,
      tone: changed[b] ? "changed" : null,
      title: changed[b] ? `was ${before[b]}` : null,
    })),
    badges: set.offset ? [{ text: `+${set.offset} steps` }] : [],
    set,
  }));
</script>

<DataTable
  columns={["sm", "md", "lg"]}
  {rows}
  {selectedKey}
  on:select={(e) => (selectedKey = e.detail.key)}
>
  <svelte:fragment slot="action" let:row>
    <IconButton iconName={IconMinus} ariaLabel="Remove {row.name}" on:click={() => remove(row.key)} />
  </svelte:fragment>
  <svelte:fragment slot="editor" let:row>
    <SetEditor set={row.set} />
  </svelte:fragment>
</DataTable>
```

Props: `columns` (strings, or `{ label, title?, width?, align? }` — `width` a grid track, `2.75rem` by default; `align` `"start"` by default, `"end"` to right-align numbers), `rows`, `nameLabel` (default `"Name"`), `selectable` (default `true`), `selectedKey`, `active` (a column index to mark), `selectableColumns` (headers become buttons named "Show {label}"), `inset` (the container's side padding, e.g. `"var(--size-xsmall)"` — a modal's content too: rows, their borders and hover run edge to edge through it, their contents still aligned with the container's), `maxBadges` (default 2), `ariaLabel` (names a read-only table), `class`. The `editor` slot is wrapped with the row's bottom border, so an editor shouldn't draw its own.
A row is `{ key, name, label?, cells, tone?, removed?, badges? }` plus anything the slots need; `label` names a selectable row's button, `tone: "new"` colors the name. `badges` are `{ text, variant?, title? }` notes after the name — `title` explains one in a tooltip, e.g. what "excluded" means for the write: the first `maxBadges` show, and the rest fold into a `+N` badge whose tooltip lists them. Tooltips, not `title` attributes: a plugin's frame may not show those.
A cell is `{ text, tone?, title?, alias?, plain? }`, `tone` being `"new"`, `"changed"`, `"danger"` or `"muted"`. A cell shows as a `Badge` (success when new, warning when changed, danger when danger — a value that can't be written, say — or in a removed row), as a `VariablePill` when `alias` names the variable it aliases — set it only for values that will be aliased, not raw ones such as fluid values between a scale's steps — or as text when `plain` (colored by its tone, e.g. `"16 → 18"` changed). Muted cells are plain secondary text. Removed rows are colored danger and can't be selected; their `action` slot still renders, for a restore button.
Slots: `action` and `editor` (each with `row`), `note` (under the table). Events: `select` (the row), `column` (the index).

```svelte
<!-- A review: read-only, text cells, only the columns something writes. -->
<DataTable
  columns={[{ label: "Size", width: "4.5rem" }, { label: "Line height", width: "6rem" }]}
  rows={changes.map((c) => ({
    key: c.id,
    name: c.name,
    badges: [{ text: "update", variant: "warning" }],
    cells: [
      { text: `${c.fromSize} → ${c.size}`, tone: "changed", plain: true },
      { text: c.lineHeight, plain: true },
    ],
  }))}
  nameLabel="Style"
  selectable={false}
  inset="var(--size-xsmall)"
  ariaLabel="Styles to write"
/>
```

---

### FieldGrid

Fields side by side in equal columns. Tracks are `minmax(0, 1fr)`, so fields shrink below their content in a narrow panel.

```svelte
<FieldGrid columns={3}>
  <FieldGroup label="Base">…</FieldGroup>
  <FieldGroup label="Ratio">…</FieldGroup>
  <FieldGroup label="Steps">…</FieldGroup>
</FieldGrid>
```

Props: `columns` (default 2). Slot: default.

---

### SteppedField

A field with − and + icon buttons after it, as one cell of the caller's grid (the field grows, the buttons keep their size, bottoms aligned).

```svelte
<SteppedField
  downLabel="Step {set.name} down"
  upLabel="Step {set.name} up"
  on:step={(e) => dispatch("offset", set.offset + e.detail)}
>
  <FieldGroup label="Steps off the curve" labelFor="offset-{set.name}" size="small">
    <NumericInput value={set.offset} id="offset-{set.name}" precision={0} />
  </FieldGroup>
</SteppedField>
```

Props: `downLabel`, `upLabel` (the buttons' `ariaLabel`s — name the row, so each row's are unique). Slot: default (the field). Events: `step` (-1 or 1; what a step means is the caller's).

---

### LadderBadges

A scale's sizes as neutral badges: outlined (`default`) where something uses the size, `archived` where nothing does. The caller words each badge's tooltip.

```svelte
<LadderBadges
  ariaLabel="Spacing scale sizes in pixels"
  badges={ladder.map((rung) => ({
    value: rung.value,
    used: used.has(rung.value),
    title: used.has(rung.value) ? "Used by a set" : "Not used by a set",
  }))}
/>
```

Props: `badges` (`{ value, used, title }[]`, keyed by index, so values may repeat), `ariaLabel` (names the group). Each badge is named `"{value}px, used"` or `"{value}px, unused"`. No margin of its own.

---

### CodeExportModal

Read-only code in a `Modal` with a primary copy button in the footer. The button reads "Copied" for two seconds after a copy, per modal, and resets when the modal reopens. It copies with `execCommand("copy")`, since the plugin iframe isn't granted clipboard-write.

```svelte
<CodeExportModal
  isOpen={cssOpen}
  title="Export CSS"
  value={css}
  ariaLabel="Exported CSS"
  copyLabel="Copy CSS"
  onClose={() => (cssOpen = false)}
>
  <div slot="controls" class="css-controls">
    <SegmentedControl bind:value={unit} ariaLabel="CSS unit">…</SegmentedControl>
  </div>
</CodeExportModal>
```

Props: `isOpen`, `title`, `value`, `ariaLabel` (names the code), `copyLabel` (verb + noun, e.g. "Copy JSON"), `position` (default `"bottom"`), `width` (`"medium"`), `height` (`"auto"`), `onClose`. Slot: `controls` (optional, above the code). The code fills the modal's height.

---

### RampCurve

A ramp's quadratic Bézier at the breakpoint shown, the other breakpoints' curves faint behind it, as Vitrine Tools' heading ramp (Type tab) and "Shape the scale" (Spacing tab) draw it. The y axis is in the caller's units — px along a type ladder, rungs of a spacing one — so the caller works out the curves, grid and dots and says how a y value snaps to a rung. At the smallest and largest breakpoint the bottom, bend and top are sliders (dragged, or arrow keys: ends by a rung, the bend by 0.02 up/down and along x left/right); between them the chart says "Calculated from the endpoints." with a link to edit each end.

```svelte
<RampCurve
  ramp={rampCurve}
  curves={breakpoints.map((_, b) => rampAt(rampCurve, breakpoints, b))}
  span={[Math.min(0, ...all) - 0.5, Math.max(...all) + 0.5]}
  grid={ladder.map((r, rung) => ({ key: rung, y: rung, label: r.value }))}
  dots={sets.map((set, k) => ({ key: set.name, x: k / (sets.length - 1), y: rungOfValue(ladder, set.values[shown]), marked: set.name === open }))}
  breakpoints={breakpoints.map((b) => b.name)}
  selected={shown}
  rungCount={ladder.length}
  format={(r) => `${ladder[Math.round(r)].value}px`}
  ariaLabel="Spacing ramp"
  bottomLabel="First set"
  topLabel="Last set"
  along="sets"
  on:change={(e) => (rampCurve = { ...rampCurve, ...e.detail })}
  on:select={(e) => (shown = e.detail)}
/>
```

Props: `ramp` (`bottomSm`, `topSm`, `bottomLg`, `topLg` as rungs, `bendSm`, `bendLg` from -0.5 to 1.5, `bendPosition` along x), `curves` (each breakpoint's `[P0, P1, P2]`), `span` (`[lo, hi]` shown; held still while dragging), `grid` (`{ key, y, label }`, labels thinned to 10px apart), `dots` (`{ key, x, y, marked? }`, x from 0 to 1), `breakpoints` (names), `selected`, `rungCount`, `rungAt` (y → rung, identity by default — pass `nearestRung` for px), `format` (an end's slider text), `ariaLabel` (the chart's name; "at {breakpoint}" follows), `bottomLabel`, `topLabel`, `along` (what x runs along, for the bend's text). Events: `change` (a patch of those `ramp` keys), `select` (a breakpoint index). Work the coordinates out in `$:` statements, not in markup helpers, so they re-run.

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
import { hexToRgb, rgbToHex, isValidHex, getLuminance, getContrastRatio, meetsContrastLevel } from "figma-plugin-utilities";
// In code.ts: from "figma-plugin-utilities/lib/colors"

// Figma uses 0–1 float range for RGB
const rgb = hexToRgb("#FF0000");       // { r: 1, g: 0, b: 0 }, or null if the hex is malformed
const hex = rgbToHex({ r: 1, g: 0, b: 0 });  // "#FF0000" — channels are clamped to 0–1
rgbToHex({ r: 1, g: 0, b: 0, a: 0.5 }, { lowercase: true, alpha: true });  // "#ff000080"
rgbToHex(color, { hash: false });      // "FF0000"

isValidHex("#ff0000");                 // true — six digits, either case
isValidHex("ff0000", { requireHash: false });  // true

// Luminance (0–1, used to compute contrast)
const lum = getLuminance({ r: 1, g: 0, b: 0 });

// WCAG contrast
const ratio = getContrastRatio(color1, color2);  // e.g. 4.5
const passes = meetsContrastLevel(ratio, "AA");  // true / false
// Levels: "AA" (4.5:1), "AAA" (7:1), "AA-large" (3:1), "AAA-large" (4.5:1)
```

---

## Copy utilities

```javascript
import { plural, joinList } from "figma-plugin-utilities";
// In code.ts: from "figma-plugin-utilities/lib/format"

plural(1, "layer");                    // "1 layer"
plural(3, "entry", "entries");         // "3 entries"
joinList(["a", "b", "c"]);             // "a, b and c"
joinList(["a", "b"], "or");            // "a or b"
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
- `resizeToFit(options?)` — one-shot resize: `{ width, height, minHeight, maxHeight, padding, container }`. Pass `container`: the default, `document.body`, fills the window (the kit sets `html, body, #app { height: 100% }`), so it measures the window rather than the content
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

await loadFont("Inter", "Regular");   // once per run, as loadFontOnce
await loadFont("Inter", "Bold");
```

### `fontsOf` / `loadFontOnce` / `loadNodeFonts` / `setText`

Figma refuses to write to text whose fonts aren't loaded. These write in the layer's own fonts, whatever the library uses, and load each font once per run: hundreds of cells wait once per font, not a round trip each.

```typescript
import { setText, loadNodeFonts, loadFontOnce, fontsOf } from "figma-plugin-utilities/lib/figma-helpers";

await setText(cell, "16px");          // loads the node's fonts, then sets its characters
await loadNodeFonts(node);            // before deleteCharacters, setRangeFontName…
await loadFontOnce({ family: "Inter", style: "Bold" });
fontsOf(node);                        // the node's font, or each run's when mixed
```

All reject when a font won't load (a missing font), leaving the text as it was; a failed load is forgotten, so the next call tries again. Wrap them where a plugin wants a boolean, a fallback font or its own error.

### `createSettingsStore`

Settings in clientStorage, cleaned by one function on load and on save, so what a plugin saves is always what it would load. `sanitize` takes anything — a value an older version stored, a message from the UI, `undefined` on first run — and returns complete settings.

```typescript
import { createSettingsStore } from "figma-plugin-utilities/lib/figma-helpers";

const settings = createSettingsStore("settings", (raw) => {
  const r = (raw ?? {}) as Partial<Settings>;
  return {
    width: typeof r.width === "number" && r.width > 0 ? r.width : 300,
    includeAll: typeof r.includeAll === "boolean" ? r.includeAll : false,
  };
});

sendToUI("SETTINGS", { settings: await settings.load() });
const saved = await settings.save({ ...current, ...msg.patch }); // merge a partial update first
```

Storage errors are logged, not thrown; a failed load returns `sanitize(undefined)`.

---

## Variable helpers (`lib/figma-variables`, code.ts only)

```typescript
import {
  isVariableAlias, isColorValue, toRgba,
  getVariableLookup, resolveVariableValue, resolveVariableValueAsync,
} from "figma-plugin-utilities/lib/figma-variables";

isVariableAlias(value);   // value is VariableAlias
isColorValue(value);      // value is RGB | RGBA
toRgba(value);            // RGBA with a: 1 where it has none, or null

// Many lookups: read the local variables and collections once
const lookup = await getVariableLookup();   // { variables, collections }, maps by id
const size = resolveVariableValue(variable, modeId, lookup);   // sync, local only

// Through enabled libraries too: fetches what the lookup lacks (or everything, without one)
const color = toRgba(await resolveVariableValueAsync(alias, null));
```

Both follow aliases to a value that isn't one, starting from a variable or an alias. `modeId` null reads the default mode. Each variable down the chain is read at the same mode where its collection has it — an alias within one collection — and at its own default mode otherwise. They return `VariableValue | null`, null where the chain leaves the file (sync) or runs past `maxDepth` (10), so check the type: `typeof v === "number"`, `toRgba(v)`.

---

## Scale math (`lib/scale`, both threads)

Pure math for plugins that shape a scale across breakpoints (Vitrine Tools' Type and Spacing tabs): no Figma API, so the sandbox and the UI may both import it — the plugin must then build each thread in its own Vite pass (`vite build && vite build --mode code`), or the shared module becomes a chunk `code.js` can't load. Units are the caller's (px, ladder rungs…); nothing here maps values onto a ladder.

```typescript
import {
  bezier, clampPosition, levelT, lerp, roundHalfDown,
  blendAt, valueAtWidth, FALLBACK_WIDTHS, isBreakpointName, widthsFor,
  fluidClamp, trimNumber,
} from "figma-plugin-utilities/lib/scale";

const widths = widthsFor(["sm", "md", "lg"], { sm: 375 }); // [375, 768, 1024]
const t = blendAt(1, widths.length, widths);                // 0…1 by viewport width
const size = valueAtWidth(widths, [16, 18, 24], 900);        // straight between, held beyond
const css = fluidClamp(16, 24, 375, 1024, (px) => `${trimNumber(px / 16)}rem`);
```

- `bezier(t, p0, p1, p2)`, `clampPosition(c)` (0.02–0.98), `levelT(x, c)` — the ramp's quadratic Bézier, its bend position, and t for a point at x with the bend at c
- `blendAt(index, count, widths?)` — a breakpoint's place 0…1, by width when all are known and widen, else by position
- `valueAtWidth(widths, values, width, stepped?)` — straight between breakpoints (fluid) or the last one at or below (stepped), held beyond the ends
- `FALLBACK_WIDTHS`, `isBreakpointName(name)`, `widthsFor(names, known)` — widths by breakpoint name when a file has none; out of order or unknown, 400px past the one before
- `fluidClamp(from, to, w0, w1, length)` — a linear `clamp()` over vw, or `length(from)` when constant; `trimNumber(n, places)` writes numbers without trailing zeros
- `lerp`, `roundHalfDown` (halves round down: 16 16 18 18 20)

## Spec frame builders (code.ts only)

Typed builders for the frames a spec or documentation generator draws on the canvas — auto-layout frames, text, token chips, color swatches and table cells — with a light and a dark palette. Every builder that can return either takes `as: "component"` to produce a `ComponentNode` instead of a `FrameNode`.

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
  lineHeight: 1.4,               // a multiplier, not px
  letterSpacing: 0.18,           // px
  width: 240,                    // sets textAutoResize to HEIGHT
}));

row.appendChild(createTokenChip({ label: "#FFFFFF", background: theme.chipBg, textColor: theme.text }));
row.appendChild(createColorSwatch({ color: specTokens.accentColors.blue, size: 40, inverse: true }));

const cell = createTableCell({ variant: "token", theme, text: "Background", chipLabel: "#FFFFFF", swatch: true });
const header = createTableHeader({ variant: "header", theme, title: "Color" });
```

`specTokens` carries `accentColors` (`green`, `blue`, `purple`, `red`, annotated with their WCAG grade), `fonts` and `themes` (`light`, `dark`; `headerBorder` is set on `light` only). The builders mirror the Vitrine spec library's layer names — a chip is `label` with a `label` text layer, a token cell holds it in a `tokens` row, and both header variants name their text `title` — so lookups work on library instances and fallbacks alike. Types exported alongside: `PaddingSpec`, `SpecTheme`, `NodeKind`, `NodeFor`.

`createTableCell` takes `variant` (`"text"` | `"header"` | `"token"`), `theme`, `text`, `chipLabel`, `chipBackground`, `swatch`, `swatchColor`, `chipSource` and `swatchSource` (instance an existing component instead of building one), `width`, `height`, `textSizing` (`"fill"` | `"hug"`). `createTableHeader` takes `variant` (`"header"` | `"subheader"`), `theme`, `title`, `width`, `height`.
