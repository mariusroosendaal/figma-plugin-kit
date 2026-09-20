---
description: "Build Figma mockups of plugin UIs from real UI3 components, from PluginUI.svelte or a description in kit terms. Use when asked to mock up, design or visualize a plugin screen in Figma. Usage: /figma-plugin-kit:mockup [plugin or screen]"
---

<!-- Generated from _packages/figma-plugin-utilities/figma/mockup/MOCKUPS.md in the figma-plugins monorepo. Edit it there — `npm run sync-skills` overwrites this file. -->

# Figma mockups from plugin code

Build a Figma mockup of a plugin UI from real UI3 components, starting from a `PluginUI.svelte` file or a description written in figma-ui3-kit-svelte / figma-plugin-utilities terms. The mockup uses the same components that Code Connect maps back to Svelte, so selecting it in Dev Mode (or calling `get_code_connect_map`) returns kit code.

## Before you start

- Load the `figma-use` skill; every build is a `use_figma` call.
- **Where to build**
  - **UI3 file** (`6dJFbL7SDC7kkS1fu3AHH6`), page **Mockups** (`1027190:25`). This is the default and needs no setup.
  - **Any other design file** with the UI3 library enabled. Components, styles and variables are imported by key. Icons need `options.icons` (see below).
- The builder is the `build-mockup.js` source at the end of this skill, with comments and indentation stripped. It is about 44 KB, and `use_figma` accepts 50,000 characters in all, so keep the spec under about 6 KB: build repeated parts with small helper functions rather than writing them out, and split a large screen into several windows.

## Workflow

1. **Read the UI.** Open `PluginUI.svelte` (and any child components). Note the layout shell (`Header`, `PluginLayout`, `Footer`), each tab or view, and the state worth showing. Use default values. If a value is derived (lists, computed text), compute it from the plugin's own pure modules when that's cheap, e.g. `node -e 'import("./src/scale.ts").then(...)'`. Node 24 runs `.ts` directly.
2. **Write the spec** so it mirrors the Svelte tree:

   | Svelte | Spec |
   |---|---|
   | `<Button variant="secondary">Cancel</Button>` | `{ c: 'Button', props: { variant: 'secondary' }, children: 'Cancel' }` |
   | `<svelte:fragment slot="left">…` | `slots: { left: [ … ] }` |
   | Default slot content | `children: [ … ]` |
   | `<div>` with flex/column layout | `{ stack: 'v' \| 'h', gap, padding, align, justify, wrap, fill, stroke, strokeSides, radius, width, height, grow, fillHeight, children }` |
   | CSS grid with N columns | `{ grid: N, gap, children }` |
   | `<Text>` | `{ c: 'Text', props: { variant, color }, children: '…' }`. This is a connected component, so it round-trips. |
   | Plain text in custom markup | `{ text, variant: 'body-medium' \| 'body-small' \| 'body-large' (+ '-strong'), color: 'text' \| 'text-secondary' \| 'text-tertiary', width?, grow?, align?, truncate? }` |
   | `<Icon iconName={…}>` | `{ icon: 'icon.24.plus', color?: 'icon-tertiary' }` |
   | `<Chit color={…}>` | `{ c: 'Chit', props: { color: '#0D99FF' } }`. Connected, so it round-trips; use it for kit chits. |
   | A custom color swatch (not a kit Chit) | `{ swatch: '#0D99FF', size?: 16, radius?: 4 }` |
   | `<hr>` | `{ divider: true }` |
   | Plugin window | `{ window: 'Name — view', width: 320, height?, children: [Header, PluginLayout, Footer] }` |

   Build one window per tab or state. Build modals as standalone specs (`{ c: 'Modal', … }`). For a dialog that holds its own tabs and footer (`contentPadding={false}`), put a tabs row, a `fillHeight` stack and a `Footer` in its children.
3. **Run it.** Paste the builder, then the spec, and end with:
   ```js
   const result = await buildMockup(SPEC, { page: '1027190:25' })
   const root = await figma.getNodeByIdAsync(result.root)
   await root.screenshot({ scale: 1 })
   return result
   ```
   Rerunning a spec with the same `window` name replaces the previous build.
4. **Check it.** Compare the screenshot with the plugin and fix the spec, not the canvas.
5. **Round-trip (optional).** Call `get_code_connect_map` on the window node and compare the snippets with the source.

## Components

