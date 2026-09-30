---
description: "Write a short user guide for a plugin (GUIDE.md) with annotated mockups of its key screens in Figma. Use when asked for a guide, how-to or walkthrough of a plugin, or to explain how a plugin works to its users. Usage: /figma-plugin-kit:guide [plugin]"
---

# Plugin user guides

A guide explains how a plugin works, screen by screen, to the designers who use it. It is a Markdown file, `<Plugin>/GUIDE.md`, with an annotated mockup of each key screen. The README says what the plugin is and how to build it; the guide says what each control does. `Vitrine Tools/GUIDE.md` (large) and `Batch Rename Variants/GUIDE.md` (small) show the target density.

## Inputs

- **The plugin folder.** Read `src/PluginUI.svelte`, its child components and `src/code.ts` before writing a line.
- **A Figma page for the images**, in the UI3 file (`6dJFbL7SDC7kkS1fu3AHH6`). Each plugin has its own page, named after it. Ask for the URL if the user doesn't give one.

## Structure

- `# <Plugin>`, then an intro of two sentences at most: what the plugin does, with one concrete example, and the main idea it turns on.
- One `##` per tab or task. A one-screen plugin has one `##`, named for the task ("Rename a value").
- Under it, a `###` per view (Sidebar, Table, Preview, Review) where there are several. Each view is:
  1. The image, `![](<file>.png)`, alone on its line.
  2. One line on what the view shows, when the heading doesn't already say it.
  3. A numbered list that matches the pins on the image: `1. **<UI label>** — what it does.`
  4. A closing line for the primary action: `Click **<button label>** to <result>. Press Ctrl/Cmd+Z to undo.`
- Mention states that don't earn an image (empty selection, errors) in one sentence at the end of the section.

## Length budget

- About one screen per tab. Cut anything that restates the image, the heading or another item.
- Three or four pins per image. More means the image needs to be split, or some controls don't need an item. A screen with one field can have none, and prose in place of the list.
- One example per idea. Don't list every option in a dropdown or every value of a scale; describe the pattern and name one.

## Writing

The readers are designers, many reading in a second language. Plainness is a correctness requirement.

- **Use the UI's own labels, in bold, exactly as the code has them.** Quote names and values from the file in code style: `heading/1/sm-lg`, `size=sm`.
- **One name per concept.** Pick one word for a thing (set, value, breakpoint) and keep it through the whole guide.
- **No idiom, metaphor or phrasal verb** where a plain verb exists. Every sentence has a subject that acts. Use the imperative for what the reader does: "Click a set to open it in the table."
- **One em dash per sentence**, only after a bold label in a list item. Elsewhere use a colon, a full stop or parentheses.
- **Current state only.** No history, no "new", no changelog. No claims about the reader ("the most common mistake").
- **Every claim traces to code.** Limits, rules and side effects come from reading `code.ts` (for example the characters a name can't contain), not from labels or guesses. Where code and copy disagree, describe what the code does and tell the user about the mismatch.
- US spelling ("color"), sentence case, no exclamation marks.

## Images

Build each image with the `mockup` skill. Use the repo copy, `_skills/figma-plugin-kit/skills/mockup/SKILL.md`; an installed plugin copy may be older. `guide-image.js`, next to this file, turns a built mockup into a guide image and its export frame (steps 2 to 4 and 6 below).

The builder, the helper and a spec must fit in 50,000 characters. Keep only the `BUILDERS` and `UI3` entries the specs use (from `_packages/figma-plugin-utilities/figma/mockup/build-mockup.js`), minify with esbuild (`--minify-whitespace --minify-syntax --charset=utf8 --line-limit=1800`), and wrap it all in `async function __wrap(){ … return { buildMockup, guideImage, guideFrames } }`. For several images, stash `__wrap.toString()` in a hidden text node in the first call, run `eval('(' + stash.characters + ')')()` in the later ones, and delete the stash at the end.

A FieldGroup inside another FieldGroup's slot drops the outer group's other children. Wrap them in a stack instead.

An image can also show what the plugin draws on the canvas. Build it with the plugin's own drawing code from `code.ts`, and place pins with `find` on a point, since a shape's bounding box has no useful corner.

1. **Show a real state.** Use default values or a realistic example that matches the guide's text (`size`, `sm`, `small`), with the primary action enabled.
2. **One component set per plugin**, `<Plugin> guide images`, on the plugin's page. Each image is a variant named `Property 1=<file>`, where `<file>` is the image reference without `.png`: `batch-rename-form`, `typography-sidebar`. Name files `<tab>-<view>`, or `<plugin>-<view>` for a one-screen plugin. A variant is a transparent component that doesn't clip, with the mockup inset 24px on every side.
3. **Pins** are the UI3 `Comments/Pin` component (set `2012:63899` on the Comments page), variant `👥 Variant=1, 🐣 Type=Pin, 🐣 Hover=False, 🐣 Read=False, 🐣 Selected=False, 🐣 Active=True`. On each instance, set the nested `Avatar` instance's `👥 Variant` to `Blue`, then set its text layer `A` to the number (load its font first). Name the layer `Annotation <n>`.
4. **Place each pin** with its tip (bottom-left corner) 4px after the end of the label's text: `x = renderBounds.right + 4`, `y = boundingBox.bottom − 32`. Use `absoluteRenderBounds` for the right edge, since a label that fills its row has a bounding box as wide as the row. Number pins in reading order, top to bottom.
5. **Check the screenshot**: no pin covers the text it names, and the numbers match the list.
6. **Frame each image for export.** `guideImage` ends with `guideFrames(set)`, which gives every variant a frame named after its file (`data-mapper-sources`), in a row under the set: 680px wide (the width of a document's image block), an instance of the variant centered on the Vitrine Utilities `background/secondary` fill with `space/5` padding, and SVG and PNG 2x export settings. It reuses frames by name, so run `guideFrames(set)` on its own to frame a set built before this step. A variant is rebuilt in place, so its instances in frames and documents follow it.

## Publishing

The user turns `GUIDE.md` into a Figma document with the Markdown Docs plugin, and places the image variants in its image blocks. The frames export as SVG for Notion, and as PNG files named like the image references in `GUIDE.md`. `npm run notion-zip -- "<Plugin>" --export` renders the frames as SVG next to `GUIDE.md` and packs the guide for Notion's Markdown import, pointing each image line at its SVG. Without `--export` it packs the SVGs already there. Keep each image reference alone on its line, and keep the file names stable, since the plugin matches images by file name.
