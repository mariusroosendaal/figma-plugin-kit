---
description: Create plugin features — UI copy guidelines, code structure, and code patterns for plugins built with figma-plugin-boilerplate-svelte. Load this before writing any plugin UI or logic code.
---

# Create plugin features

Load this before writing any plugin UI or logic. Apply the relevant sections while building — don't just summarize them. If the user asks a specific question, answer it from these conventions; if they ask for an overview, give the full reference.

---

## UI copy guidelines

### Capitalization
- **Sentence case everywhere** — buttons, labels, headings, tooltips
- Single words can be capitalized ("Settings", "Options")
- Acronyms stay uppercase ("JSON", "CSS", "RGB")

### Buttons and CTAs
- Be specific — avoid generic labels like "Generate", "Submit", "Go"
- Use **verb + noun** format: tell the user exactly what will happen
- 2–3 words is ideal

| Good | Bad |
|---|---|
| "Create variants" | "Generate" |
| "Import variables" | "Import" |
| "Generate specs" | "Go" |
| "Resize cards" | "Apply" |
| "Create curve" | "Submit" |

### Loading states
Match the action with an `-ing` form, keep it short:
- "Creating..." for "Create variants"
- "Importing..." for "Import variables"

### Error messages
- Be helpful, not technical
- Suggest what to do next when possible
- Neutral and professional tone — no exclamation marks, no emoji

---

## Plugin structure

```
my-plugin/
├── src/
│   ├── code.ts           # Main thread — only place with Figma API access
│   ├── main.js           # UI entry point
│   ├── PluginUI.svelte   # Root UI component
│   ├── index.html        # UI shell
│   ├── manifest.json     # Plugin metadata
│   └── styles/
│       ├── global.css                   # UI3 Kit CSS variables
│       └── figma-development-theme.css  # Figma theme variables
├── vite.config.ts        # Inlines CSS+JS into a single HTML for Figma
├── tsconfig.json
├── package.json
└── dist/                 # Build output (do not commit)
```

---

## Two-thread architecture

Figma plugins run in two isolated contexts that communicate via messages:

| Thread | File | Can do |
|---|---|---|
| Plugin sandbox | `code.ts` | Access Figma API (`figma.*`), read/write nodes, variables, styles |
| UI iframe | `PluginUI.svelte` | Render HTML, handle user input, no direct Figma API access |

### Sending messages

```typescript
// UI → Plugin (in PluginUI.svelte)
import { sendToPlugin } from "figma-plugin-utilities";
sendToPlugin("my-action", { data: "value" });

// Plugin → UI (in code.ts)
import { sendToUI } from "figma-plugin-utilities/lib/figma-helpers";
sendToUI("result", { nodes: [...] });
```

### Receiving messages

```typescript
// In code.ts
figma.ui.onmessage = async (msg) => {
  if (msg.type === "my-action") { ... }
};

// In PluginUI.svelte
import { createMessageHandler } from "figma-plugin-utilities";
window.onmessage = createMessageHandler({
  result: (msg) => { ... },
  error: (msg) => { ... },
});
```

---

## Plugin UI layout pattern

The standard layout for a plugin UI using `figma-plugin-utilities`:

```svelte
<script>
  import { PluginLayout, Header, Footer, StatusBar, sendToPlugin } from "figma-plugin-utilities";
  import { Button } from "figma-ui3-kit-svelte";

  let status = { message: "", type: "info" };
</script>

<div class="plugin-container">
  <Header title="My Plugin" />

  <PluginLayout>
    <!-- Scrollable content area -->
  </PluginLayout>

  <StatusBar
    message={status.message}
    type={status.type}
    on:close={() => (status = { message: "", type: "info" })}
  />

  <Footer>
      <Button variant="primary" on:click={handleAction}>Do thing</Button>
  </Footer>
</div>

<style>
  .plugin-container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
</style>
```

---

## CSS variables

These variables are available automatically inside Figma plugins (injected by Figma when `themeColors: true` is set):

```css
/* Text */
--figma-color-text
--figma-color-text-secondary
--figma-color-text-brand
--figma-color-text-danger
--figma-color-text-disabled

/* Backgrounds */
--figma-color-bg
--figma-color-bg-secondary

/* Borders */
--figma-color-border
--figma-color-border-selected

/* Spacing (from UI3 Kit) */
--size-xxxsmall: 4px
--size-xxsmall:  8px
--size-xsmall:  16px
--size-small:   24px
--size-medium:  32px
--size-large:   40px
```

