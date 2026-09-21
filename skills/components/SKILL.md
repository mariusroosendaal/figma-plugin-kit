---
description: "figma-ui3-kit-svelte component reference — all components, icons, and design tokens. Usage: /figma-plugin-kit:components [component name]"
---

# figma-ui3-kit-svelte component reference

[figma-ui3-kit-svelte](https://github.com/mariusroosendaal/figma-ui3-kit-svelte) — 40 Svelte 4 components matching Figma's UI3 design system, with light/dark theme support and 700+ icons.

If `$ARGUMENTS` names a specific component, show just that component's usage. Otherwise give the full reference.

## Installation

```bash
npm install figma-ui3-kit-svelte
```

Import components from the package root and named icon exports from the dedicated icons entrypoint:

```javascript
import {
  Avatar,
  Badge,
  Banner,
  Button,
  Checkbox,
  Chip,
  Chit,
  ColorInput,
  Disclosure,
  DisclosureItem,
  Dropdown,
  Icon,
  IconButton,
  IconToggle,
  Input,
  Label,
  LinkTooltip,
  Menu,
  MenuDivider,
  MenuHeading,
  MenuItem,
  Modal,
  ModalFooter,
  ModalHeader,
  NumericInput,
  NumericInputMulti,
  Radio,
  RadioGroup,
  Segment,
  SegmentedControl,
  Slider,
  SplitButton,
  Switch,
  Tabs,
  Text,
  Textarea,
  ToggleButton,
  Tooltip,
  Tree,
  VariablePill,
} from "figma-ui3-kit-svelte";

import {
  IconBack,
  IconCheck,
  IconClose,
  IconCloseSmall,
  IconPlus,
  IconMinus,
  IconMore,
  IconSettings,
  IconSettingsSmall,
  IconExportSmall,
  IconSearch,
  IconTrash,
  IconWarning,
  IconArrow,
  IconChevronRight,
  IconChevronDown,
  IconChevronUp,
  IconInstanceSmall,
  IconBooleanSmall,
  IconInstanceSwapSmall,
  IconImageSmall,
  IconTextSmall,
  IconShapeTextSmall,
  IconLinkSmall,
  IconNumberSmall,
  IconListView,
  IconInfoSmall,
  IconGoSmall,
  IconInteraction,
  IconConditional,
  IconSwatchSmall,
  IconEyeSmall,
  IconHiddenSmall,
  IconLinkBroken,
  IconLinkConnected,
  IconStyles,
  IconPlay,
  Icon16Check,
  Icon16Close,
  Icon16Plus,
  Icon16Warning,
  Icon16Arrow,
  Icon16ChevronRight,
  Icon16ChevronDown,
} from "figma-ui3-kit-svelte/icons";
```

Enable Figma theme support in `code.ts`:

```typescript
figma.showUI(__html__, { themeColors: true, width: 300, height: 400 });
```

---

## Components

### Button

```svelte
<Button variant="primary" on:click={handler}>Create variants</Button>
<Button variant="secondary" on:click={handler}>Cancel</Button>
<Button variant="destructive" on:click={handler}>Delete</Button>
<Button variant="secondary-destructive" on:click={handler}>Remove</Button>
<Button variant="inverse">Inverse</Button>
<Button variant="success">Done</Button>
<Button variant="figjam">Open in FigJam</Button>
<Button variant="link" on:click={handler}>Learn more</Button>
<Button variant="link-danger" on:click={handler}>Delete account</Button>
<Button variant="ghost">Ghost</Button>
<Button size="large" variant="primary">Large</Button>
<Button size="wide" variant="primary">Full width</Button>
<Button variant="primary" iconName={IconCheck}>With icon</Button>
<Button disabled>Unavailable</Button>
```

Props: `variant` (`"primary"` | `"secondary"` | `"destructive"` | `"secondary-destructive"` | `"inverse"` | `"success"` | `"figjam"` | `"link"` | `"link-danger"` | `"ghost"`), `size` (`"default"` | `"large"` | `"wide"`), `iconName` (SVG import), `iconLead` (`"left"` | `"center"`, wide variant only), `label`, `disabled`, `ariaDisabled`, `ariaLabel`, `type` (`"button"` | `"submit"` | `"reset"`), `class`. Bind the element with `bind:element`.

`ariaDisabled` keeps the button in the tab order while blocking clicks and applying disabled styling — use it instead of `disabled` when a `<Tooltip>` needs to be keyboard-accessible (so users can focus the button and read why it's unavailable).

---

### Input

```svelte
<Input bind:value={text} placeholder="Layer name..." />
<Input bind:value={text} disabled />
```

Props: `value`, `placeholder`, `type`, `disabled`, `id`, `name`, `iconName` (lead icon), `size` (`"default"` 24px | `"large"` 32px), `invalid` and `errorMessage` (the message renders under the field and names it through `aria-describedby`), `ariaLabel`, `ariaLabelledBy`, `class`. Use `NumericInput` for numbers.

---

### Textarea

```svelte
<Textarea bind:value={content} placeholder="Paste JSON here..." rows={4} />
```

Props: `value`, `placeholder`, `rows`, `disabled`, `readonly`, `id`, `name`, `variant`, `invalid` and `errorMessage`, `ariaLabel`, `ariaLabelledBy`, `class`.

---

### NumericInput

```svelte
<NumericInput bind:value={x} label="X" ariaLabel="X position" />
<NumericInput bind:value={opacity} iconName={IconOpacity} unit="%" min={0} max={100} />
<NumericInput bind:value={size} options={[12, 14, 16, 24]} min={1} precision={0} />
<NumericInput value={null} placeholder="Mixed" label="W" />
```

Props: `value` (number, or `null` for the placeholder), `min`, `max`, `step`, `precision` (decimals kept; default 2), `label` (lead letter), `iconName` (lead icon), `unit`, `placeholder`, `options` (numbers or `{ label, value }`; adds a presets chevron), `disabled`, `id`, `name`, `ariaLabel`, `variable` (see below). Events: `change` (committed value), `input` (while scrubbing), `detach` and `variableClick` (both bound-only, with the variable name).

Dragging the lead scrubs the value; ArrowUp/ArrowDown step it (Shift ×10); Enter commits, Escape reverts. Typed arithmetic works (`24*2`); anything unreadable reverts. Values commit on Enter, blur or a step — not on every keystroke.

A value bound to a variable shows as a pill with a detach button, as in UI3:

```svelte
<NumericInput value={8} label="W" variable={boundTo} on:detach={() => (boundTo = null)} ariaLabel="Width" />
```

While bound, the pill is the field's control: it takes the field's `id` (so a `<label for>` still reaches it), stays in the tab order, and fires `variableClick` when picked — bind a new variable there. The field is not editable and does not scrub until it is detached.

With `options` the field is UI3's combo input: a presets chevron at its end. A bound combo shows the pill with the chevron and no detach button; picking a preset fires `detach` before `change`, so clear the binding there.

---

### NumericInputMulti

```svelte
<script>
  import { NumericInputMulti } from "figma-ui3-kit-svelte";
  import IconRadius from "figma-ui3-kit-svelte/src/icons/24/icon.24.radius.top.left.svg";
  let radii = [8, 8, 0, 0];
</script>

<NumericInputMulti bind:values={radii} iconName={IconRadius} min={0}
  ariaLabels={["Top left", "Top right", "Bottom right", "Bottom left"]} />
```

Props: `values`, `min`, `max`, `step`, `precision`, `iconName` or `label` (lead), `ariaLabel` (names the field; falls back to `label`), `ariaLabels` (names each cell), `placeholder`, `disabled` (one flag, or one per cell). Events: `change` and `input` with `{ values, index }` (`index` is -1 when the lead scrubs every cell).

Each cell is a spinbutton in its own right, so each needs a name. Pass `ariaLabels` where the cells mean different things (corners, sides); without it they are numbered off `ariaLabel` or `label`.

---

### VariablePill

```svelte
<VariablePill label="spacing/8" />
<VariablePill label="spacing/8" selected />
```

Props: `label`, `selected`, `onSelected` (inside a selected field or row), `muted` (soft-deleted, or the value isn't rendered), `disabled`. Display only; wrap it in a button to make it act.

---

### ColorInput

```svelte
<ColorInput bind:value={hex} bind:opacity on:change={(e) => apply(e.detail)} />
<ColorInput value="#0D99FF" />
<ColorInput value="#FF24BD" variable="bg-assistive" />
```

Props: `value` (`#RRGGBB`), `opacity` (0–100; `null` hides the opacity cell), `variable` (bound variable name, shown instead of the hex), `pickable` (chit opens the system picker; default `true`), `disabled`, `id`, `ariaLabel`. Events: `change` and `input` (picker drag) with `{ value, opacity }`.

The hex field takes 3, 6 or 8 digits with or without `#`; 8 digits also set the opacity.

---

### Chit

```svelte
<Chit color="#0D99FF" />
<Chit color="#FF24BD" opacity={24} />
<Chit color={['#E8E7E5', '#212020']} ariaLabel="Light and dark" />
<Chit color="linear-gradient(90deg, #FF7262, #FFC700)" shape="circle" />
```

Props: `color` (any CSS colour or gradient, or an array of colours drawn as slices), `opacity` (0–100), `image` (URL), `shape` (`"square"` | `"circle"`), `ariaLabel` (set when the colour is information), `class`.

A 24px cell like an icon, holding UI3's 14px square (or 16px circle). A translucent colour splits: opaque left, true alpha over the checkerboard right. No colour draws a dashed empty chit. Menu items and `ColorInput` use it.

---

### Dropdown

```svelte
<script>
  const options = [
    { label: "Small", value: "sm" },
    { label: "Medium", value: "md" },
    { label: "Large", value: "lg" },
  ];
  let selected = options[0];
</script>

<Dropdown menuItems={options} bind:value={selected} placeholder="Select size" />
```

A lead, and a badge before the chevron:

```svelte
<Dropdown
  menuItems={collections}
  bind:value={collection}
  chit={["#1c7ed6", "#f76707"]}
  label="Palette"
  badge="2 modes"
  badgeVariant="variable"
  searchable
/>
```

Props: `menuItems` (array of `{ label, value }`; takes Menu's item fields — a chosen item's `iconName` or `chit` shows in the button), `value`, `placeholder`, `disabled`, `iconName`, `chit` (a lead chit when no chosen item carries one; wins over `iconName`), `label` (button text when it should not be the chosen item's menu label — a menu row can carry more than the button has room for; `""` shows the placeholder whatever is chosen), `badge` and `badgeVariant` (the kit Badge's `text` and `variant`), `size` (`"default"` | `"large"`), `stroke` (`false`: no border until hovered), `showGroupLabels`, `searchable`, `searchPlaceholder`, `ariaLabel`, `class`. Events: `change` (the chosen item).

Without `ariaLabel` the button is named by what it shows, badge included — set it only when that isn't enough.

UI3's own Dropdown carries neither a lead chit nor a badge; the **Dropdown badge** set on the Kit additions page covers that trigger, and its Code Connect maps back onto this same component.

---

### Tabs

```svelte
<script>
  const tabs = [{ label: "Local", badge: 3, unread: true }, { label: "Libraries", badge: 21 }, { label: "Export" }];
  let selectedTab = 0;
</script>

<Tabs {tabs} bind:selectedTab />

{#if selectedTab === 0}
  <!-- Local panel -->
{/if}
```

Props: `tabs` (strings or `{ label, badge?, unread? }`), `selectedTab` (0-based index), `onTabChange`, `panelIds` (for `aria-controls`), `id` (prefix for the tab ids), `class`.

The counter takes its look from UI3's "Badge small alt": `unread` makes it blue (Count New) on any tab, otherwise the selected tab gets the filled grey Default and the rest Count Inactive. An unread count is also labelled "N new", since its colour is the only thing that says so.

---

### Text

```svelte
<Text variant="heading-large">Title</Text>
<Text variant="heading-medium">Section</Text>
<Text variant="heading-small">Label</Text>
<Text variant="body-large">Body text</Text>
<Text variant="body-medium">Body text</Text>
<Text variant="body-small" color="--figma-color-text-secondary">Helper text</Text>
<Text variant="body-medium-strong">Bold body</Text>
```

Props: `variant` (see above), `color` (a Figma colour token name such as `"--figma-color-text-secondary"`, or any CSS colour; default `"--figma-color-text"`), `align` (`"start"` | `"center"` | `"end"`), `block` (renders as a block), `as` (the element, default `"span"`), `text` (or slot), `class`.

---

### Checkbox

```svelte
<Checkbox bind:checked={isEnabled}>Enable feature</Checkbox>
<Checkbox bind:checked={rename} description="Also renames the instances.">Rename layers</Checkbox>
<Checkbox bind:checked={val} disabled>Unavailable</Checkbox>
```

Props: `checked`, `value`, `mixed`, `disabled`, `tabindex`, `muted`, `ghost`, `description` (secondary line under the label, linked with `aria-describedby`), `ariaLabel`, `class`.

---

### Radio

```svelte
<script>
  let selected = "left";
</script>

<Radio bind:group={selected} value="left">Left</Radio>
<Radio bind:group={selected} value="center">Center</Radio>

<!-- UI3's button radios: boxed labels that fill when chosen -->
<RadioGroup legend="Export as" direction="horizontal">
  <Radio bind:group={format} value="png" variant="button">PNG</Radio>
  <Radio bind:group={format} value="svg" variant="button">SVG</Radio>
</RadioGroup>
```

Props: `group`, `value`, `name`, `disabled`, `tabindex`, `variant` (`"input"` | `"button"`), `class`.

---

### RadioGroup

```svelte
<script>
  let selected = "left";
</script>

<RadioGroup legend="Alignment">
  <Radio bind:group={selected} value="left">Left</Radio>
  <Radio bind:group={selected} value="center">Center</Radio>
  <Radio bind:group={selected} value="right">Right</Radio>
</RadioGroup>
```

Props: `legend`, `direction` (`"vertical"` | `"horizontal"`; horizontal lays button radios out as one row), `class`.

---

### SegmentedControl / Segment

```svelte
<script>
  import { SegmentedControl, Segment } from "figma-ui3-kit-svelte";
  import IconVertical from "figma-ui3-kit-svelte/src/icons/24/icon.24.al.layout-vertical.svg";
  import IconHorizontal from "figma-ui3-kit-svelte/src/icons/24/icon.24.al.layout-horizontal.svg";

  let direction = "vertical";
  let sizing = "fill";
</script>

<!-- Icon segments: UI3 grid widths are 88px (2 icons) or 168px (3+) -->
<div style="width: 88px">
  <SegmentedControl bind:value={direction} ariaLabel="Direction">
    <Segment value="vertical" iconName={IconVertical} tooltip="Vertical layout" />
    <Segment value="horizontal" iconName={IconHorizontal} tooltip="Horizontal layout" />
  </SegmentedControl>
</div>

<!-- Label segments fill the parent and truncate -->
<SegmentedControl bind:value={sizing} ariaLabel="Sizing" on:change={(e) => console.log(e.detail)}>
  <Segment value="fill">Fill</Segment>
  <Segment value="hug">Hug</Segment>
  <Segment value="fixed" disabled tooltip="Not available for text layers">Fixed</Segment>
</SegmentedControl>
```

SegmentedControl props: `value` (bindable), `disabled` (whole control), `ariaLabel`, `class`. Dispatches `change` with the new value.

Segment props: `value`, `iconName` (icon mode), `disabled`, `tooltip` (shown below; also the accessible name for icon segments), `ariaLabel`, `class`.

The control fills its parent — set width on a wrapper. Each segment is a tab stop; arrow keys move focus, Enter/Space selects. A disabled segment stays focusable so its tooltip can explain why.

---

### Switch

```svelte
<Switch bind:checked={isOn}>Dark mode</Switch>
<Switch bind:checked={sync} description="Keeps layers in sync.">Live sync</Switch>
```

Props: `checked`, `value`, `mixed`, `disabled`, `tabindex`, `description`, `ariaLabel`, `class`.

---

### Slider

```svelte
<Slider bind:value={opacity} min={0} max={100} step={1} ariaLabel="Opacity" />
<Slider bind:value={offset} variant="delta" defaultValue={0} min={-50} max={50} ariaLabel="Offset" />
<Slider bind:value={level} variant="stepper" step={25} ariaLabel="Level" />
<Slider bind:value={radius} defaultValue={8} max={32} ariaLabel="Corner radius" />
<Slider bind:value={hue} variant="hue" max={360} ariaLabel="Hue" />
<Slider bind:value={alpha} variant="opacity" color="#9747ff" ariaLabel="Opacity" />
```

Props: `value`, `min`, `max`, `step`, `variant` (`"range"` | `"delta"` | `"stepper"` | `"hue"` | `"opacity"`), `defaultValue` (delta's reference point; on a range slider, a marker dot there), `color` (opacity variant), `disabled`, `ariaLabel` (required), `ariaValueText`. `tabindex`, `class`. Events: `input` and `change`, both with `{ value }`, plus `focus` and `blur`. The variants do not set their own range: a `hue` slider needs `max={360}`, an `opacity` one `max={100}`.

---

### Badge

```svelte
<Badge>New</Badge>
<Badge variant="warning">Beta</Badge>
<Badge variant="count" text="21" />          <!-- a count on the selected tab or row -->
<Badge variant="count-inactive" text="21" />
<Badge size="large" strong text="Draft" />
<Badge dot ariaLabel="Unread" />
```

Props: `variant` (`"default"` | `"brand"` | `"component"` | `"danger"` | `"success"` | `"warning"` | `"invert"` | `"selected"` | `"variable"` | `"variable-selected"` | `"feedback"` | `"merged"` | `"archived"` | `"menu"` | `"figjam"` | `"count"` | `"count-inactive"`), `strong`, `size` (`"small"` | `"large"`), `dot`, `text`, `iconName`, `ariaLabel`.

---

### Banner

```svelte
<Banner variant="info">Select at least one frame to continue.</Banner>
<Banner variant="warning">This will overwrite existing variables.</Banner>
<Banner variant="danger">Plugin API unavailable.</Banner>
<Banner variant="success">Variables created.</Banner>
```

Props: `variant` (`"info"` | `"success"` | `"warning"` | `"danger"`), `message` (or slot), `class`.

---

### Chip

```svelte
<Chip>Tag</Chip>
<Chip variant="component" iconName={IconInstanceSmall}>Component</Chip>
<Chip label="Removable" closable on:close={(e) => drop(e.detail.label)} />
```

Props: `variant` (`"default"` | `"component"`), `label` (or slot), `iconName` (lead icon), `closable` (adds the close button), `focused`, `disabled`, `class`. Events: `close` (with `{ label }`).

---

### Label

```svelte
<Label>Collection name</Label>
<Label size="small" htmlFor="field-id">Small label</Label>
```

Props: `size` (`"medium"` | `"small"`), `text` (or slot), `htmlFor` (renders `<label for>`), `class`.

---

### Tooltip

```svelte
<Tooltip label="This is a tooltip">
  <IconButton iconName={IconInfo} />
</Tooltip>

<Tooltip label="Undo" hotkey direction="Top">
  <IconButton iconName={IconUndo} />
</Tooltip>
```

Props: `label`, `direction` (`"Top"` | `"TopLeft"` | `"TopRight"` | `"Bottom"` | `"BottomLeft"` | `"BottomRight"` | `"Left"` | `"Right"`; the corner variants align the tooltip to that edge of the trigger, for a button at the edge of the panel), `hotkey` (boolean, shows keyboard hint), `hotkeyText` (string, overrides auto-generated hotkey text), `disabled` (renders the trigger without a tooltip), `class`.

The first tooltip waits 1s; others follow after 200ms until the pointer has been off every tooltip for a second. Keyboard focus always gets the 200ms delay. A tooltip flips to the other side when its own has no room.

---

### LinkTooltip

UI3's link tooltip: an interactive strip against a link or a selection, with a main action and its alternatives, or a URL field. It is controlled — open it yourself; it closes on Escape, a pointerdown outside, or a scroll behind it.

```svelte
<LinkTooltip bind:open anchor={linkEl} iconName={IconLinkSmall} label="Open google.com"
  actions={[{ label: 'Edit', value: 'edit' }]}
  on:primary={openLink} on:action={(e) => e.detail.value === 'edit' && startEditing()} />

<LinkTooltip bind:open bind:value={url} anchor={selectionRect} input on:submit={(e) => applyLink(e.detail)} />
```

Props: `open` (bindable), `anchor` (an element or a `DOMRect`, e.g. a text selection's), `direction` (`"Top"` | `"Bottom"`; flips when there's no room), `label`, `iconName`, `actions` (`{ label, value }[]`), `input` (URL field instead of actions), `value` (bindable), `placeholder`, `ariaLabel`, `class`. Events: `primary`, `action` (`{ value, label }`), `submit` (the value), `close`.

Editing is yours to wire, as in UI3: on the `edit` action set `value` to the current link and `input` to true; on `submit` store it and set `input` back to false. The tooltip re-places itself as it changes size and puts the caret in the field.

---

### Modal

```svelte
<script>
  let isOpen = false;
</script>

<Button on:click={() => (isOpen = true)}>Open settings</Button>

<Modal bind:isOpen title="Settings">
  <!-- Modal content -->
  <Button slot="footer-left" variant="secondary" on:click={() => (isOpen = false)}>Cancel</Button>
  <Button slot="footer-right" on:click={save}>Save</Button>
</Modal>

<!-- UI3 header variants -->
<Modal bind:isOpen title="Export settings" headerVariant="navigation" onBack={goBack}>…</Modal>
<Modal bind:isOpen title="Libraries" headerVariant="tabs" headerTabs={["Updates", "Libraries"]} bind:selectedTab>…</Modal>
<Modal bind:isOpen title="Library">
  <svelte:fragment slot="header">
    <Dropdown menuItems={libraries} bind:value={library} ariaLabel="Library" />
  </svelte:fragment>
  …
</Modal>
```

Props: `isOpen`, `title` (also names the dialog when tabs or a header slot replace it), `width` (`"small"` 240px | `"medium"` 320px | `"large"` 480px | custom string), `height` (`"auto"` | `"50vh"` | `"80vh"` | custom string), `position` (`"center"` | `"left"` | `"right"` | `"bottom"`), `headerVariant` (`"default"` | `"navigation"` | `"tabs"`), `onBack`, `headerTabs`, `selectedTab` (bindable), `panelIds`, `backAriaLabel`, `icon2`, `icon2Name`, `icon2AriaLabel` (required whenever `icon2` is set), `footerVariant`, `footerBorder`, `showOverlay`, `closeOnOverlayClick`, `closeOnEscape`, `onClose`, `contentPadding`, `overlayPadding` (the gap the dialog keeps from the viewport), `class`. Slots: default, `header`, `footer-left`, `footer-right`, `footer-full`. Events: `close`, `back`, `tabChange`, `icon2Click`.

`panelIds` points each tab at its panel with `aria-controls`, which only holds if the panels are in the DOM. Leave it out when the panels are behind an `{#if}` and label them with `aria-labelledby` instead.

---

### ModalHeader / ModalFooter

Modal builds both for you. Reach for them directly only when you are composing a dialog by hand, or when a surface outside a Modal needs the same bar.

```svelte
<ModalHeader title="Settings" on:close={close} />
<ModalHeader variant="navigation" title="Step 2" on:back={back} on:close={close} />
<ModalHeader variant="tabs" tabs={["Local", "Library"]} bind:selectedTab />

<ModalFooter>
  <Button variant="secondary" slot="left">Cancel</Button>
  <Button slot="right">Save</Button>
</ModalFooter>
```

`ModalHeader` props: `title`, `titleId` (id for the dialog's `aria-labelledby`), `variant` (`"default"` | `"navigation"` | `"tabs"`), `icon2`, `icon2Name`, `icon2AriaLabel` (required whenever `icon2` is set), `onIcon2Click`, `onClose`, `onBack`, `backAriaLabel`, `tabs`, `selectedTab` (bindable), `tabsId`, `panelIds`, `class`. Events: `close`, `back`, `tabChange`, `icon2Click`. Callback props and events both fire, so use whichever suits.

`ModalFooter` props: `border` (the top rule), `useFullLayout` (one full-width `full` slot instead of `left` and `right`), `class`. Slots: `left`, `right`, `full`. It also takes `variant`, which Modal passes through as `footerVariant`, but nothing is styled off it.

---

### Disclosure / DisclosureItem

```svelte
<Disclosure>
  <DisclosureItem title="Advanced options">
    <!-- Hidden content -->
  </DisclosureItem>
</Disclosure>
```

`Disclosure` props: `multiple` (more than one item open at a time), `label`, `class`. Events: `change` (the open items' ids).

`DisclosureItem` props: `title`, `expanded`, `uniqueId`, `section` (a section header's weight), `open` (uncontrolled initial state), `standalone` (outside a `Disclosure`), `class`. Events: `toggle` (with `{ expanded, uniqueId }`).

---

### Menu / MenuItem / MenuDivider / MenuHeading

Menu is data-driven: pass `menuItems` and anchor it to its trigger.

```svelte
<script>
  let isOpen = false;
  let trigger;
  let menuItems = [
    { label: "Duplicate", value: "duplicate", detail: "⌘D" },
    { label: "Rename", value: "rename", iconName: IconTextSmall },
    { label: "Show grid", value: "grid", type: "check", checked: true },
    { label: "Snap to pixels", value: "snap", type: "toggle", checked: false, group: "Canvas" },
    { label: "Delete", value: "delete", disabled: true, group: "Danger" },
  ];
</script>

<IconButton bind:element={trigger} iconName={IconMore} ariaLabel="More" on:click={() => (isOpen = !isOpen)} />
<Menu bind:isOpen bind:menuItems anchorElement={trigger} on:select={(e) => run(e.detail.value)} />
```

Item fields: `label`, `value`, `group` (a change draws a divider), `showHeading` (label the group), `section` (dividers by section instead of group), `disabled`, `iconName`, `chit` or `avatar` (lead), `detail` (right-aligned shortcut or count), `badge`, `subMenu`, and:

- `type: "check"` — leading checkmark, flips `checked` (`"mixed"` draws a dot) and closes the menu.
- `type: "checkbox"` / `"toggle"` — trailing checkbox / leading switch, flips `checked` and keeps the menu open.
- no type — an action. With `itemVariant="checkmark"` the rows are a single choice marked by `selected` (how Dropdown uses it).

Props: `isOpen`, `menuItems`, `anchorElement`, `position` (`bottom-left` | `bottom-right` | `top-left` | `top-right` | `right` for sub-menus), `minWidth`, `itemVariant`, `nestingLevel` (sub-menu depth, for z-index), `menuListId`, `autofocus`, `showGroupLabels`, `searchable`, `searchPlaceholder`, `footerLabel`, `footerVariant` (`"button"` | `"row"`: a centred "+ label" row), `footerIconName`. Events: `select` (the item, after `checked` flips), `close`, `footer`.

A menu taller than the window scrolls with UI3's overflow arrows: hovering the chevron row at either end scrolls it (there's no scrollbar).

Multi-select, as in UI3's filter menus:

```svelte
<Menu bind:isOpen bind:menuItems anchorElement={trigger} searchable searchPlaceholder="Search teams"
  footerLabel="Clear all" on:footer={clearAll} />
<!-- menuItems: [{ label: "Team A", group: "Teams", type: "checkbox", chit: "#FFC700", detail: "24" }, …] -->
```

Keyboard: arrows, Home/End, Enter/Space, ArrowRight/ArrowLeft for sub-menus, Escape. The highlight follows the pointer and the keys alike. With `searchable` the field keeps focus while the arrows move through the matches. The menu closes when anything behind it scrolls.

`MenuItem`, `MenuHeading` and `MenuDivider` are the rows Menu draws. `MenuItem` can be used alone: `variant` (`default` | `checkmark` | `checkbox` | `toggle`), `selected` (check state, `"mixed"` allowed), `highlighted` (the pointer/keyboard highlight; Menu drives it through `aria-activedescendant`), `iconName`, `chit`, `avatar`, `detail`, `badge`, `hasSubMenu`, `disabled`, `id`, `role` (`"menuitem"` by default; Menu sets `menuitemcheckbox` or `option` to match the list), `class`; `lead` and `trail` slots. `MenuHeading` takes `text`, `alignment` (`"default"` | `"toggle"`) and `class`.

---

### Avatar

```svelte
<Avatar name="Lizzy Lasagna" />
<Avatar name="Team A" color="yellow" size="large" shape="square" />
<Avatar name={user.name} src={user.photoUrl} size="small" />
<Avatar count={3} unread />
```

Props: `name` (initial and label; also picks a stable colour), `src` (photo or org image; falls back to the initial if it fails), `color` (`"purple"` | `"blue"` | `"pink"` | `"red"` | `"yellow"` | `"green"` | `"grey"`), `size` (`"small"` 16 | `"default"` 24 | `"large"` 32), `shape` (`"circle"` | `"square"`), `count` (overflow "+N"), `unread`, `disabled`, `ariaLabel`. Menu items take `avatar: { name, color, src }`.

---

### Tree

```svelte
<script>
  const pages = [
    { id: "foundations", label: "Foundations", detail: "2 pages", children: [
      { id: "color", label: "Color" },
      { id: "type", label: "Typography" },
    ] },
    { id: "cover", label: "Cover" },
  ];
  let checked = ["color"];
</script>

<Tree nodes={pages} mode="check" bind:checked ariaLabel="Pages to scan" />
<Tree nodes={pages} mode="single" bind:selected ariaLabel="Page" />
<Tree nodes={json} expanded={["user"]} ariaLabel="Preview" />
```

Props: `nodes` (`{ id, label, iconName?, detail?, disabled?, children? }`), `mode` (`"none"` browse | `"single"` pick one | `"check"` tick leaves; parents show all/some/none and tick their leaves), `expanded` (open parent ids; `null` opens all), `selected`, `checked`, `disabled`, `ariaLabel`. Events: `toggle`, `select`, `change`. Keyboard: arrows, Right/Left open, close and step in or out, Home/End, Enter/Space.

A node's `iconName` is rendered as raw SVG, so it must be a build-time import like any other `Icon` — never a string from the document or from a message. Everything else in a node (`label`, `detail`) is escaped as text and is safe to fill from document data.

---

### Icon

```svelte
<script>
  import { Icon } from "figma-ui3-kit-svelte";
  import { IconBack, IconSettings } from "figma-ui3-kit-svelte/icons";
</script>

<Icon iconName={IconBack} color="--figma-color-icon" />
<Icon iconName={IconSettings} color="--figma-color-icon-brand" spin />
<Icon iconText="W" color="--figma-color-text-brand" />
```

If you need an icon that is not exported from the root, you can still import it directly:

```svelte
<script>
  import { Icon } from "figma-ui3-kit-svelte";
  import Icon24Eye from "figma-ui3-kit-svelte/src/icons/24/icon.24.eye.small.svg";
</script>

<Icon iconName={Icon24Eye} color="--figma-color-icon" />
```

Props: `iconName` (SVG import), `iconText` (text fallback), `color` (CSS variable name), `spin`, `size` (px, default 24), `ariaLabel` (set when the icon carries meaning of its own), `class`.

Available sizes: `16/` and `24/`. Naming pattern: `icon.{size}.{name}.svg`.

---

### IconButton

```svelte
<script>
  import { IconButton } from "figma-ui3-kit-svelte";
  import { IconMore } from "figma-ui3-kit-svelte/icons";
</script>

<IconButton iconName={IconMore} ariaLabel="More options" on:click={handler} />
<IconButton iconName={IconMore} ariaLabel="More options" variant="secondary" />
```

Props: `iconName`, `iconText` (text instead of an SVG), `variant` (`"default"` | `"secondary"`), `disabled`, `ariaLabel` (required), `iconColor`, `spin`, `tabindex`, `type`, `class`. Bind the element with `bind:element` — Menu anchors to it.

---

### IconToggle

```svelte
<script>
  import { IconToggle } from "figma-ui3-kit-svelte";
  import { IconEyeSmall, IconHiddenSmall, IconLinkBroken, IconLinkConnected, IconStyles } from "figma-ui3-kit-svelte/icons";
</script>

<!-- Swaps icons, as UI3's "Button icon toggle" -->
<IconToggle bind:pressed={locked} iconName={IconLinkBroken} iconNameOn={IconLinkConnected} ariaLabel="Constrain proportions" />
<IconToggle bind:pressed={hidden} iconName={IconEyeSmall} iconNameOn={IconHiddenSmall} highlighted ariaLabel="Hide layer" />
<!-- One icon on the selected fill, as UI3's "Button icon dialog toggle" -->
<IconToggle bind:pressed={stylesOpen} iconName={IconStyles} ariaLabel="Styles" />
```

Props: `pressed`, `iconName`, `iconNameOn` (swaps instead of filling), `highlighted` (pressed fill with swapped icons too, for selected rows), `variant` (`"default"` | `"secondary"`), `disabled`, `tabindex`, `ariaLabel` (required), `class`. Events: `change` (new state), `click`. Renders `aria-pressed`.

---

### ToggleButton

```svelte
<script>
  import { ToggleButton } from "figma-ui3-kit-svelte";
  import { IconFilter } from "figma-ui3-kit-svelte/icons";
</script>

<!-- Text on the selected fill while on, as IconToggle's dialog toggle -->
<ToggleButton bind:pressed={showHidden} label="Hidden layers" badge={String(hiddenCount)} />
<ToggleButton bind:pressed={filtersOpen} iconName={IconFilter} label="Filters" badge="3" on:change={apply} />
```

Props: `pressed`, `label` (or slot), `iconName` (lead icon), `badge` (Badge text), `badgeVariant`, `variant` (`"default"` | `"secondary"`), `size` (`"default"` | `"large"`), `disabled`, `tabindex`, `ariaLabel` (only when the label does not name the action), `class`. Events: `change` (new state), `click`. Renders `aria-pressed`. Bind the element with `bind:element`.

The badge is filled, not outlined: the quiet `count-inactive` an unselected tab carries while the button rests, and the on-selected fill while it is pressed, where grey would read as a foreign chip. A `badgeVariant` other than `"default"` is passed through as given.

---

### SplitButton

```svelte
<SplitButton iconName={IconPlay} ariaLabel="Present" {menuItems} on:click={present} on:select={(e) => run(e.detail.value)} />
```

Props: `iconName`, `ariaLabel` (required, names the main action), `menuAriaLabel`, `menuItems` (as Menu), `itemVariant`, `showGroupLabels`, `size` (`"small"` | `"large"`), `disabled`. Events: `click` (main action), `select` (menu item).

---

## Design tokens

All tokens are CSS custom properties injected by Figma (requires `themeColors: true`).

### Spacing

| Token | Value |
|---|---|
| `--size-xxxsmall` | 4px |
| `--size-xxsmall` | 8px |
| `--size-xsmall` | 16px |
| `--size-small` | 24px |
| `--size-medium` | 32px |
| `--size-large` | 40px |

### Border radius

| Token | Value |
|---|---|
| `--border-radius-small` | 2px |
| `--border-radius-medium` | 5px |
| `--border-radius-large` | 13px |

### Typography scales

`heading-large`, `heading-medium`, `heading-small`, `body-large`, `body-medium`, `body-small` (plus `-strong` variants).

```css
.custom {
  font-family: var(--font-stack);
  font-size: var(--body-medium-font-size);
  line-height: var(--body-medium-line-height);
}
```

### Color tokens

```css
--figma-color-text              --figma-color-bg
--figma-color-text-secondary    --figma-color-bg-secondary
--figma-color-text-brand        --figma-color-bg-brand
--figma-color-text-danger       --figma-color-bg-danger
--figma-color-text-disabled
--figma-color-border
--figma-color-border-selected
--figma-color-icon
--figma-color-icon-brand
--figma-color-icon-danger
```

The kit adds static tokens Figma doesn't inject, in `global.css`: the menu's (`--color-bg-menu`, `--color-bg-menu-selected`, `--color-bg-menu-hover`, `--color-text-menu*`, `--color-border-menu`) and the multiplayer colours avatars use (`--color-multiplayer-purple` … `-grey`, `--color-text-on-multiplayer`, `--color-text-on-multiplayer-yellow`).