| Spec `c` | Props (kit names) | Slots |
|---|---|---|
| `Button` | `variant`, `size`, `disabled`/`ariaDisabled`, `iconName`, `iconLead`; label as `children` | |
| `IconButton` | `iconName`, `variant`, `disabled` | |
| `IconToggle` | `iconName`, `iconNameOn` (swaps icons; without it, one icon on the selected fill), `pressed`, `highlighted`, `variant`, `disabled` | |
| `SplitButton` | `iconName`, `size`, `disabled` | |
| `ToggleButton` | `pressed`, `iconName` (lead), `badge` (a count); label as `children` or `label` | |
| `Input` | `value`, `placeholder`, `size`, `disabled`, `iconName` | |
| `Textarea` | `value`, `placeholder`, `disabled` | |
| `NumericInput` | `value`, `placeholder`, `label` (lead letter) or `iconName`, `unit`, `options` (adds the chevron), `variable` (a bound variable's pill), `disabled` | |
| `NumericInputMulti` | `values`, `iconName`, `disabled` (flag or per cell) | |
| `Tree` | `nodes`, `mode`, `expanded`, `selected`, `checked` (three levels of indent) | |
| `ColorInput` | `value` (hex), `opacity`, `variable`, `disabled` | |
| `Chit` | `color` (hex, `#RRGGBBAA` for alpha), `opacity`, `shape` | |
| `Dropdown` | `value` (`{ label }`), `placeholder`, `disabled`, `iconName`, `size`, `stroke` | |
| `Checkbox`, `Switch` | `checked`, `mixed`, `disabled`, `description`; label as `children` | |
| `Radio` | `group`, `value` (or `checked`), `disabled`, `variant` (`button`); label as `children` | |
| `Tabs` | `tabs: [{ label, badge?, unread? }]` (max 5; `unread` takes the count blue), `selectedTab` | |
| `SegmentedControl` | `value`, `disabled`; `children: [{ c: 'Segment', props: { value, iconName?, tooltip? }, children: 'Label' }]` (2–6) | |
| `Slider` | `value`, `min`, `max`, `variant` (`range`/`delta`/`stepper`/`hue`/`opacity`), `defaultValue` (range: the marker), `disabled` | |
| `Badge` | `variant` (incl. `count`/`count-inactive`), `strong`, `size`, `dot`; text as `children` | |
| `Avatar` | `name`, `color`, `src`, `size`, `shape`, `count`, `unread`, `disabled` | |
| `VariablePill` | `label`, `selected`, `onSelected`, `muted`, `disabled` | |
| `Banner` | `variant`, `message` | |
| `Chip` | `label`, `variant`, `iconName`, `closable`, `focused`, `disabled` | |
| `Tooltip` | Renders its `children` (the trigger) only; pass `show: true` to draw the bubble | |
| `Menu` | `menuItems: [{ label, group?, section?, showHeading?, type?, checked?, selected?, iconName?, detail?, badge?, disabled?, subMenu? }]`, `itemVariant`, `showGroupLabels`, `searchable`, `searchPlaceholder`, `footerLabel`, `footerVariant`; items also take `avatar` | |
| `Modal` | `title`, `width` (`small`/`medium`/`large` or pixels), `height` (pixels), `contentPadding`, `icon2`, `footerBorder`. The Kit additions Modal has one header, so `headerVariant` draws as a title | `children`, `footer-left`, `footer-right`, `footer-full` |
| `Header` | `title`, `noBorder` | `left`, `center`, `right` |
| `Footer` | `variant` (`right`/`split`/`full`) | `children` (right/full), `left`, `right` (split) |
| `PluginLayout` | | `children` |
| `FieldGroup` | `label`, `size` | `children` (the control) |
| `EmptyState` | `message`, `size`, `icon`, `actions: [{ label }]` | |
| `LoadingState` | `message` | |
| `StatusBar` | `message`, `type` | |
| `ListItem` | `title`, `active`, `menuItems`, `hasBadge`; meta text as `children` | |
| `CheckboxCard` | `checked`, `disabled`, `secondary`; label as `children` | |
| `Text` | `variant` (`heading-*`, `body-*`, `-strong`), `color` (`--figma-color-text-secondary` / `-tertiary`); text as `children` | |
| `Label` | `size`; text as `children` | |
| `RadioGroup` | `legend`, `direction` | `children` (Radios) |
| `Disclosure` | | `children` (DisclosureItems) |
| `DisclosureItem` | `title`, `open`, `section` | `children` (shown when `open`) |

`Input`, `Dropdown`, `FieldGroup`, `Banner` and the other block-level components fill the width of a vertical parent automatically. Anything else can take `fill: true`; in a horizontal parent, `grow: true` makes a component or stack take the remaining width (CSS `flex: 1` / `1fr`). `fillHeight: true` does the same vertically (e.g. an EmptyState centred in the panel), and stacks take a fixed `width`. `fill` and `stroke` on stacks take color variable names: `bg`, `bg-secondary`, `bg-brand`, `border`, `text`, `text-secondary`, `text-tertiary`, `icon-tertiary`.

## Icons

Use Figma icon names, which match the kit's SVG filenames: `iconName: 'icon.24.settings'`. A path such as `…/icons/24/icon.24.settings.svg` also works. Inside the UI3 file, icons are found by name. In any other file, pass their IDs and keys from `_packages/figma-ui3-kit-svelte/figma/icons.json`:

```js
await buildMockup(SPEC, { icons: { 'icon.24.settings': { id: '1:531125', key: '5c7c11ea23ba65e62cd7ab9871f2101c00ce41d1' } } })
```

## What doesn't round-trip

- **Plain layout.** Stacks, grids, dividers and `{ text }` primitives are plain Figma layers, so Code Connect lists only the components inside them. Use `{ c: 'Text' }` wherever the source uses `<Text>` so it does come back. Tables and custom markup won't appear in the generated code.
- **Runtime-only props.** `bind:`, event handlers, `type="number"`, ARIA props and ids have no Figma equivalent.
- **Dropdown selection.** A selected value reads back as `placeholder="…"`.
- **Tooltip.** It wraps a trigger in code, but in Figma it's hidden (the trigger renders alone).

## Example

A full round-trip example (the Spacing Sets Scale tab) is in `figma-plugin-utilities/figma/mockup/examples/spacing-sets.js`. A minimal spec:

```js
const SPEC = {
  window: 'Rename layers',
  children: [
    { c: 'Header', props: { title: 'Rename layers' } },
    { c: 'PluginLayout', children: [
      { c: 'FieldGroup', props: { label: 'Prefix' }, children: [{ c: 'Input', props: { value: 'icon/' } }] },
      { c: 'CheckboxCard', props: { checked: true, secondary: '24 layers' }, children: 'Include hidden layers' },
    ] },
    { c: 'Footer', props: { variant: 'split' }, slots: {
      left: [{ c: 'Button', props: { variant: 'secondary' }, children: 'Cancel' }],
      right: [{ c: 'Button', children: 'Rename layers' }],
    } },
  ],
}
```

## build-mockup.js

```js
const UI3 = {
Button: { id: '2012:48557', key: '071c9562a22c96fb3e886f3075e3995b17fe0a03', set: true },
IconButton: { id: '2324:46757', key: '303e1c5fbb7a88c6b2e4fe7aac7f111195d371ef', set: true },
Badge: { id: '2012:35027', key: '0d207dd31bf7e42cb2c936fed80fc62c0cb09147', set: true },
Checkbox: { id: '2012:55461', key: 'f62e6ded8a44b7a476c01b90fc16bbae1fe32ebc', set: true },
Switch: { id: '2015:24697', key: '4aec511c37f1df05ec1c9e329710e7b30b123ecc', set: true },
Radio: { id: '2015:20365', key: '76164e6ee770820fd92e54c599e52a93fd4048d8', set: true },
Input: { id: '2028:79255', key: '62a920f029d5f8bde4984db2e5be53a55454690a', set: true },
Dropdown: { id: '2028:36589', key: 'fa10d177e81113d0444767849ed87092e3d3fb70', set: true },
Tabs: { id: '2015:27780', key: 'bfd94b8634aa735c9be6158d1208ca9a768d6773', set: true },
SegmentedControl: { id: '2015:20960', key: 'bca770b30596f62d0674bc3b4b7ae2f6775f5b1e', set: true },
Slider: { id: '2015:23280', key: 'd810bedfd3a19e1d131f6b97d050f941dad848b6', set: true },
Tooltip: { id: '2015:39095', key: 'c52bc47cc2b561125634c1700e39afd38ec4ad12', set: true },
MenuRowSimple: { id: '2327:96028', key: '690e9a0577253ce6c6cc9fec3da79dea66fb31ab', set: true },
MenuRowCheckmark: { id: '2327:96252', key: '6bcc3df12ba6da07596547b98ea1b9bc463141c2', set: true },
MenuRowHeading: { id: '2327:96347', key: 'a0225291226db5768bd80f0e2ae2507d1f8d50df', set: true },
MenuDivider: { id: '2327:96331', key: '0da775e2a59b61cfdf6b2421c562ab16882d07be', set: false },
MenuRowComplex: { id: '2327:96049', key: 'b122a716963d6a75190e9c9ff022ea7d19003782', set: true },
MenuRowToggle: { id: '2327:96288', key: '4041feb4889093ef96305a06289863c2852f9bc3', set: true },
NumericInput: { id: '2028:79190', key: '86d9cd69d26ad1054cd384e536a9e41fd3cd98ad', set: true },
ColorInput: { id: '2028:79525', key: '1109b1a24986b1756dc11673ef77fa28f7ff185a', set: true },
Chit: { id: '2028:79673', key: '1f3deb32138846892266cb57f84562774c680f90', set: true },
IconToggle: { id: '2324:46776', key: 'e0744f36051956ba28abdfa9d6129664ba5797c1', set: true },
IconToggleDialog: { id: '2324:46817', key: 'adf85113bfab702068b38874c55b5b3ca2a649fe', set: true },
SplitButton: { id: '2324:46856', key: '98c2aebe77ed51c1424d1dc0a7bbf91c5035795e', set: true },
BadgeSmallAlt: { id: '2012:35077', key: 'da463a31f8889ae48450808c882a246dd156a502', set: true },
BadgeLarge: { id: '2012:35016', key: '01dbc71b5a9f2c9636bbba4382a53580f4948b36', set: true },
BadgeDot: { id: '2012:35086', key: '1fc112401ad63d805e2dff2b04e1040218d6458d', set: false },
Avatar: { id: '2012:32015', key: '4b1ab7074c15da005ced9ef2c6aadd421e8abe46', set: true },
VariablePill: { id: '2028:79753', key: '8dd74e72f23f9fd824faad58c0edeb8d6485192a', set: true },
NumericInputMulti: { id: '2028:79619', key: '351a06649c2afe850c4f4a1f8fb3bb6fa282cf10', set: true },
MenuRowFooter: { id: '2327:96342', key: '09a61308ca8b3e0d57a047cdd66a255d031a99d4', set: true },
TreeRow: { id: '1027222:26144', key: 'f3e55611980a1d9735b3adc94d3fca1a8e557ce4', set: true },
Tree: { id: '1027222:26241', key: '80d6b8310d34fa1635ca35e76efa2c4dfbe7c984', set: false },
ToggleButton: { id: '1027239:26209', key: '47d374e9c751986a166b9718203c302c757a33a4', set: true },
Banner: { id: '1027204:342', key: '133eade4a3d7f24189bf919ea1b7472182ef2e20', set: true },
Chip: { id: '1027205:88', key: '415f290a1158771314dd11b9fc83b97bc62e9b04', set: true },
Modal: { id: '1027206:365', key: '248a9a4ecea1cc16056ec1bc28b56acbf5cc8627', set: true },
Menu: { id: '1027206:366', key: '460fe8753d38a6fa072564cfc475b7546803f486', set: false },
Header: { id: '1027197:23734', key: '92dea3280c6742ad57bbd682c483cac3e5062980', set: false },
Footer: { id: '1027197:23800', key: '78de9140a69b8fb9bb9f797c34636f2b787fbf7e', set: true },
PluginLayout: { id: '1027197:23801', key: '41f0db58e59fc01415c151d1cf7c2f1e25f9faea', set: false },
FieldGroup: { id: '1027197:23913', key: '0b2eb3a95c0e4a960f7a8ee0e8b46a2136fd5dee', set: true },
EmptyState: { id: '1027197:23851', key: '3c765bde25410d1a8a7e6a28874fc6cca62982f6', set: true },
LoadingState: { id: '1027197:23852', key: '5d3b23c91ddea62dfeee2212abdf8c7f1b0cc763', set: false },
StatusBar: { id: '1027197:23902', key: 'b0196b1dd4a43d1ff9a39e6bbee225726960e448', set: true },
ListItem: { id: '1027197:23952', key: '0958cc0be61c4fa697f0ca5a0581422bccf71899', set: true },
CheckboxCard: { id: '1027197:24237', key: 'b8229a139f45ac8e9ff94638d652d909a450d23a', set: true },
Text: { id: '1027216:156', key: 'c695a971ac9052c6ebcbf432b60ce7a0d5281781', set: true },
Label: { id: '1027216:161', key: '964899776bca3a6d406cd9e78c9041e2319b958d', set: true },
RadioGroup: { id: '1027216:162', key: '9ec3520dfc75786126a616f7a5331ad428792809', set: false },
DisclosureItem: { id: '1027216:25160', key: '81e90351aad15cc9d9b83a8de648c39671327b1a', set: true },
Disclosure: { id: '1027216:25161', key: '320745f42bae91a9a03b2367e8cc8badb24762ed', set: false },
}
const STYLES = {
'body-small': { id: 'S:704c8fb9b4484d295a7511c93134effcabfcc058,', key: '704c8fb9b4484d295a7511c93134effcabfcc058' },
'body-small-strong': { id: 'S:c18293943bc798c41a4d7cb0fc5192914987a198,', key: 'c18293943bc798c41a4d7cb0fc5192914987a198' },
'body-medium': { id: 'S:32ac890505faab92202d64ce7e620645a9d629c3,', key: '32ac890505faab92202d64ce7e620645a9d629c3' },
'body-medium-strong': { id: 'S:eb1c70f0282b2b51cff872152a3af5faeb66bf8f,', key: 'eb1c70f0282b2b51cff872152a3af5faeb66bf8f' },
'body-large': { id: 'S:a449a3e94dd8ecb4968a45c9b04eaeca206487d4,', key: 'a449a3e94dd8ecb4968a45c9b04eaeca206487d4' },
'body-large-strong': { id: 'S:04f70f6a2ef04f88ce1a33e587aab52369770780,', key: '04f70f6a2ef04f88ce1a33e587aab52369770780' },
}
const VARS = {
bg: { id: 'VariableID:1325:3223', key: 'fc500746e49f560ee7b8a31ee9e3d8bdd97baabc' },
'bg-secondary': { id: 'VariableID:1325:3224', key: 'aa7d8614086d761bb7b7332fcb65482edb2e2371' },
text: { id: 'VariableID:1325:3221', key: '4a18c53ba5f18d95abbbc156315fb6347cde902e' },
'text-secondary': { id: 'VariableID:1330:3190', key: '4013c756c98f16bbca5bca28042f5492ccde52ea' },
'text-tertiary': { id: 'VariableID:1330:3192', key: '0f283455cd05ac799f7516e4a1e8972df39a137c' },
'bg-brand': { id: 'VariableID:1326:3175', key: 'a2bf6679fa967d1b5cc804c461d5e012b840b2bb' },
'icon-tertiary': { id: 'VariableID:1330:3205', key: '1853293bb8ba57fed790a78193e8af8e5060cb81' },
border: { id: 'VariableID:1326:3180', key: '0231d9add0c28a818ab62bc8d70a8fff21715085' },
4: { id: 'VariableID:1:672456', key: '0f158d8847032625eabf06aded4a5d93bd09b0d6' },
8: { id: 'VariableID:1:672457', key: '907024ab5c6723435cf94ff28a455b4a1d492c5f' },
16: { id: 'VariableID:1:672458', key: 'bec56e8d6dd80d7504dd39f05d79742960693715' },
'radius-medium': { id: 'VariableID:1:672460', key: '774a56af073bcb91c653f64f20c1e6242f1d00b8' },
'radius-large': { id: 'VariableID:1:672461', key: '7daac276bb8bcc70f0cf440f5a1992ddcee96915' },
}
const ICONS_PAGE = '1:530873'
const cache = new Map()
async function once(k, fn) {
if (!cache.has(k)) cache.set(k, await fn())
return cache.get(k)
}
const local = async (id, key) => {
try {
const n = await figma.getNodeByIdAsync(id)
return n && (!key || n.key === key) ? n : null
} catch (e) {
return null
}
}
const component = (name) =>
once('c:' + name, async () => {
const e = UI3[name]
if (!e) throw new Error(`Unknown component "${name}"`)
return (
(await local(e.id, e.key)) ||
(e.set ? figma.importComponentSetByKeyAsync(e.key) : figma.importComponentByKeyAsync(e.key))
)
})
const variable = (name) =>
once('v:' + name, async () => {
const e = VARS[name]
return (await figma.variables.getVariableByIdAsync(e.id).catch(() => null)) || figma.variables.importVariableByKeyAsync(e.key)
})
const textStyle = (name) =>
once('s:' + name, async () => {
const e = STYLES[name] || STYLES['body-medium']
const s = (await figma.getStyleByIdAsync(e.id).catch(() => null)) || (await figma.importStyleByKeyAsync(e.key))
await figma.loadFontAsync(s.fontName)
return s
})
let ICON_MAP = {}
async function icon(name) {
if (!name) return null
const n = name.replace(/\.svg$/, '').replace(/^.*\//, '')
return once('i:' + n, async () => {
const e = ICON_MAP[n]
if (e) return (await local(e.id, e.key)) || figma.importComponentByKeyAsync(e.key)
const page = await figma.getNodeByIdAsync(ICONS_PAGE)
if (!page) throw new Error(`Icon "${n}" needs an entry in options.icons outside the UI3 file`)
await page.loadAsync()
const found = page.findAllWithCriteria({ types: ['COMPONENT'] }).find((c) => c.name === n)
if (!found) throw new Error(`Icon "${n}" not found`)
return found
})
}
async function paint(name) {
return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', await variable(name))
}
async function spacing(node, field, px) {
node[field] = px
if (VARS[px]) node.setBoundVariable(field, await variable(px))
}
function pickVariant(set, want) {
const entries = Object.entries(want).filter(([, v]) => v !== undefined)
let best = set.defaultVariant
let bestScore = -1
for (const v of set.children) {
const vp = v.variantProperties || {}
const score = entries.reduce((s, [k, val], i) => s + (vp[k] === val ? 2 ** (entries.length - i) : 0), 0)
if (score > bestScore) {
best = v
bestScore = score
}
}
return best
}
async function instance(name, variants = {}) {
const c = await component(name)
return c.type === 'COMPONENT_SET' ? pickVariant(c, variants).createInstance() : c.createInstance()
}
const propKey = (node, prefix) => Object.keys(node.componentProperties).find((k) => k.split('#')[0] === prefix)
function setProp(node, prefix, value) {
const k = propKey(node, prefix)
if (k !== undefined && value !== undefined) node.setProperties({ [k]: value })
}
async function setText(node, layerName, value) {
if (value === undefined || value === null) return
const t = node.findOne((n) => n.type === 'TEXT' && (!layerName || n.name === layerName))
if (!t) return
for (const f of t.getStyledTextSegments(['fontName']).map((s) => s.fontName)) await figma.loadFontAsync(f)
t.characters = String(value)
}
async function setDescription(node, prefix, text) {
if (!text) return
setProp(node, prefix, true)
const t = node.findOne((n) => n.type === 'TEXT' && n.parent && n.parent.name === 'Description')
if (!t) return
for (const f of t.getStyledTextSegments(['fontName']).map((s) => s.fontName)) await figma.loadFontAsync(f)
t.characters = String(text)
}
async function swapIcon(node, prefix, iconName) {
const c = await icon(iconName)
if (c) setProp(node, prefix, c.id)
}
const tf = (b) => (b ? 'True' : 'False')
const pick = (map, value, fallback) => map[value] ?? fallback
function parseHex(value) {
let h = String(value || '').replace('#', '')
if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('')
if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(h)) return null
const byte = (i) => parseInt(h.slice(i, i + 2), 16) / 255
return { rgb: { r: byte(0), g: byte(2), b: byte(4) }, alpha: h.length === 8 ? byte(6) : 1, hex: h.slice(0, 6).toUpperCase() }
}
function paintChit(chit, color, alpha) {
if (!chit || !color) return
for (const n of chit.findAll((n) => /^(bg\.square\.fill|bg\.squarehalf|circle\.16)/.test(n.name) && 'fills' in n)) {
n.fills = [{ type: 'SOLID', color: color.rgb }]
if (n.name.includes('alpha')) n.opacity = alpha
}
}
async function fillSlot(inst, slotName, children, ctx) {
const slot = inst.findOne((n) => n.type === 'SLOT' && n.name === slotName)
if (!slot || children === undefined) return slot
for (const c of [...slot.children]) c.remove()
for (const child of [].concat(children)) await build(child, slot, ctx)
return slot
}
class Placed {
constructor(node) {
this.node = node
}
}
function textOf(spec) {
if (spec.props && spec.props.label !== undefined) return spec.props.label
if (typeof spec.children === 'string') return spec.children
return spec.text
}
const BLOCK = new Set(['Input', 'Textarea', 'NumericInput', 'NumericInputMulti', 'ColorInput', 'Tree', 'Dropdown', 'FieldGroup', 'Banner', 'CheckboxCard', 'ListItem', 'EmptyState', 'LoadingState', 'StatusBar', 'Header', 'Footer', 'PluginLayout', 'Tabs', 'SegmentedControl', 'Slider', 'RadioGroup', 'Disclosure', 'DisclosureItem', 'Text'])
const BUILDERS = {
async Text(p, spec, parent) {
const color = String(p.color || '')
const node = await instance('Text', {
'👥 Variant': p.variant || 'body-medium',
'🎛️ Color': /tertiary/.test(color) ? 'Tertiary' : /secondary/.test(color) ? 'Secondary' : 'Default',
})
setProp(node, '🎛️ Text', textOf(spec) ?? p.text ?? '')
if (isVertical(parent)) {
const t = node.findOne((n) => n.type === 'TEXT')
t.layoutSizingHorizontal = 'FILL'
t.textAutoResize = 'HEIGHT'
}
return node
},
async Label(p, spec) {
const node = await instance('Label', { '👥 Size': p.size === 'small' ? 'Small' : 'Medium' })
setProp(node, '🎛️ Label', textOf(spec) ?? p.text ?? '')
return node
},
async RadioGroup(p, spec, parent, ctx) {
const node = await instance('RadioGroup')
setProp(node, '👁️ Legend', !!p.legend)
setProp(node, '🎛️ Legend', p.legend ?? '')
const children = [].concat(spec.children ?? [])
const row = { stack: 'h', gap: 8, name: 'Radios', children: children.map((c) => ({ ...c, grow: true })) }
await fillSlot(node, 'Radios slot', p.direction === 'horizontal' ? [row] : children, ctx)
return node
},
async Disclosure(p, spec, parent, ctx) {
const node = await instance('Disclosure')
await fillSlot(node, 'Items slot', spec.children ?? [], ctx)
return node
},
async DisclosureItem(p, spec, parent, ctx) {
const node = await instance('DisclosureItem', { '🐣 Expanded': tf(p.open || p.expanded), '🎛️ Section': tf(p.section) })
setProp(node, '🎛️ Title', p.title ?? '')
if (p.open || p.expanded) await fillSlot(node, 'Content slot', spec.children ?? [], ctx)
return node
},
async Button(p, spec) {
const iconLead = p.iconName ? (p.iconLead === 'center' ? 'Center-aligned' : 'Left-aligned') : 'False'
const node = await instance('Button', {
'👥 Variant': pick({ primary: 'Primary', secondary: 'Secondary', destructive: 'Destructive', 'secondary-destructive': 'Secondary Destruct', inverse: 'Inverse', success: 'Success', link: 'Link', 'link-danger': 'Link Danger', ghost: 'Ghost' }, p.variant, 'Primary'),
'👥 Size': pick({ default: 'Default', large: 'Large', wide: 'Wide' }, p.size, 'Default'),
'🎛️ Disabled': tf(p.disabled || p.ariaDisabled),
'🎛️ Icon Lead': iconLead,
'🐣 State': 'Default',
})
setProp(node, '🎛️ Label', textOf(spec) ?? 'Button')
if (p.iconName) await swapIcon(node, '↪ Icon', p.iconName)
return node
},
async IconButton(p) {
const node = await instance('IconButton', { '👥 Variant': p.variant === 'secondary' ? 'Secondary' : 'Default', '🎛️ Disabled': tf(p.disabled), '🐣 State': 'Default' })
await swapIcon(node, '🎛️ Icon', p.iconName)
return node
},
async Badge(p, spec) {
const text = p.text ?? textOf(spec)
if (p.dot) return instance('BadgeDot')
if (p.variant === 'count' || p.variant === 'count-inactive') {
const node = await instance('BadgeSmallAlt', { '👥 Variant': p.variant === 'count' ? 'Count New' : 'Count Inactive' })
setProp(node, 'Text', String(text ?? ''))
return node
}
if (p.size === 'large') {
const node = await instance('BadgeLarge', { '👥 Variant': pick({ invert: 'Strong', merged: 'Merged', archived: 'Archived' }, p.variant, 'Default') })
await setText(node, null, text)
return node
}
const node = await instance('Badge', {
'👥 Variant': pick({ default: 'Default', brand: 'Brand', component: 'Component', danger: 'Danger', success: 'Success', warning: 'Warn', invert: 'Invert', selected: 'Selected', variable: 'Variable', 'variable-selected': 'Variable Selected', feedback: 'Feedback', merged: 'Merged', archived: 'Archived', menu: 'Menu', figjam: 'FigJam' }, p.variant, 'Default'),
'🐣 Strong': tf(p.strong),
})
await setText(node, null, p.text ?? textOf(spec))
return node
},
async Checkbox(p, spec) {
const label = textOf(spec)
const node = await instance('Checkbox', {
'🐣 Type': p.mixed ? 'Mixed' : p.checked ? 'Checked' : 'Unchecked',
'🎛️ Disabled': tf(p.disabled),
'🎛️ Ghost': tf(p.ghost),
'🎛️ Muted': tf(p.muted || !(p.checked || p.mixed)),
'🐣 State': 'Default',
})
setProp(node, '👁️ Label', label !== undefined && label !== '')
await setText(node, 'Value', label)
await setDescription(node, '👁️ Description', p.description)
return node
},
async Switch(p, spec) {
const label = textOf(spec)
const node = await instance('Switch', { '🐣 Type': p.mixed ? 'Mixed' : p.checked ? 'On' : 'Off', '🎛️ Disabled': tf(p.disabled), '🐣 State': 'Default' })
setProp(node, '👁️ Label', label !== undefined && label !== '')
await setText(node, 'Value', label)
await setDescription(node, '👁️  Description', p.description)
return node
},
async Radio(p, spec) {
const label = textOf(spec)
const on = p.checked ?? (p.group !== undefined && p.group === p.value)
if (p.variant === 'button') {
const node = await instance('Radio', { '👥 Variant': 'Button', '🐣 State': p.disabled ? 'Disabled' : on ? 'Active' : 'Default', '🐣 On?': 'Off', '🎛️ Label': 'True' })
await setText(node, null, label)
return node
}
const node = await instance('Radio', { '👥 Variant': 'Input', '🐣 On?': on ? 'On' : 'Off', '🐣 State': p.disabled ? 'Disabled' : 'Default', '🎛️ Label': tf(label) })
await setText(node, 'Value', label)
return node
},
async Input(p) {
const empty = p.value === undefined || p.value === null || p.value === ''
const node = await instance('Input', {
'👥 Variant': 'Single Line',
'👥 Size': p.size === 'large' ? 'Large' : 'Default',
'🐣 State': p.disabled ? 'Disabled' : empty ? 'Empty' : 'Default',
'🎛️  Icon Lead': tf(p.iconName),
'🎛️  Dropdown': 'False',
})
await setText(node, 'Value', empty ? p.placeholder ?? '' : p.value)
return node
},
async Textarea(p) {
const empty = p.value === undefined || p.value === null || p.value === ''
const node = await instance('Input', { '👥 Variant': 'Multi Line', '🐣 State': p.disabled ? 'Disabled' : 'Default' })
await setText(node, 'Value', empty ? p.placeholder ?? '' : p.value)
return node
},
async Dropdown(p) {
const node = await instance('Dropdown', { '🎛️ Disabled': tf(p.disabled), '🎛️ Icon Lead': tf(p.iconName), '🐣 State': 'Default', '👥 Size': p.size === 'large' ? 'Large' : 'Default', '🎛️ Stroke': tf(p.stroke !== false) })
const selected = p.value && (p.value.label ?? p.value)
await setText(node, 'Value', selected ?? p.placeholder ?? 'Select an option')
if (p.iconName) await swapIcon(node, '↪ Icon', p.iconName)
return node
},
async NumericInput(p) {
const empty = p.value === undefined || p.value === null || p.value === ''
const node = await instance('NumericInput', {
'🐣 State': empty ? 'Empty' : 'Default',
'🐣 Var pill': tf(p.variable),
'🐣 Var icon': 'False',
'🎛️  Disabled': tf(p.disabled),
'🐣 Dropdown': tf(p.options && p.options.length),
})
await setText(node, 'Value', empty ? p.placeholder ?? '' : `${p.value}${p.unit ?? ''}`)
if (p.iconName) await swapIcon(node, '🎛️ Icon Lead', p.iconName)
else if (p.label) {
const glyph = node.findOne((n) => n.type === 'INSTANCE' && n.name === 'icon.24.prop-text')
if (glyph) await setText(glyph, 'Icon', p.label)
}
if (p.variable) {
const pill = node.findOne((n) => n.type === 'INSTANCE' && n.name.includes('Chip variable'))
if (pill) await setText(pill, 'Value', p.variable)
}
return node
},
async ColorInput(p) {
const color = parseHex(p.value) || parseHex('#000000')
const opacity = p.opacity ?? 100
const type = p.variable ? 'Variable' : opacity < 100 ? 'Opacity' : 'Fill'
const node = await instance('ColorInput', { '🐣 Type': type, '🐣 State': p.disabled ? 'Disabled' : 'Default' })
const texts = node.findAll((n) => n.type === 'TEXT')
for (const t of texts) {
let next
if (/^[0-9a-f]{6}$/i.test(t.characters)) next = color.hex
else if (/^\d{1,3}$/.test(t.characters)) next = String(Math.round(opacity))
else if (p.variable && t.characters !== '%') next = p.variable
if (next === undefined) continue
for (const f of t.getStyledTextSegments(['fontName']).map((s) => s.fontName)) await figma.loadFontAsync(f)
t.characters = next
}
paintChit(node.findOne((n) => n.type === 'INSTANCE' && n.name.includes('Chit')), color, opacity / 100)
return node
},
async Chit(p) {
const color = parseHex([].concat(p.color || [])[0])
const alpha = (color ? color.alpha : 1) * ((p.opacity ?? 100) / 100)
const gradient = typeof p.color === 'string' && p.color.includes('gradient(')
const node = await instance('Chit', {
'👥 Variant': p.shape === 'circle' ? 'Circle' : 'Square',
'🐣 Type': p.image ? 'Image' : gradient ? 'Gradient' : alpha < 1 ? 'Opacity' : 'Fill',
})
paintChit(node, color, alpha)
return node
},
async IconToggle(p) {
if (p.iconNameOn) {
const node = await instance('IconToggle', {
'👥 Variant': p.highlighted ? 'Highlighted' : 'Default',
'🎛️ On': tf(p.pressed),
'🎛️ Disabled': tf(p.disabled),
'🐣 State': 'Default',
})
const suffix = p.highlighted ? ' (Highlighted)' : ''
await swapIcon(node, '🎛️ Off Icon' + suffix, p.iconName)
await swapIcon(node, '🎛️ On Icon' + suffix, p.iconNameOn)
return node
}
const node = await instance('IconToggleDialog', {
'👥 Variant': p.variant === 'secondary' ? 'Secondary' : 'Default',
'🎛️ On': tf(p.pressed),
'🎛️ Disabled': tf(p.disabled),
'🐣 State': 'Default',
})
await swapIcon(node, '🎛️ Icon', p.iconName)
return node
},
async SplitButton(p) {
const node = await instance('SplitButton', { '👥 Size': p.size === 'large' ? 'Large' : 'Small', '🐣 State': p.disabled ? 'Disabled' : 'Default' })
await swapIcon(node, '🎛️ Icon', p.iconName)
return node
},
async ToggleButton(p, spec) {
const node = await instance('ToggleButton', {
'🎛️ On': tf(p.pressed),
'🎛️ Lead': p.iconName ? 'Icon' : 'False',
'🎛️ Trail': p.badge === undefined || p.badge === null || p.badge === '' ? 'False' : 'Badge',
})
setProp(node, '🎛️ Label', String(p.label ?? textOf(spec) ?? 'Label'))
if (p.iconName) await swapIcon(node, '↪ Icon', p.iconName)
if (p.badge !== undefined && p.badge !== null && p.badge !== '') {
const badge = node.findOne((n) => n.type === 'INSTANCE' && n.name.includes('Badge'))
if (badge) setProp(badge, 'Text', String(p.badge))
}
return node
},
async NumericInputMulti(p) {
const values = p.values || []
const parts = [].concat(p.disabled ?? false)
const partial = parts.length > 1 && parts.some(Boolean) && !parts.every(Boolean)
const node = await instance('NumericInputMulti', {
'🐣 State': values.every((v) => v === null || v === undefined) ? 'Empty' : 'Default',
'👥 Variant': partial ? 'Partial Disable' : 'Default',
'🎛️ Disabled': tf(partial || parts.every(Boolean)),
})
const inIcon = (n) => {
for (let a = n.parent; a && a !== node; a = a.parent) if (a.type === 'INSTANCE' && /^icon\./.test(a.name)) return true
return false
}
const cells = node.findAll((n) => n.type === 'TEXT' && /^-?\d/.test(n.characters) && !inIcon(n))
for (let i = 0; i < cells.length && i < values.length; i++) {
if (values[i] === null || values[i] === undefined) continue
for (const f of cells[i].getStyledTextSegments(['fontName']).map((x) => x.fontName)) await figma.loadFontAsync(f)
cells[i].characters = String(values[i])
}
if (p.iconName) await swapIcon(node, '🎛️  Icon Lead', p.iconName)
return node
},
async Avatar(p) {
const overflow = p.count !== undefined && p.count !== null
const variant = p.disabled
? 'Grey'
: overflow
? p.unread ? 'Overflow Unread' : 'Overflow Read'
: p.src
? 'Photo'
: pick({ purple: 'Purple', blue: 'Blue', pink: 'Pink', red: 'Red', yellow: 'Yellow', green: 'Green', grey: 'Grey' }, p.color, 'Purple')
const node = await instance('Avatar', {
'👥 Variant': variant,
'🐣 State': p.disabled ? 'Disabled' : 'Default',
'👥 Size': pick({ small: 'Small', large: 'Large' }, p.size, 'Default'),
'👥 Shape': p.shape === 'square' ? 'Square' : 'Circle',
})
const text = overflow ? String(p.count) : (p.name || '').trim().charAt(0).toUpperCase()
if (text && variant !== 'Photo') await setText(node, null, text)
return node
},
async VariablePill(p, spec) {
const state = p.disabled ? 'Disabled Secondary' : p.selected ? 'Selected' : p.onSelected ? 'On Selected' : p.muted ? 'Soft Deleted' : 'Default'
const node = await instance('VariablePill', { '🐣 State': state })
await setText(node, 'Value', p.label ?? textOf(spec) ?? '')
return node
},
async Tree(p) {
const node = await instance('Tree')
const slot = node.findOne((n) => n.type === 'SLOT')
if (!slot) return node
for (const c of [...slot.children]) c.remove()
const open = (id, isParent) => isParent && (p.expanded ? p.expanded.includes(id) : true)
const leaves = (n) => (n.children && n.children.length ? n.children.flatMap(leaves) : [n.id])
const ticked = new Set(p.checked || [])
const walk = async (list, depth) => {
for (const n of list) {
const isParent = !!(n.children && n.children.length)
const row = await instance('TreeRow', {
'🎛️ Depth': String(Math.min(depth, 3)),
'🐣 Twisty': isParent ? (open(n.id, isParent) ? 'Open' : 'Closed') : 'None',
'🐣 Selected': tf(p.mode === 'single' && p.selected === n.id),
})
slot.appendChild(row)
row.layoutSizingHorizontal = 'FILL'
setProp(row, '🎛️ Label', n.label ?? '')
setProp(row, '👁️ Detail', !!n.detail)
if (n.detail) setProp(row, '🎛️ Detail', String(n.detail))
setProp(row, '👁️ Icon', !!n.iconName)
if (n.iconName) await swapIcon(row, '↪ Icon', n.iconName)
setProp(row, '👁️ Checkbox', p.mode === 'check')
if (p.mode === 'check') {
const all = leaves(n)
const on = all.filter((id) => ticked.has(id)).length
const box = row.findOne((x) => x.type === 'INSTANCE' && x.name === 'Checkbox')
if (box) box.setProperties({ '🐣 Type': on === 0 ? 'Unchecked' : on === all.length ? 'Checked' : 'Mixed', '🎛️ Muted': tf(on === 0) })
}
if (open(n.id, isParent)) await walk(n.children, depth + 1)
}
}
await walk(p.nodes || [], 0)
return node
},
async Tabs(p) {
const tabs = p.tabs || []
const node = await instance('Tabs', { 'Tab Count': String(Math.min(Math.max(tabs.length, 1), 5)) })
const items = node.children.filter((c) => c.type === 'INSTANCE')
items.forEach((tab, i) => {
if (!tabs[i]) return
setProp(tab, 'Text', tabs[i].label ?? tabs[i])
setProp(tab, '🐣 Selected', tf(i === (p.selectedTab ?? 0)))
const badge = tabs[i].badge
setProp(tab, '🎛️ Badge', badge !== undefined && badge !== null && badge !== '')
})
for (let i = 0; i < items.length; i++) {
const badge = tabs[i] && tabs[i].badge
if (badge === undefined || badge === null || badge === '') continue
const count = items[i].findOne((n) => n.type === 'INSTANCE' && n.name.includes('Badge'))
if (!count) continue
setProp(count, '👥 Variant', tabs[i].unread ? 'Count New' : i === (p.selectedTab ?? 0) ? 'Default' : 'Count Inactive')
await setText(count, null, String(badge))
}
return node
},
async SegmentedControl(p, spec) {
const segments = [].concat(spec.children || []).filter((s) => s && s.c === 'Segment')
const iconMode = segments.some((s) => s.props && s.props.iconName)
const count = String(Math.min(Math.max(segments.length, 2), 6)).padStart(2, '0')
const node = await instance('SegmentedControl', { '👥 Variant': iconMode ? 'Icon' : 'Label', '👥 Tab Count': count, '🐣 State': p.disabled ? 'Disabled' : 'Default' })
const items = node.children.filter((c) => c.type === 'INSTANCE')
for (let i = 0; i < items.length; i++) {
const s = segments[i]
if (!s) continue
const sp = s.props || {}
setProp(items[i], '🐣 Active', tf(sp.value !== undefined && sp.value === p.value))
if (iconMode) {
await swapIcon(items[i], '🎛️ Icon', sp.iconName)
setProp(items[i], '🎛️ Text', sp.tooltip ?? sp.ariaLabel ?? '')
} else setProp(items[i], '🎛️ Label', textOf(s) ?? String(sp.value))
}
return node
},
async Slider(p) {
const knob = String(Math.min(5, Math.max(1, Math.round((((p.value ?? 50) - (p.min ?? 0)) / ((p.max ?? 100) - (p.min ?? 0))) * 4) + 1)))
const variant = p.disabled
? 'Disabled'
: p.variant === 'range' && p.defaultValue !== undefined && p.defaultValue !== null
? 'Corner Radius'
: pick({ range: 'Range', delta: 'Slider', stepper: 'Stepper', hue: 'Color Range', opacity: 'Fill' }, p.variant, 'Range')
return instance('Slider', { '👥 Variant': variant, '🐣 Knob Position': knob })
},
async Banner(p, spec) {
const node = await instance('Banner', { '👥 Variant': pick({ danger: 'Danger', warning: 'Warning', info: 'Info', success: 'Success' }, p.variant, 'Danger') })
setProp(node, '🎛️ Message', p.message ?? textOf(spec) ?? '')
return node
},
async Chip(p) {
const node = await instance('Chip', { '👥 Variant': p.variant === 'component' ? 'Component' : 'Default', '🐣 State': p.disabled ? 'Disabled' : p.focused ? 'Focused' : 'Default' })
setProp(node, '🎛️ Label', p.label ?? '')
setProp(node, '👁️ Close', !!p.closable)
setProp(node, '👁️ Icon', !!p.iconName)
if (p.iconName) await swapIcon(node, '↪ Icon', p.iconName)
return node
},
async Tooltip(p, spec, parent, ctx) {
if (!p.show) {
let last = null
for (const child of [].concat(spec.children || [])) last = await build(child, parent, ctx)
return new Placed(last)
}
const dir = pick({ Top: 'TopCenter', Bottom: 'BottomCenter' }, p.direction, p.direction || 'TopCenter')
const node = await instance('Tooltip', { '🎛️ Direction': dir })
setProp(node, '🎛️ Label', p.label ?? '')
setProp(node, '👁️ Hotkey', !!p.hotkey)
return node
},
async Menu(p) {
const node = await instance('Menu')
const rows = []
let lastSection
let lastGroup
;(p.menuItems || []).forEach((item, i) => {
const section = item.section ?? item.group
if (i > 0 && section !== lastSection) rows.push({ kind: 'divider' })
if (item.group && (i === 0 || item.group !== lastGroup) && (item.showHeading ?? p.showGroupLabels)) rows.push({ kind: 'heading', text: item.group })
rows.push({ kind: 'item', ...item })
lastSection = section
lastGroup = item.group
})
const checkColumn = p.itemVariant === 'checkmark' || rows.some((r) => r.type === 'check')
const slot = node.findOne((n) => n.type === 'SLOT')
for (const c of [...slot.children]) c.remove()
const add = (row) => {
slot.appendChild(row)
row.layoutSizingHorizontal = 'FILL'
}
if (p.searchable) {
const search = await instance('Input', { '👥 Variant': 'Single Line', '👥 Size': 'Default', '🐣 State': 'Empty', '🎛️  Icon Lead': 'True', '🎛️  Dropdown': 'False' })
await setText(search, 'Value', p.searchPlaceholder ?? 'Search')
const lead = search.findOne((n) => n.type === 'INSTANCE' && n.name.startsWith('icon.'))
if (lead) lead.swapComponent(await icon('icon.24.search.small'))
add(search)
add(await instance('MenuDivider'))
}
for (const r of rows) {
const sub = tf(r.subMenu && r.subMenu.length)
let row
if (r.kind === 'divider') row = await instance('MenuDivider')
else if (r.kind === 'heading') {
row = await instance('MenuRowHeading', { '🎛️ Alignment': 'Default' })
setProp(row, '🎛️ Text', r.text)
} else if (r.type === 'toggle') {
row = await instance('MenuRowToggle', { '🐣 Toggle State': r.checked === true ? 'On' : 'Off', '👁️ hasIcon': r.iconName ? 'true' : 'false' })
setProp(row, '🎛️ Text', r.label)
setProp(row, '👁️ hasShortcut', !!r.detail)
if (r.detail) setProp(row, '↪ Shortcut', r.detail)
if (r.iconName) await swapIcon(row, '↪ Icon', r.iconName)
} else if (r.type === 'checkbox' || (!checkColumn && (r.iconName || r.badge || r.avatar))) {
const box = r.type === 'checkbox'
const trail = box ? (r.detail ? 'Mixed' : 'Checkbox') : r.badge ? 'Badge' : r.detail ? 'Shortcut' : 'False'
row = await instance('MenuRowComplex', { '🐣 State': 'Default', '🎛️ Trail': trail, '🎛️ Lead': r.avatar ? 'Avatar' : r.iconName ? 'Icon' : 'False' })
setProp(row, '🎛️ Text', r.label)
if (r.detail) setProp(row, '🎛️ Shortcut', r.detail)
if (r.iconName) {
const glyph = row.findOne((n) => n.type === 'INSTANCE' && n.name.startsWith('icon.'))
const c = await icon(r.iconName)
if (glyph && c) glyph.swapComponent(c)
}
if (r.avatar) {
const person = row.findOne((n) => n.type === 'INSTANCE' && n.name === 'Avatar')
const color = pick({ purple: 'Purple', blue: 'Blue', pink: 'Pink', red: 'Red', yellow: 'Yellow', green: 'Green', grey: 'Grey' }, r.avatar.color, null)
if (person && color) person.setProperties({ '👥 Variant': color })
if (person && r.avatar.name) await setText(person, null, r.avatar.name.trim().charAt(0).toUpperCase())
}
if (r.badge) {
const badge = row.findOne((n) => n.type === 'INSTANCE' && n.name === 'Badge small')
if (badge) await setText(badge, null, r.badge)
}
if (box) {
const check = row.findOne((n) => n.type === 'INSTANCE' && n.name === 'Checkbox')
const on = r.checked === true || r.checked === 'mixed'
if (check) check.setProperties({ '🐣 Type': r.checked === 'mixed' ? 'Mixed' : on ? 'Checked' : 'Unchecked', '🎛️ Muted': tf(!on) })
}
} else if (checkColumn) {
const on = r.type === 'check' ? r.checked : p.itemVariant === 'checkmark' && r.selected
row = await instance('MenuRowCheckmark', { '👥 Variant': on === 'mixed' ? 'Dot' : 'Check', '🐣 State': r.disabled ? 'Disabled' : 'Default', '🎛️ Submenu': sub })
setProp(row, '🎛️ Text', r.label)
setProp(row, '🎛️ On', !!on)
setProp(row, '👁️ hasShortcut', !!r.detail)
if (r.detail) setProp(row, '↪ Shortcut', r.detail)
} else {
row = await instance('MenuRowSimple', { '🐣 State': r.disabled ? 'Disabled' : 'Default', '🎛️ Submenu': sub })
setProp(row, '🎛️ Text', r.label)
setProp(row, '👁️ hasShortcut', !!r.detail)
if (r.detail) setProp(row, '↪ Shortcut', r.detail)
}
add(row)
}
if (p.footerLabel && p.footerVariant === 'row') {
add(await instance('MenuDivider'))
const row = await instance('MenuRowFooter')
setProp(row, '🎛️ Text', p.footerLabel)
add(row)
} else if (p.footerLabel) {
add(await instance('MenuDivider'))
const button = await instance('Button', { '👥 Variant': 'Secondary', '👥 Size': 'Wide', '🎛️ Disabled': 'False', '🎛️ Icon Lead': 'False', '🐣 State': 'Default' })
setProp(button, '🎛️ Label', p.footerLabel)
add(button)
}
return node
},
async Modal(p, spec, parent, ctx) {
const s = spec.slots || {}
const footer = s['footer-full'] ? 'Full' : s['footer-left'] || s['footer-right'] ? 'Split' : 'None'
const width = typeof p.width === 'number' ? 'Large' : pick({ small: 'Small', medium: 'Medium', large: 'Large' }, p.width, 'Medium')
const node = await instance('Modal', { '👥 Width': width, '👥 Footer': footer })
if (typeof p.width === 'number') node.resize(p.width, node.height)
const content = node.findOne((n) => n.type === 'SLOT' && n.name === 'Content slot')
if (p.contentPadding === false) {
for (const f of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'itemSpacing']) {
content.setBoundVariable(f, null)
content[f] = 0
}
}
setProp(node, '🎛️ Title', p.title ?? '')
setProp(node, '👁️ Icon 2', !!p.icon2)
if (p.footerBorder === false) setProp(node, '👁️ Footer border', false)
await fillSlot(node, 'Content slot', spec.children ?? [], ctx)
if (footer === 'Split') {
await fillSlot(node, 'Footer left slot', s['footer-left'] ?? [], ctx)
await fillSlot(node, 'Footer right slot', s['footer-right'] ?? [], ctx)
} else if (footer === 'Full') {
const slot = await fillSlot(node, 'Footer full slot', s['footer-full'], ctx)
for (const c of slot.children) c.layoutSizingHorizontal = 'FILL'
}
if (p.height) {
node.resize(node.width, p.height)
content.layoutSizingVertical = 'FILL'
}
return node
},
async Header(p, spec, parent, ctx) {
const s = spec.slots || {}
const node = await instance('Header')
setProp(node, '🎛️ Title', p.title ?? '')
setProp(node, '👁️ Title', !!p.title)
setProp(node, '👁️ Border', !p.noBorder)
setProp(node, '👁️ Left slot', !!s.left)
setProp(node, '👁️ Center slot', !!s.center)
if (s.left) await fillSlot(node, 'Left slot', s.left, ctx)
if (s.center) await fillSlot(node, 'Center slot', s.center, ctx)
await fillSlot(node, 'Right slot', s.right ?? [], ctx)
return node
},
async Footer(p, spec, parent, ctx) {
const s = spec.slots || {}
const variant = pick({ right: 'Right', split: 'Split', full: 'Full' }, p.variant, 'Right')
const node = await instance('Footer', { '👥 Variant': variant })
if (variant === 'Split') {
await fillSlot(node, 'Left slot', s.left ?? [], ctx)
await fillSlot(node, 'Right slot', s.right ?? [], ctx)
} else {
const slot = await fillSlot(node, 'Actions slot', spec.children ?? [], ctx)
if (variant === 'Full') for (const c of slot.children) c.layoutSizingHorizontal = 'FILL'
}
return node
},
async PluginLayout(p, spec, parent, ctx) {
const node = await instance('PluginLayout')
await fillSlot(node, 'Content slot', spec.children ?? [], ctx)
return node
},
async FieldGroup(p, spec, parent, ctx) {
const node = await instance('FieldGroup', { '👥 Size': p.size === 'small' ? 'Small' : 'Default' })
setProp(node, '🎛️ Label', p.label ?? '')
setProp(node, '👁️ Label', !!p.label)
await fillSlot(node, 'Control slot', spec.children ?? [], ctx)
return node
},
async EmptyState(p, spec, parent, ctx) {
const node = await instance('EmptyState', { '👥 Size': pick({ small: 'Small', medium: 'Medium', large: 'Large' }, p.size, 'Medium') })
setProp(node, '🎛️ Message', p.message ?? '')
setProp(node, '👁️ Icon', !!p.icon)
if (p.icon) await swapIcon(node, '↪ Icon', p.icon)
const actions = p.actions || (p.action ? [p.action] : [])
setProp(node, '👁️ Actions', actions.length > 0)
if (actions.length) await fillSlot(node, 'Actions slot', actions.map((a) => ({ c: 'Button', props: { variant: 'secondary', label: a.label } })), ctx)
return node
},
async LoadingState(p) {
const node = await instance('LoadingState')
setProp(node, '🎛️ Message', p.message ?? 'Loading...')
return node
},
async StatusBar(p) {
const node = await instance('StatusBar', { '👥 Type': pick({ info: 'Info', success: 'Success', warning: 'Warning', error: 'Error' }, p.type, 'Info') })
setProp(node, '🎛️ Message', p.message ?? '')
return node
},
async ListItem(p, spec) {
const meta = typeof spec.children === 'string' ? spec.children : p.meta
const node = await instance('ListItem', { '🐣 Active': tf(p.active) })
setProp(node, '🎛️ Title', p.title ?? '')
setProp(node, '👁️ Meta', !!meta)
if (meta) setProp(node, '🎛️ Meta', meta)
setProp(node, '👁️ Menu', !!(p.menuItems && p.menuItems.length))
setProp(node, '👁️ Badge', !!p.hasBadge)
return node
},
async CheckboxCard(p, spec) {
const node = await instance('CheckboxCard', { '🎛️ Disabled': tf(p.disabled) })
setProp(node, '👁️ Secondary', !!p.secondary)
if (p.secondary) setProp(node, '🎛️ Secondary', p.secondary)
const cb = node.findOne((n) => n.type === 'INSTANCE' && n.name === 'Checkbox')
if (cb) {
cb.setProperties(p.checked ? { '🐣 Type': 'Checked', '🎛️ Muted': 'False' } : { '🐣 Type': 'Unchecked', '🎛️ Muted': 'True' })
await setText(cb, 'Value', textOf(spec) ?? '')
}
return node
},
}
async function buildText(spec, parent) {
const t = figma.createText()
t.name = spec.name || 'Text'
await t.setTextStyleIdAsync((await textStyle(spec.variant || 'body-medium')).id)
t.characters = String(spec.text)
t.fills = [await paint(spec.color || 'text')]
if (spec.align) t.textAlignHorizontal = spec.align.toUpperCase()
parent.appendChild(t)
if (spec.truncate) {
t.textTruncation = 'ENDING'
t.maxLines = 1
}
if (spec.width) {
t.textAutoResize = 'HEIGHT'
t.resize(spec.width, t.height)
} else if (isVertical(parent) || spec.grow) {
t.layoutSizingHorizontal = 'FILL'
t.textAutoResize = 'HEIGHT'
}
return t
}
async function buildStack(spec, parent, ctx) {
const dir = spec.stack === 'h' || spec.stack === 'horizontal' ? 'HORIZONTAL' : 'VERTICAL'
const f = figma.createAutoLayout(dir, { name: spec.name || (dir === 'VERTICAL' ? 'Stack' : 'Row') })
f.fills = spec.fill ? [await paint(spec.fill)] : []
await spacing(f, 'itemSpacing', spec.gap ?? 8)
const pad = spec.padding ?? 0
const [pt, pr, pb, pl] = Array.isArray(pad) ? pad : [pad, pad, pad, pad]
await spacing(f, 'paddingTop', pt)
await spacing(f, 'paddingRight', pr)
await spacing(f, 'paddingBottom', pb)
await spacing(f, 'paddingLeft', pl)
if (spec.align) f.counterAxisAlignItems = { start: 'MIN', center: 'CENTER', end: 'MAX' }[spec.align] || 'MIN'
if (spec.justify) f.primaryAxisAlignItems = { start: 'MIN', center: 'CENTER', end: 'MAX', between: 'SPACE_BETWEEN' }[spec.justify] || 'MIN'
if (spec.wrap) f.layoutWrap = 'WRAP'
if (spec.radius) f.cornerRadius = spec.radius
if (spec.stroke) {
f.strokes = [await paint(spec.stroke)]
f.strokeWeight = 1
f.strokeAlign = 'INSIDE'
if (spec.strokeSides) {
for (const side of ['Top', 'Right', 'Bottom', 'Left']) f[`stroke${side}Weight`] = spec.strokeSides.includes(side.toLowerCase()) ? 1 : 0
}
}
parent.appendChild(f)
if (spec.width) {
f.layoutSizingHorizontal = 'FIXED'
f.resize(spec.width, f.height)
} else if (isVertical(parent) || spec.grow) f.layoutSizingHorizontal = 'FILL'
if (spec.fillHeight) f.layoutSizingVertical = 'FILL'
if (spec.height) {
f.layoutSizingVertical = 'FIXED'
f.resize(f.width, spec.height)
}
for (const child of [].concat(spec.children || [])) await build(child, f, ctx)
return f
}
async function buildGrid(spec, parent, ctx) {
const cols = spec.grid
const gap = spec.gap ?? 8
const f = await buildStack({ stack: 'v', gap, name: spec.name || 'Grid' }, parent, ctx)
const items = [].concat(spec.children || [])
for (let i = 0; i < items.length; i += cols) {
const row = await buildStack({ stack: 'h', gap, name: 'Row' }, f, ctx)
for (const item of items.slice(i, i + cols)) {
const n = await build(item, row, ctx)
if (n) n.layoutSizingHorizontal = 'FILL'
}
for (let k = items.slice(i, i + cols).length; k < cols; k++) {
const spacer = figma.createFrame()
spacer.name = 'Empty cell'
spacer.fills = []
row.appendChild(spacer)
spacer.layoutSizingHorizontal = 'FILL'
spacer.resize(spacer.width, 1)
}
}
return f
}
async function buildDivider(spec, parent) {
const r = figma.createRectangle()
r.name = 'Divider'
r.fills = [await paint('border')]
parent.appendChild(r)
r.resize(parent.width || 100, 1)
if (isVertical(parent)) r.layoutSizingHorizontal = 'FILL'
return r
}
async function buildSwatch(spec, parent) {
const hex = spec.swatch.replace('#', '')
const r = figma.createRectangle()
r.name = spec.name || 'Swatch'
r.resize(spec.size || 16, spec.size || 16)
r.cornerRadius = spec.radius ?? 4
r.fills = [{ type: 'SOLID', color: { r: parseInt(hex.slice(0, 2), 16) / 255, g: parseInt(hex.slice(2, 4), 16) / 255, b: parseInt(hex.slice(4, 6), 16) / 255 } }]
r.strokes = [await paint('border')]
r.strokeWeight = 1
r.strokeAlign = 'INSIDE'
parent.appendChild(r)
return r
}
async function buildIcon(spec, parent) {
const c = await icon(spec.icon)
const i = c.createInstance()
if (spec.color) {
const p = await paint(spec.color)
for (const v of i.findAll((n) => n.type === 'VECTOR' || n.type === 'BOOLEAN_OPERATION')) v.fills = [p]
}
parent.appendChild(i)
return i
}
const isVertical = (n) => n && n.layoutMode === 'VERTICAL'
async function build(spec, parent, ctx) {
if (spec === null || spec === undefined || spec === false) return null
if (typeof spec === 'string') return buildText({ text: spec }, parent)
if (spec.text !== undefined && !spec.c) return buildText(spec, parent)
if (spec.stack) return buildStack(spec, parent, ctx)
if (spec.grid) return buildGrid(spec, parent, ctx)
if (spec.divider) return buildDivider(spec, parent)
if (spec.swatch) return buildSwatch(spec, parent)
if (spec.icon) return buildIcon(spec, parent)
const fn = BUILDERS[spec.c]
if (!fn) throw new Error(`No builder for "${spec.c}"`)
const result = await fn(spec.props || {}, spec, parent, ctx)
if (result instanceof Placed) return result.node
const node = result
if (spec.name) node.name = spec.name
parent.appendChild(node)
if (isVertical(parent) && (BLOCK.has(spec.c) || spec.fill)) node.layoutSizingHorizontal = 'FILL'
if (spec.grow && !isVertical(parent)) node.layoutSizingHorizontal = 'FILL'
if (spec.fillHeight && isVertical(parent)) node.layoutSizingVertical = 'FILL'
ctx.created.push(node.id)
return node
}
async function buildMockup(spec, options = {}) {
ICON_MAP = options.icons || {}
const page = options.page ? await figma.getNodeByIdAsync(options.page) : figma.currentPage
if (page !== figma.currentPage) await figma.setCurrentPageAsync(page)
const right = page.children.reduce((m, n) => Math.max(m, n.x + n.width), 0)
const ctx = { created: [] }
if (spec.window) for (const n of page.children.filter((n) => n.name === spec.window)) n.remove()
let root
if (spec.window) {
root = figma.createAutoLayout('VERTICAL', { name: spec.window })
root.fills = [await paint('bg')]
root.cornerRadius = 13
root.clipsContent = true
root.counterAxisSizingMode = 'FIXED'
root.resize(spec.width || 320, 100)
if (spec.height) {
root.primaryAxisSizingMode = 'FIXED'
root.resize(spec.width || 320, spec.height)
}
page.appendChild(root)
for (const child of [].concat(spec.children || [])) await build(child, root, ctx)
const layout = root.children.find((c) => c.name === 'Plugin layout' || c.name === 'PluginLayout')
if (layout && spec.height) layout.layoutSizingVertical = 'FILL'
} else {
const holder = figma.createAutoLayout('VERTICAL', { name: 'Mockup holder' })
page.appendChild(holder)
root = await build(spec, holder, ctx)
page.appendChild(root)
holder.remove()
}
root.x = options.x ?? right + 100
root.y = options.y ?? 0
return { root: root.id, created: ctx.created.length }
}
```
