# Changelog

## 0.4.0

- Moved to its own repo, [mariusroosendaal/figma-plugin-kit](https://github.com/mariusroosendaal/figma-plugin-kit), which doubles as its marketplace — install with `/plugin marketplace add mariusroosendaal/figma-plugin-kit`
- `components` skill — documents ToggleButton, the ModalHeader and ModalFooter components that had no entry, and a further ~20 components' missing props and events. Corrects a Chip `active` prop that never existed, Text's `color` (a token name or CSS colour, not a keyword), and an IconButton example importing an icon from the package root
- `utils` skill — corrects the error-handling signatures (`withErrorHandling` runs the function it is given rather than wrapping it; `handleAsyncError` takes a caught error; `formatErrorMessage` returns an object), drops the claim that `sanitizeInput` escapes HTML, and documents the spec frame builders
- `mockup` skill — builds ToggleButton, and a tab counter now follows `unread` rather than selection

## 0.3.1

- Updated `components` skill with new import instructions for icons

## 0.3.0

- Renamed `conventions` skill to `create` — reflects evolved scope as active feature development reference (UI copy, code patterns, Figma API guidance) rather than passive documentation
- `utils` skill — clarified notification utilities.
- `components` skill — added components; expanded icon exports; improved examples and prop documentation

## 0.2.0

- `audit` skill — security, code quality, UX, and performance audit for Figma plugins; produces a severity-ranked report (accessibility excluded — handled by the accessibility-agents plugin)
- `conventions` skill — added Figma-specific API guidance (async API migration, page loading, `documentAccess` scoping)
- `components` skill — expanded component variants and utility references

## 0.1.0

- `scaffold` skill — set up a new plugin from figma-plugin-boilerplate-svelte
- `components` skill — figma-ui3-kit-svelte quick reference (all components, icons, design tokens)
- `utils` skill — figma-plugin-utilities quick reference (layout components, message/color/validation helpers)
- `conventions` skill — general Figma plugin dev conventions (UI copy, structure, Figma API patterns)