Always use these tokens instead of hardcoded values — they adapt automatically to Figma's light/dark theme.

---

## Figma API common patterns

### Show UI

```typescript
figma.showUI(__html__, {
  width: 300,
  height: 400,
  themeColors: true, // Enable Figma's CSS variable injection
});
```

### Load fonts before creating text

```typescript
import { loadFont } from "figma-plugin-utilities/lib/figma-helpers";

await loadFont("Inter", "Regular");
const text = figma.createText();
text.characters = "Hello";
```

### Client storage (persist settings)

```typescript
import { saveToStorage, loadFromStorage } from "figma-plugin-utilities/lib/figma-helpers";

await saveToStorage("settings", { theme: "dark", width: 300 });
const settings = await loadFromStorage("settings", { theme: "light", width: 300 });
```

### Async API reference — use these, not their deprecated sync equivalents

All plugins use `"documentAccess": "dynamic-page"`. The sync versions of these APIs return stale data or throw:

| Use this (async) | Not this (sync/deprecated) |
|---|---|
| `await figma.getNodeByIdAsync(id)` | `figma.getNodeById(id)` |
| `await figma.getStyleByIdAsync(id)` | `figma.getStyleById(id)` |
| `await figma.getLocalTextStylesAsync()` | `figma.getLocalTextStyles()` |
| `await node.getMainComponentAsync()` | `node.mainComponent` |
| `await node.getInstancesAsync()` | `node.instances` |
| `await node.setFillStyleIdAsync(id)` | `node.fillStyleId = id` |

### Message handler — always wrap in try/catch/finally

The `finally` block guarantees the UI unblocks even when an error is thrown mid-operation. Without it, `isLoading` stays `true` and the button stays disabled permanently.

```typescript
figma.ui.onmessage = async (msg) => {
  if (msg.type === "run") {
    try {
      const result = await doWork();
      figma.ui.postMessage({ type: "done", data: result });
    } catch (err) {
      figma.ui.postMessage({ type: "error", message: String(err) });
    } finally {
      figma.ui.postMessage({ type: "complete" }); // always unblocks the UI
    }
  }
};
```

### Parallel async calls — use Promise.all for independent operations

Sequential `await` inside a loop is the most common performance mistake. When calls don't depend on each other, run them together:

```typescript
// Wrong — sequential, slow
for (const key of keys) {
  const component = await figma.importComponentByKeyAsync(key);
}

// Right — parallel
const components = await Promise.all(
  keys.map((key) => figma.importComponentByKeyAsync(key))
);
```

This applies to: component imports, variable collection fetches, font loads, mode lookups.

### Null-check findOne / findChild before use

`findOne()` and `findChild()` return `null` when the node doesn't exist. Accessing a property on a null result crashes the plugin mid-operation:

```typescript
// Wrong
const label = frame.findOne((n) => n.name === "label") as TextNode;
label.characters = "text"; // crash if node is missing

// Right
const label = frame.findOne((n) => n.name === "label");
if (!label || label.type !== "TEXT") return;
label.characters = "text";
```

### Multi-page access — call loadAsync before accessing other pages

Only `figma.currentPage` is guaranteed to be loaded. Accessing another page's children without loading it first throws a runtime exception:

```typescript
// Wrong
const otherPage = figma.root.children.find((p) => p.name === "Icons");
otherPage.findAll(...); // throws

// Right
const otherPage = figma.root.children.find((p) => p.name === "Icons");
if (otherPage) {
  await otherPage.loadAsync();
  otherPage.findAll(...);
}
```

Only use `figma.loadAllPagesAsync()` when the operation genuinely needs every page — it loads the entire document into memory and is slow for large files.

### Settings persistence — save all user-configurable state

All user-configurable toggles, dropdowns, and inputs can, depending on the scenario, be saved to `clientStorage`and restored on open. State that resets every session feels broken:

```typescript
// On open — restore with defaults
const settings = await loadFromStorage("settings", {
  prefix: "",
  mode: "replace",
  onlyComponents: false,
});

// On change — persist immediately
await saveToStorage("settings", { ...settings, prefix: newPrefix });
```

