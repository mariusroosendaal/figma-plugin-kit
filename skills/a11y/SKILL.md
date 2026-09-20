---
description: Accessibility review for Figma plugin UI. Covers labels, ARIA, error states, disabled buttons, dynamic announcements, and tabs — calibrated for a designer audience using figma-ui3-kit-svelte components. 
---

# Figma plugin accessibility

Apply these guidelines when writing or reviewing `PluginUI.svelte` and any Svelte component in a plugin. This skill is calibrated for Figma plugins: the audience is designers, screen reader usage is low, and correctness and UX quality are the primary drivers — not strict WCAG conformance.

---

## Calibration

**Do** — these are also correctness or UX fixes that benefit all users:
- Wire `<label for>` on every `Input` and `Textarea` — enables click-to-focus for everyone
- Pass `ariaLabel` to every `Dropdown`, `IconButton`, `Switch`, and `Checkbox` without a visible label
- Use `role="alert"` on error states — announces errors without requiring a screen reader focus move
- Wrap disabled primary buttons in `<Tooltip label={reason}>` — UX fix first, a11y second
- Add `aria-live="polite"` to result areas that update without a page reload
- Include `<title>` in `src/index.html`

**Skip or deprioritize** — screen-reader-only benefits with real implementation cost:
- Strict heading hierarchy (`<h1>`, `<h2>`, etc.) inside plugin iframes
- `role="group"` / `<fieldset>` on checkbox groups unless the grouping is genuinely ambiguous
- `aria-live` on state changes that are visually unambiguous (button text updating, spinner visible)
- Visually-hidden live regions for operation completion when `figma.notify()` already fires — the notification is the user-facing signal; a hidden `aria-live` region duplicates it for an audience that isn't the target
- Full WCAG 2.2 AA screen reader compliance — not the target for this audience

---

## Labels and accessible names

### Input and Textarea

Always associate a visible label. The `Input` component supports `ariaLabel` and `ariaLabelledBy` as fallbacks, but a connected `<label for>` is preferred because it enables click-to-focus for all users.

```svelte
<!-- With FieldGroup (preferred — renders <label for> automatically) -->
<FieldGroup label="Layer name" labelFor="layer-name-input">
  <Input id="layer-name-input" bind:value={layerName} />
</FieldGroup>

<!-- Without FieldGroup — wire manually -->
<label for="prefix-input">Prefix</label>
<Input id="prefix-input" bind:value={prefix} />

<!-- Fallback when no visible label is possible -->
<Input ariaLabel="Search icons" bind:value={query} />
```

Note: `FieldGroup` with a `Dropdown` child cannot use `labelFor` — buttons cannot be targeted by `<label>`. Pass `ariaLabel` directly to the `Dropdown` instead.

### Dropdown

Always pass `ariaLabel`. The component falls back to `placeholder` if `ariaLabel` is omitted, but `placeholder` changes when a value is selected, making the control name unstable.

```svelte
<!-- Wrong — control name changes when selection changes -->
<Dropdown placeholder="Select collection" {menuItems} />

<!-- Right -->
<Dropdown ariaLabel="Source collection" placeholder="Select collection" {menuItems} />
```

### IconButton

`ariaLabel` is required. The component already logs a console warning if it's missing. Include the action target in the label — not just the icon name.

```svelte
<IconButton ariaLabel="Open settings" iconName={IconSettings} />
<IconButton ariaLabel="Remove {item.name}" iconName={IconMinus} />
```

### Per-row controls in lists

When the same control type appears in every row (dropdowns, buttons), each must have a unique label that includes the item it acts on. Generic labels like `ariaLabel="Target"` repeated across rows are indistinguishable.

```svelte
{#each matches as match}
  <Dropdown
    ariaLabel="Target for {match.sourceName}"
    {menuItems}
    bind:value={match.target}
  />
{/each}
```

### Switch and Checkbox

Pass `ariaLabel` when there is no adjacent visible label connected by `<label for>`. If the visible label is a sibling text node rather than a proper `<label>`, the component needs `ariaLabel`.

```svelte
<Switch ariaLabel="Limit to components only" bind:checked={onlyComponents} />
```

---

## Error and validation states

### Input validation

The `Input` component wires `aria-invalid` and `aria-describedby` automatically when you pass the `invalid` and `errorMessage` props. Use these — do not add separate error elements manually.

```svelte
<Input
  id="hex-input"
  bind:value={hex}
  invalid={!isValidHex(hex)}
  errorMessage="Enter a valid hex color (e.g. #FF0000)"
/>
```

Validate before dispatch, not only on the plugin side. An invalid value that silently resets to a default is a UX failure.

### Standalone error messages

If an error appears outside an `Input` (e.g. a banner-level error), add `role="alert"` so it's announced immediately without requiring focus to move to it.

```svelte
{#if error}
  <div role="alert" class="error-message">{error}</div>
{/if}
```

