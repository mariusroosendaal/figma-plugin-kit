---
description: "Write a short user guide for a plugin (GUIDE.md) with annotated mockups of its key screens in Figma. Use when asked for a guide, how-to or walkthrough of a plugin, or to explain how a plugin works to its users. Usage: /figma-plugin-kit:guide [plugin]"
---

# Plugin user guides

A guide explains how a plugin works, screen by screen, to the designers who use it. It is a Markdown file, `<Plugin>/docs/GUIDE.md`, with an annotated mockup of each key screen. The README says what the plugin is and how to build it; the guide says what each control does. `Vitrine Tools/docs/` (large, in parts) and `Batch Rename Variants/docs/GUIDE.md` (small) show the target density.

## Inputs

- **The plugin folder.** Read `src/PluginUI.svelte`, its child components and `src/code.ts` before writing a line.
- **A Figma page for the images**, in the UI3 file (`6dJFbL7SDC7kkS1fu3AHH6`). Each plugin has its own page, named after it. Ask for the URL if the user doesn't give one.

## Structure

- `# <Plugin>`, then an intro of two or three sentences: what the reader gets from the plugin, with one concrete example, then the main idea it turns on. Start from the reader's task ("Icon Swapper moves a file from one icon collection to another…"), not from the mechanism.
- One `##` per tab or task. A one-screen plugin has one `##`, named for the task ("Rename a value").
- Under it, a `###` per view (Sidebar, Table, Preview, Review) where there are several. Each view is:
  1. The image, `![](<file>.svg)`, alone on its line.
  2. One line on what the view shows, when the heading doesn't already say it.
  3. A numbered list that matches the pins on the image: `1. **<UI label>**: what it does.`
  4. A closing line for the primary action: `Click **<button label>** to <result>. Press Ctrl/Cmd+Z to undo.`
- Mention states that don't earn an image (empty selection, errors) in one sentence at the end of the section.
- A guide with several large tabs goes in parts. `GUIDE.md` keeps the title and the intro, and lists the parts as `1. **<Tab>**: what it covers.`, without links: Markdown Docs takes only absolute URLs, and a relative link fails the whole file. Each part is `docs/guide-<tab>.md`, with `# <Tab>` and a `##` per view. A tab's settings go in its part, under `## Settings`; the first-run setup and anything for the whole plugin get a part of their own.

## Length budget

- About one screen per tab. Cut anything that restates the image, the heading or another item.
- Three or four pins per image. More means the image needs to be split, or some controls don't need an item. A screen with one field can have none, and prose in place of the list.
- One example per idea. Don't list every value of a scale or every option of a long list; describe the pattern and name one.

## Writing

The readers are designers, many reading in a second language. Plainness is a correctness requirement. Plain doesn't mean cold: write as a colleague showing the plugin to someone at their desk, in short, simple sentences.

