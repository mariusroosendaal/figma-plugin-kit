# Changelog

## 1.2.0 - 2026-10-15

Follows figma-ui3-kit-svelte 0.8.0 and figma-plugin-utilities 0.6.0.

- `components` — documents **ColorPicker** (and ColorInput's `picker="panel"`), **Dropzone** and **SidebarRow**; Modal's `beforeClose`; `invalid` and `errorMessage` on Dropdown, and `invalid` on NumericInput; several badges on Dropdown and menu items; Badge's colored dots; and importing any icon by path
- `utils` — documents **Section**, **DataTable**, **FieldGrid**, **SteppedField**, **LadderBadges**, **CodeExportModal**, **ConfirmModal** (with `confirmAction` and `confirmDiscardChanges`), **RampCurve** and **MappingChip**; FieldGroup's `hint`, ListItem's `actions` slot and Header's `level`; `showNotice`; `plural`, `joinList` and `UNDO`; `isValidHex` and `rgbToHex`'s options; the font helpers and `createSettingsStore`; `lib/figma-variables`, `lib/scale` and the shared Vite config. Drops the helpers the package removed: `notifyError`, `notifySuccess`, `notifyWarning`, `getCollections`, `getVariables`, `getSelection`, `saveToStorage` and `loadFromStorage`
- `create` — text sizes, the order of a review dialog, and notifications picked by outcome (`showError`, `showNotice`, `showSuccess`); settings through `createSettingsStore`
- `audit` — checks notifications against those rules, and input validated next to the field rather than after the click
- `scaffold` — the shared Vite config, and a README that follows the repository's template when it has one
- `a11y` — Textarea, Dropdown and Dropzone announce field errors as alerts, as Input does

## 1.1.0 - 2026-09-21

Follows figma-ui3-kit-svelte 0.6.0 and figma-plugin-utilities 0.4.0.

- `components` — documents **LinkTooltip**, Button's `figjam` variant, NumericInput's presets (combo input), and Tooltip's delays and flipping
- `utils` — the spec frame builders mirror the Vitrine spec library: its colors, type and layer names (`label` chips, a `tokens` row in token cells, `title` in both header variants), and the light theme's `headerBorder`

## 1.0.0 - 2026-09-20

First release, from its own repo — which is also its marketplace:

```
/plugin marketplace add mariusroosendaal/figma-plugin-kit
/plugin install figma-plugin-kit@marius-plugins
```

Six skills for building Figma plugins with
[figma-plugin-boilerplate-svelte](https://github.com/mariusroosendaal/figma-plugin-boilerplate-svelte),
[figma-ui3-kit-svelte](https://github.com/mariusroosendaal/figma-ui3-kit-svelte) and
[figma-plugin-utilities](https://github.com/mariusroosendaal/figma-plugin-utilities):

- `scaffold` — set a new plugin up from the boilerplate
- `create` — build features: UI copy rules, code structure, the patterns the plugins share
- `components` — the figma-ui3-kit-svelte reference: every component, its props and events, the icons and the design tokens
- `utils` — the figma-plugin-utilities reference: layout components, message helpers, color, validation and error handling, the Figma helpers and the spec frame builders
- `audit` — security, code quality, UX and performance, reported by severity
- `a11y` — accessibility review calibrated for plugin UIs and this component set
