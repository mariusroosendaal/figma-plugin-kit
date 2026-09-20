# figma-plugin-kit — Claude Code plugin

Claude Code plugin for building Figma plugins with [figma-plugin-boilerplate-svelte](https://github.com/mariusroosendaal/figma-plugin-boilerplate-svelte), [figma-ui3-kit-svelte](https://github.com/mariusroosendaal/figma-ui3-kit-svelte), and [figma-plugin-utilities](https://github.com/mariusroosendaal/figma-plugin-utilities).

## Skills

| Skill | Invocation | Description |
|---|---|---|
| Scaffold | `/figma-plugin-kit:scaffold [Plugin Name]` | Set up a new Figma plugin from the boilerplate |
| Components | `/figma-plugin-kit:components [component]` | figma-ui3-kit-svelte component reference |
| Utils | `/figma-plugin-kit:utils [topic]` | figma-plugin-utilities reference |
| Create | `/figma-plugin-kit:create` | Create plugin features — UI copy guidelines, code patterns, Figma API reference |
| Audit | `/figma-plugin-kit:audit [Plugin Name]` | Audit a plugin for security, code quality, UX, and performance |
| Mockup | `/figma-plugin-kit:mockup [plugin or screen]` | Build a Figma mockup of a plugin UI from real UI3 components |
| A11y | `/figma-plugin-kit:a11y` | Accessibility review calibrated for Figma plugin UIs and the UI3 kit component set |

## Install

In Claude Code:

```
/plugin marketplace add mariusroosendaal/figma-plugin-kit
/plugin install figma-plugin-kit@marius-plugins
```

The repo is its own marketplace, so those are the only two steps. `/plugin update figma-plugin-kit` picks up later releases.

Working on the plugin itself? Load it from disk instead:

```bash
claude --plugin-dir /path/to/figma-plugin-kit
```

## Usage examples

**Start a new plugin:**
```
/figma-plugin-kit:scaffold Color Tools
```
Claude gathers the description and Figma plugin ID, clones the boilerplate, and wires everything up.

**Look up a component:**
```
/figma-plugin-kit:components Dropdown
/figma-plugin-kit:components Modal
```

**Look up a utility:**
```
/figma-plugin-kit:utils sendToPlugin
/figma-plugin-kit:utils color
```

**Create features:**
```
/figma-plugin-kit:create
/figma-plugin-kit:create UI copy
```

**Audit a plugin:**
```
/figma-plugin-kit:audit Color Contrast Matrix
/figma-plugin-kit:audit Icon Swapper
```

**Review component accessibility:**
```
/figma-plugin-kit:a11y
```

**Mock a screen up in Figma:**
```
/figma-plugin-kit:mockup Spacing Sets
/figma-plugin-kit:mockup a settings panel with two tabs and a footer
```
Builds the screen from real UI3 component instances, from `PluginUI.svelte` or a description.

## Packages

| Package | Repo | What it provides |
|---|---|---|
| `figma-plugin-boilerplate-svelte` | [GitHub](https://github.com/mariusroosendaal/figma-plugin-boilerplate-svelte) | Vite + Svelte 4 + TypeScript starter |
| `figma-ui3-kit-svelte` | [GitHub](https://github.com/mariusroosendaal/figma-ui3-kit-svelte) | 39 UI3-style components, 700+ icons, design tokens |
| `figma-plugin-utilities` | [GitHub](https://github.com/mariusroosendaal/figma-plugin-utilities) | Layout components, message helpers, color/validation utils |