### UI loading state — set isLoading before dispatch, not after

Set `isLoading = true` (or equivalent) at the moment of dispatch, not when the response arrives. If the response arrives before the reactive update, the button will accept a second click:

```svelte
function handleRun() {
  isLoading = true; // before sendToPlugin
  sendToPlugin("run", options);
}
```

Reset it in the response handler — and handle the error case so it always resets.

### Per-row Svelte state — never share mutable objects across rows

When rendering a list of rows that each have a dropdown or menu, each row must own its own copy of the menu items array. The `Dropdown` component mutates `item.selected` on the objects in the array — sharing the array across rows means the last row to update wins:

```typescript
// Wrong — all rows share the same array
const menuItems = options.map((o) => ({ label: o.name, value: o.id }));

// Right — each row gets its own copy
rows = matches.map((match) => ({
  ...match,
  menuItems: options.map((o) => ({ label: o.name, value: o.id, selected: false })),
}));
```

### Auto-layout — STRETCH and GROW require fixing the corresponding axis

Setting `layoutAlign = "STRETCH"` or `layoutGrow = 1` on an auto-layout child frame has no effect unless the child's corresponding sizing mode is set to `"FIXED"`. A frame can't simultaneously stretch to fill its parent and hug its children on the same axis.

The axis to fix depends on the child's own direction:

| Parent direction | What stretches/grows | Child direction | Fix this on the child |
|---|---|---|---|
| `VERTICAL` | width (counter axis) | `HORIZONTAL` | `primaryAxisSizingMode = "FIXED"` |
| `VERTICAL` | width (counter axis) | `VERTICAL` | `counterAxisSizingMode = "FIXED"` |
| `HORIZONTAL` | width (primary axis, grow) | `HORIZONTAL` | `primaryAxisSizingMode = "FIXED"` |
| `HORIZONTAL` | width (primary axis, grow) | `VERTICAL` | `counterAxisSizingMode = "FIXED"` |

```typescript
// HORIZONTAL child filling width of a VERTICAL parent
row.layoutAlign = "STRETCH";
row.primaryAxisSizingMode = "FIXED"; // row is HORIZONTAL → width = primary axis

// VERTICAL child growing to fill remaining width in a HORIZONTAL parent
chip.layoutGrow = 1;
chip.counterAxisSizingMode = "FIXED"; // chip is VERTICAL → width = counter axis
```

**Text nodes** inside a stretching frame need matching treatment — leaving `textAutoResize = "WIDTH_AND_HEIGHT"` (the default) means the text stays content-width even when the parent frame fills:

```typescript
textNode.textAutoResize = "HEIGHT";    // width is now controlled by layout
textNode.layoutAlign = "STRETCH";      // inside a VERTICAL parent
// — or —
textNode.layoutGrow = 1;               // inside a HORIZONTAL parent
```

**`MIN` / `CENTER` / `MAX` on `layoutAlign` are deprecated.** Counter-axis alignment is now set on the parent via `counterAxisAlignItems`, not on individual children.

### Network access

Figma sandboxes all network calls. If your plugin needs external URLs, declare them in `manifest.json`:

```json
"networkAccess": {
  "allowedDomains": ["https://api.example.com"]
}
```

---

## Manifest fields reference

```json
{
  "name": "Plugin Display Name",
  "id": "numeric-figma-plugin-id",
  "api": "1.0.0",
  "main": "code.js",
  "ui": "index.html",
  "editorType": ["figma"],
  "documentAccess": "dynamic-page",
  "networkAccess": { "allowedDomains": ["none"] },
  "capabilities": [],
  "enableProposedApi": false
}
```

- **`editorType`**: `["figma"]`, `["figjam"]`, or `["figma", "figjam"]`
- **`documentAccess`**: `"dynamic-page"` (can switch pages) or `"readonly"` for inspector-only plugins
- **`capabilities`**: add `"inspect"` to appear in the Inspect panel

---

## Build and development

```bash
npm run build   # Production build → dist/
npm run dev     # Watch mode (use with Figma's "Hot reload plugin")
npm run lint    # TypeScript + ESLint + Prettier check
npm run prettier # Auto-format
```

Import the built plugin in Figma: **Plugins → Development → Import plugin from manifest** → select `dist/manifest.json`.
