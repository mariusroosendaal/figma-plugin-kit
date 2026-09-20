---
description: "Scaffold a new Figma plugin from figma-plugin-boilerplate-svelte. Usage: /figma-plugin-kit:scaffold [Plugin Name]"
---

# Scaffold a new Figma plugin

Set up a new Figma plugin project using [figma-plugin-boilerplate-svelte](https://github.com/mariusroosendaal/figma-plugin-boilerplate-svelte) — a Vite + Svelte 4 + TypeScript starter pre-wired with `figma-ui3-kit-svelte` and `figma-plugin-utilities`.

## Inputs to gather

If `$ARGUMENTS` is provided, use it as the plugin display name. Otherwise ask.

1. **Plugin display name** — What appears in Figma's plugin menu (e.g. "Color Tools").
2. **Description** — One-line description. Active voice, specific (e.g. "Generate WCAG contrast matrices from color variables.").
3. **Figma plugin ID** — Numeric string from [Figma's plugin developer console](https://www.figma.com/developers/apps). If the user doesn't have one yet, use `"REPLACE_WITH_PLUGIN_ID"` as a placeholder.
4. **Directory** — Where to create the project. Default: `./<plugin-display-name-kebab-case>/` in the current working directory.

## Setup steps

### 1. Clone the boilerplate

```bash
git clone https://github.com/mariusroosendaal/figma-plugin-boilerplate-svelte.git <directory>
cd <directory>
rm -rf .git
```

### 2. Install dependencies

```bash
npm install
```

### 3. Update `package.json`

Change only:
- `"name"`: kebab-case plugin name (e.g. `"color-tools"`)
- `"description"`: the user-provided description
- `"version"`: `"1.0.0"`

### 4. Update `src/manifest.json`

Change only:
- `"name"`: plugin display name (e.g. `"Color Tools"`)
- `"id"`: the Figma plugin ID

The manifest ships with these defaults — keep everything else:
```json
{
  "api": "1.0.0",
  "main": "code.js",
  "ui": "index.html",
  "capabilities": [],
  "enableProposedApi": false,
  "editorType": ["figma"],
  "networkAccess": { "allowedDomains": ["none"] },
  "documentAccess": "dynamic-page"
}
```

### 5. Replace `src/code.ts` with a minimal starter

The boilerplate ships with a demo. Replace it with a clean slate:

```typescript
figma.showUI(__html__, {
  width: 300,
  height: 400,
  themeColors: true,
});

figma.ui.onmessage = async (msg) => {
  if (msg.type === "close-plugin") {
    figma.closePlugin();
  }
};
```

### 6. Replace `src/PluginUI.svelte` with a minimal starter

```svelte
<script>
  import { PluginLayout, Header, Footer, sendToPlugin } from "figma-plugin-utilities";
  import { Button } from "figma-ui3-kit-svelte";
</script>

<div class="plugin-container">
  <Header title="[Plugin Display Name]" />
  <PluginLayout>
    <!-- Plugin content here -->
  </PluginLayout>
  <Footer>
      <Button variant="primary" on:click={() => sendToPlugin("close-plugin")}>Close</Button>
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

### 7. Delete the demo `README.md` and create a new one

Use this structure:

```markdown
# [Plugin Display Name]

[One-line description]

## What it does

[2-3 sentences]

## Usage

1. [Step 1]
2. [Step 2]
3. Click "[Primary action button label]"

## Development

\`\`\`bash
npm install
npm run dev    # Watch mode
npm run build  # Production build
\`\`\`
```

## First build and Figma import

Tell the user:

1. Run `npm run build` to produce `dist/`
2. In Figma: **Plugins → Development → Import plugin from manifest** → select `dist/manifest.json`
3. Run `npm run dev` for watch mode; enable **Hot reload plugin** in Figma's Plugin Development menu

## Key files reference

| File | Purpose |
|---|---|
| `src/code.ts` | Main thread — Figma Plugin API access |
| `src/PluginUI.svelte` | Root UI component |
| `src/main.js` | UI entry point (rarely needs editing) |
| `src/index.html` | UI shell (rarely needs editing) |
| `src/manifest.json` | Plugin metadata for Figma |
| `vite.config.ts` | Inlines CSS + JS into a single HTML file (required by Figma) |

## Packages included

- **[figma-ui3-kit-svelte](https://github.com/mariusroosendaal/figma-ui3-kit-svelte)** — 39 Svelte components matching Figma's UI3 design system (`Button`, `Input`, `Dropdown`, `Tabs`, `Text`, `Modal`, etc.). Use `/figma-plugin-kit:components` for the full reference.
- **[figma-plugin-utilities](https://github.com/mariusroosendaal/figma-plugin-utilities)** — Layout components (`PluginLayout`, `Header`, `Footer`, `StatusBar`) and utilities (`sendToPlugin`, `createMessageHandler`, color/validation helpers). Use `/figma-plugin-kit:utils` for the full reference.

## Handoff nudge

After scaffolding, give the user a short, specific nudge that bridges the gap between "here's a shell" and "here's where to start." Base it on the plugin description they provided — be concrete about the two entry points and what goes in each.

Format:
```
**Where to start:**

- `src/code.ts` — handle a `[primary-action]` message: [one sentence on what the plugin thread should do, e.g. which Figma API calls, what data to read or write]
- `src/PluginUI.svelte` — [one sentence on the key UI inputs and the primary action button]
```

Keep it to two bullets. Don't restate the description or explain the architecture — they know it's a Figma plugin. Just tell them what to put in each file to get to a working first version.

End with: "Run `/figma-plugin-kit:create` before writing any real code for additional guidance."