`StatusBar` already handles this — it sets `role="alert"` for `type="error"` and `type="warning"`, and `role="status"` for others. Prefer `StatusBar` over a custom error div.

---

## Disabled states

When a disabled primary action needs to explain why it's unavailable, wrap it in `<Tooltip>`. The `disabled` prop on `Tooltip` controls whether the tooltip itself is active — set it to `true` when the button is enabled (no explanation needed), `false` when the button is disabled (show the reason):

```svelte
<Tooltip label={tooltipLabel} disabled={canGenerate}>
  <Button
    variant="primary"
    disabled={!canGenerate}
    on:click={handleGenerate}
  >
    Generate matrix
  </Button>
</Tooltip>
```

This is the established pattern across the collection (Color Contrast Matrix, Easing Curve Visualizer, Icon Swapper).

When keyboard accessibility matters — use `ariaDisabled` instead of `disabled`. The button stays in the tab order, so keyboard users can focus it and trigger the tooltip to learn why it's unavailable:

```svelte
<Tooltip label={tooltipLabel} disabled={canGenerate}>
  <Button
    variant="primary"
    ariaDisabled={!canGenerate}
    on:click={handleGenerate}
  >
    Generate matrix
  </Button>
</Tooltip>
```

Do not pass `aria-disabled` as a raw HTML attribute — `Button` does not spread `$$restProps`, so it would have no effect. Use the `ariaDisabled` prop.

---

## Dynamic content announcements

### Results that update

When a results area updates after user action (recalculated values, match list, generated output), add `aria-live="polite"` to the container so changes are announced at the next opportunity.

```svelte
<div aria-live="polite">
  {#if results.length}
    <p>{results.length} matches found</p>
  {/if}
</div>
```

### When NOT to add aria-live

Do not add `aria-live` to:
- A button whose label changes from "Generate" to "Generating..." — the visual change is sufficient
- A spinner that appears — visually obvious
- A progress bar that fills — visually obvious

Over-announcing creates noise. Only add `aria-live` when the update could be missed by someone not watching the screen.

---

## Tabs

The `Tabs` component uses `aria-controls` to associate each tab with its panel. `aria-controls` must reference an element that is in the DOM — it cannot reference a panel that is conditionally rendered with `{#if}`.

**If panels use `{#if}`** — two options:

Option A: Switch to `hidden` so both panels are always in the DOM:
```svelte
<div role="tabpanel" id="panel-a" aria-labelledby="tab-a" hidden={selectedTab !== 0}>
  ...
</div>
```

Option B: Omit `panelIds` from `<Tabs>` and rely on `aria-labelledby` on each panel — also valid per the ARIA Authoring Practices Guide:
```svelte
<Tabs tabs={["Settings", "Preview"]} bind:selectedTab />

<div role="tabpanel" aria-labelledby="...">...</div>
```

Do not pass `panelIds` to `<Tabs>` when panels are conditionally rendered — the `aria-controls` reference will point to nothing.

---

## Icons

Decorative icons inside buttons or labelled controls do not need alt text — the button or control label covers the meaning.

```svelte
<!-- Icon inside a labelled button — no extra label needed -->
<!-- Icon hides itself from AT automatically when no ariaLabel is passed -->
<Button>
  <Icon iconName={IconPlus} />
  Add layer
</Button>
```

Standalone icon buttons always need `ariaLabel` on the `IconButton` — see the Labels section above.

---

## Modal

The `Modal` component handles focus trap, focus return to the trigger on close, `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` automatically. No extra work is needed for these.

You are responsible for:
- Providing a `title` prop to `Modal` — this is what `aria-labelledby` points to (Modal renders `ModalHeader` internally using it)
- Providing an `onClose` callback — Modal uses a callback prop, not a Svelte event
- Triggering the modal open from a button (so focus return works correctly)

```svelte
<Modal isOpen={settingsOpen} title="Settings" onClose={handleClose}>
  ...
</Modal>
```

---

## Document structure

Every plugin must have a `<title>` element in `src/index.html`. It is the only heading-level structure required.

```html
<title>Color Contrast Matrix</title>
```

Heading hierarchy (`<h1>`, `<h2>`, etc.) inside the plugin iframe is deprioritized — do not add headings to satisfy a WCAG check if the visual design does not call for them.

---

## EmptyState and LoadingState

`LoadingState` already uses `role="status"` — no extra work needed.

`EmptyState` defaults to `role="status"`. Override it when the context calls for something different:
- For an error state ("could not load"): pass `role="alert"` for immediate announcement
- For a purely decorative or initial state ("nothing selected yet"): pass `role=""` to remove the role entirely

```svelte
<EmptyState message="No icons found" role="status" />  <!-- default, fine for search empty -->
<EmptyState message="Could not load variables" role="alert" />  <!-- error -->
<EmptyState message="Select frames to get started" role="" />   <!-- decorative initial state -->
```

Do not use `EmptyState` to show active selection status or counts that update while the plugin is in use — use a plain status text or `StatusBar` instead.