- **Use the UI's own labels, in bold, exactly as the code has them.** Quote names and values from the file in code style: `heading/1/sm-lg`, `size=sm`. Drop the count from a label that changes with the reader's file: "Click **Swap icons**", not "Click **Swap 114 icons**". Say what the count means only when it helps: "The button shows how many layers change."
- **One name per concept.** Pick one word for a thing (set, value, breakpoint) and keep it through the whole guide.
- **No idiom, metaphor or phrasal verb** where a plain verb exists. Every sentence has a subject that acts. Use the imperative for what the reader does: "Click a set to open it in the table."
- **Talk to the reader.** Make "you" the subject when the reader acts or sees something, and keep "the plugin" for what it does on its own. "High-confidence matches start checked", not "The plugin checks the matches of high confidence for you". A guide where most sentences start with "The plugin" reads like a spec.
- **Give the reason for a surprise.** When a behavior could puzzle the reader (an empty cell, a dimmed value, rows left out), add a short clause on why: "The cell where a color meets itself stays empty, since there is nothing to compare." Skip it when the reason is obvious.
- **Reassure before a big change.** Before a bulk or destructive action, say what stays safe: nothing changes until the reader clicks the button, edits stay private until written, Ctrl/Cmd+Z undoes it. A reason that frees the reader to experiment is welcome ("so you can try things freely").
- **Write rules as help.** Matching rules, limits and edge cases go in an "If … " line that starts from what the reader sees and ends with what to do: "If a match looks wrong, check the names. … For any other icon, pick the right one from the dropdown."
- **Common contractions are fine**: don't, isn't, can't, it's, you're. Skip the rarer ones (you'd, it'll, there'd).
- **A colon after a bold label in a list item**: `**Scale**: the sizes`, not `**Scale**—the sizes`. Keep it the only colon in that sentence. Elsewhere an em dash is fine, one per sentence, with no spaces around it: `the sizes—and only those`, not `the sizes — and only those`.
- **Current state only.** No history, no "new", no changelog. No claims about the reader ("the most common mistake").
- **Describe only what the image shows.** An item names a control or area that is visible in the mockup and says what it does. A visible button can get one clause for what it opens ("generates the sizes from a formula"), and a visible dropdown can name its options and what each one does (**Create new collection…** creates `responsive`). Don't describe anything else the image doesn't show: the contents of a dialog, popover, menu or editor that is closed in the mockup, or a state it isn't in. Give that screen its own image, or leave it out.
- **Every claim traces to code.** Limits, rules and side effects come from reading `code.ts` (for example the characters a name can't contain), not from labels or guesses. Where code and copy disagree, describe what the code does and tell the user about the mismatch.
- US spelling ("color"), sentence case, no exclamation marks.

## Images

Build each image with the `mockup` skill. Use the repo copy, `_skills/figma-plugin-kit/skills/mockup/SKILL.md`; an installed plugin copy may be older. `guide-image.js`, next to this file, turns a built mockup into a guide image and its export frame (steps 2 to 4 and 6 below).

The builder, the helper and a spec must fit in 50,000 characters. Keep only the `BUILDERS` and `UI3` entries the specs use (from `_packages/figma-plugin-utilities/figma/mockup/build-mockup.js`), minify with esbuild (`--minify-whitespace --minify-syntax --charset=utf8 --line-limit=1800`), and wrap it all in `async function __wrap(){ … return { buildMockup, guideImage, guideFrames } }`. For several images, stash `__wrap.toString()` in a hidden text node in the first call, run `eval('(' + stash.characters + ')')()` in the later ones, and delete the stash at the end.

A FieldGroup inside another FieldGroup's slot drops the outer group's other children. Wrap them in a stack instead.

An image can also show what the plugin draws on the canvas. Build it with the plugin's own drawing code from `code.ts`, and place pins with `find` on a point, since a shape's bounding box has no useful corner.

1. **Show a real state.** Use default values or a realistic example that matches the guide's text (`size`, `sm`, `small`), with the primary action enabled.
2. **One component set per plugin**, `<Plugin> guide images`, on the plugin's page. Each image is a variant named `Property 1=<file>`, where `<file>` is the image reference without `.svg`: `batch-rename-form`, `typography-sidebar`. Name files `<tab>-<view>`, or `<plugin>-<view>` for a one-screen plugin. A variant is a transparent component that doesn't clip, with the mockup inset 24px on every side.
3. **Pins** are the UI3 `Comments/Pin` component (set `2012:63899` on the Comments page), variant `👥 Variant=1, 🐣 Type=Pin, 🐣 Hover=False, 🐣 Read=False, 🐣 Selected=False, 🐣 Active=True`. On each instance, set the nested `Avatar` instance's `👥 Variant` to `Blue`, then set its text layer `A` to the number (load its font first). Name the layer `Annotation <n>`.
4. **Place each pin** with its tip (bottom-left corner) 4px after the end of the label's text: `x = renderBounds.right + 4`, `y = boundingBox.bottom − 32`. Use `absoluteRenderBounds` for the right edge, since a label that fills its row has a bounding box as wide as the row. Number pins in reading order, top to bottom.
5. **Check the screenshot**: no pin covers the text it names, and the numbers match the list.
6. **Frame each image for export.** `guideImage` ends with `guideFrames(set)`, which gives every variant a frame named after its file (`data-mapper-sources`), in a row under the set: 680px wide (the width of a document's image block), an instance of the variant centered on the Vitrine Utilities `background/secondary` fill with `space/5` padding, and SVG and PNG 2x export settings. It reuses frames by name, so run `guideFrames(set)` on its own to frame a set built before this step. A variant is rebuilt in place, so its instances in frames and documents follow it.

## Cover and icon

The Community listing's icon (128px) and cover (1920 × 1080) are built on the plugin's page in the guides file (`32BXCiwUt7nixe5HKsmBfG`), which holds the templates on its components page: the `thumbnail` component, and the `icon` set with a variant per plugin, `icon=<plugin folder in kebab-case>` (`icon=batch-rename-variants`), drawn by the user. An alternative design takes `-alt` (`icon=huetone-to-variables-alt`). Build them after the guide images, with `guideCover({ set, title, description, icon, image })` from `guide-image.js`, in a call of its own on the plugin's page. It reuses the `icon` and `thumbnail` frames by name.

- **title** — the plugin's name.
- **description** — the README's one-line summary, verb first and under 80 characters: "Rename variant property values across many component sets at once."
- **icon** — leave it out to use the plugin's own variant; name another value to use that one. If the plugin has no variant, stop and ask the user to draw one.
- **image** — the guide image to show, without its pins. The first variant by default; pick the screen that shows what the plugin does, at a size that stays readable (a tall sidebar shrinks too far).

The `icon` frame holds a flattened copy of the variant: one white vector over the black fill, strokes outlined and keylines gone, so the SVG is a clean rect and path. It doesn't follow the variant, so run `guideCover` again after editing an icon. The cover keeps a live instance. The pins of every image follow the set's `pins` property, which the cover turns off. `npm run figma-assets -- "<Plugin>"` renders the frames into `<Plugin>/assets/` and writes `card.svg` from the icon, at 2x on black, 800 × 450, which `notion-sync` puts in the guide's Cover property.

## Publishing

Once the images are framed, sync `GUIDE.md` and its parts into Figma documents on the plugin's page, with Markdown Docs' own sync code. `sync-docs.js`, next to this file, is that code bundled for `use_figma`. Each guide file keeps a copy in its root's shared plugin data, so a sync sends only the Markdown. Start the call with the bundle's hash, `shasum sync-docs.js | cut -c1-12`:

```js
const hash = figma.root.getSharedPluginData('markdown_docs', 'agentBundleHash')
if (hash !== '<hash>') return { stale: true, stored: hash }
const MarkdownDocs = (0, eval)('(' + figma.root.getSharedPluginData('markdown_docs', 'agentBundle') + ')')()
await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('<page id>'))
return await MarkdownDocs.syncDocs([{ name: 'GUIDE.md', markdown: <the file, as a JSON string> }])
```

When it returns `stale`, the file has an older copy or none: store the current one in a call of its own. Wrap `sync-docs.js`, pasted whole (its lines that end in `\` continue a string), in `function __md(){ … return MarkdownDocs }`, then end the call with `figma.root.setSharedPluginData('markdown_docs', 'agentBundle', __md.toString())` and the same for `agentBundleHash` with the hash. The guides file (`32BXCiwUt7nixe5HKsmBfG`) has one; the UI3 file stores its own the first time a guide there syncs.

Pass each part as one more `{ name, markdown }`, named like its file; a call takes about 45 KB of Markdown. Each file finds its document as the plugin's **Sync design docs** does (by the stamp a sync left, then by its first heading), rebuilds it in place, and creates one beside the others when nothing matches; the result names what it rebuilt, created or couldn't do. `{ onlyChanged: true }` as a second argument skips the files that haven't changed since their last sync. The user can still run **Sync design docs** themselves; both find the same documents. Rebuild the bundle with `npm run build:agent` in `Markdown Docs` after changing its sync.

Each image line takes a copy of the frame of the same name from that page, in a wide block when the frame is wider than 680px, so the documents need no image placed by hand, and a rebuilt variant shows through. `npm run notion-zip -- "<Plugin>" --export` renders the frames as SVG files next to `GUIDE.md`, named like its image references, and packs the guide for Notion's Markdown import, with its parts. Without `--export` it packs the SVGs already there. Commit the SVGs with the guide: GitHub shows them in `GUIDE.md` as they are, and `npm run notion-sync -- "<Plugin>"` uploads them with the guide to its Notion page. After a guide's first sync, link that page from the README: in a line under the **Usage** steps, which `figma-copy` carries into the Community description with its address. Link its page on `figma-plugins.notion.site`. The frames also export as PNG at 2x, for anywhere that takes no SVG. Keep each image reference alone on its line, and keep the file names stable, since the plugin matches images by file name.
