// Turns a built mockup into a guide image: a variant of the plugin's image set, with numbered pins.
// Run it in the same use_figma call as buildMockup, on the plugin's page. A pin is a label's text,
// { text, nth }, or { find: (win) => node }, where node may be any object with an absoluteBoundingBox.
// dx and dy move the pin's tip.
async function guideImage({ set: setName, image, win, pins, pad = 24 }) {
  const pageNode = figma.currentPage
  const variantName = 'Property 1=' + image
  let set = pageNode.children.find((n) => n.type === 'COMPONENT_SET' && n.name === setName)
  // Rebuild an existing variant in place, so the instances in documents and frames follow it.
  const old = set ? set.children.filter((c) => c.name === variantName) : []
  for (const c of old.slice(1)) c.remove()
  let comp = old[0]
  if (comp) for (const c of [...comp.children]) c.remove()
  else {
    comp = figma.createComponent()
    comp.name = variantName
    pageNode.appendChild(comp)
  }
  comp.fills = []
  comp.clipsContent = false
  comp.resize(Math.round(win.width + pad * 2), Math.round(win.height + pad * 2))
  comp.appendChild(win)
  win.x = pad
  win.y = pad
  const pinSet = await figma.getNodeByIdAsync('2012:63899')
  const pinMain = pinSet.children.find((v) => v.name === '👥 Variant=1, 🐣 Type=Pin, 🐣 Hover=False, 🐣 Read=False, 🐣 Selected=False, 🐣 Active=True')
  const ox = comp.absoluteTransform[0][2]
  const oy = comp.absoluteTransform[1][2]
  const placed = []
  for (let i = 0; i < pins.length; i++) {
    const p = typeof pins[i] === 'string' ? { text: pins[i] } : pins[i]
    const target = p.find ? p.find(win) : win.findAll((n) => n.type === 'TEXT' && n.characters === p.text)[p.nth || 0]
    if (!target) throw new Error('No pin target for ' + JSON.stringify(p.text || i))
    const b = target.absoluteBoundingBox
    const r = (target.type === 'TEXT' && target.absoluteRenderBounds) || b
    const pin = pinMain.createInstance()
    comp.appendChild(pin)
    pin.name = 'Annotation ' + (i + 1)
    pin.findOne((n) => n.type === 'INSTANCE' && n.name === 'Avatar').setProperties({ '👥 Variant': 'Blue' })
    const t = pin.findOne((n) => n.type === 'TEXT' && n.name === 'A')
    for (const f of t.getStyledTextSegments(['fontName']).map((s) => s.fontName)) await figma.loadFontAsync(f)
    t.characters = String(i + 1)
    pin.x = Math.round(r.x + r.width - ox + 4 + (p.dx || 0))
    pin.y = Math.round(b.y + b.height - oy - pin.height + (p.dy || 0))
    placed.push(pin.id)
  }
  if (!set) {
    set = figma.combineAsVariants([comp], pageNode)
    set.name = setName
    set.x = 0
    set.y = 0
  } else if (comp.parent !== set) set.appendChild(comp)
  // A `pins` property shows the pins, so the cover can show the image without them.
  const pinsKey = pinsProperty(set)
  for (const id of placed) (await figma.getNodeByIdAsync(id)).componentPropertyReferences = { visible: pinsKey }
  let x = 40
  let h = 0
  for (const c of set.children) {
    c.x = x
    c.y = 40
    x += c.width + 40
    h = Math.max(h, c.height)
  }
  set.resize(x, h + 80)
  const frames = await guideFrames(set)
  return { set: set.id, image: comp.id, frame: frames[image], pins: placed }
}

// Frames each variant of an image set for export: an instance on the Vitrine Utilities background
// (color/background/secondary, padding layout/space/5), 680px wide like a document's image block,
// named after the image file and set to export as SVG and PNG at 2x. Frames are reused by name and
// laid out in a row under the set, in variant order. guideImage calls it; call it on its own to
// frame an existing set.
async function guideFrames(set, width = 680) {
  const pageNode = set.parent
  const bg = await figma.variables.importVariableByKeyAsync('3539b12e3bcc45b92e14e23963e16960b4f74ba4')
  const space = await figma.variables.importVariableByKeyAsync('4be65b9f7a38b1b32d61d341268e94daa0f13c7b')
  const frames = {}
  let x = set.x
  for (const variant of set.children) {
    const name = variant.name.replace(/^Property 1=/, '')
    let frame = pageNode.children.find((n) => n.type === 'FRAME' && n.name === name)
    if (frame) for (const c of [...frame.children]) c.remove()
    else {
      frame = figma.createFrame()
      frame.name = name
      pageNode.appendChild(frame)
    }
    frame.layoutMode = 'VERTICAL'
    frame.primaryAxisAlignItems = 'CENTER'
    frame.counterAxisAlignItems = 'CENTER'
    for (const side of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) frame.setBoundVariable(side, space)
    frame.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.95 } }, 'color', bg)]
    frame.clipsContent = false
    frame.exportSettings = [
      { format: 'SVG', suffix: '', contentsOnly: true, svgOutlineText: true, svgIdAttribute: false, svgSimplifyStroke: true },
      { format: 'PNG', suffix: '', contentsOnly: true, constraint: { type: 'SCALE', value: 2 } },
    ]
    frame.appendChild(variant.createInstance())
    // A mockup wider than the block widens the frame rather than overflow it.
    frame.resize(Math.max(width, Math.round(variant.width + frame.paddingLeft + frame.paddingRight)), frame.height)
    frame.counterAxisSizingMode = 'FIXED'
    frame.primaryAxisSizingMode = 'AUTO'
    frame.x = x
    frame.y = set.y + set.height + 80
    x += frame.width + 40
    frames[name] = frame.id
  }
  return frames
}

// The image set's `pins` boolean property, added on first use and bound to the pins of a set built
// before it existed. Returns its key.
function pinsProperty(set) {
  let key = Object.keys(set.componentPropertyDefinitions).find((k) => k.split('#')[0] === 'pins')
  if (!key) key = set.addComponentProperty('pins', 'BOOLEAN', true)
  for (const pin of set.findAll((n) => n.type === 'INSTANCE' && /^Annotation \d+$/.test(n.name))) {
    pin.componentPropertyReferences = { visible: key }
  }
  return key
}

// Builds the plugin's Community icon and cover on its page, as two frames named after their files in
// <Plugin>/assets/: `icon`, a flattened copy of the plugin's variant of the `icon` set on the
// components page (SVG and PNG at 1x, 128px; run guideCover again after editing the icon), and `thumbnail`, an instance of the `thumbnail` template
// from the same page with the plugin's title, description, icon and a guide image without its pins
// (PNG at 1x, 1920 × 1080). The variant is `icon=<plugin folder in kebab-case>` unless `icon` names
// another value; the user draws it. The image is the set's first variant unless `image` names another.
// Frames are reused by name; new ones go to the right of the page's content.
async function guideCover({ set, image, title, description, icon }) {
  const pageNode = set.parent
  const variant = image ? set.children.find((c) => c.name === 'Property 1=' + image) : set.children[0]
  if (!variant) throw new Error('No variant ' + image + ' in ' + set.name)
  const find = async (pageName, type, name) => {
    const p = figma.root.children.find((n) => n.name.trim() === pageName)
    if (!p) throw new Error('No ' + pageName + ' page')
    await p.loadAsync()
    const node = p.findAllWithCriteria({ types: [type] }).find((n) => n.name === name)
    if (!node) throw new Error('No ' + type + ' named ' + name + ' on the ' + pageName + ' page')
    return node
  }
  const iconName = 'icon=' + (icon || title.toLowerCase().replace(/\s+/g, '-'))
  const iconVariant = (await find('components', 'COMPONENT_SET', 'icon')).children.find((c) => c.name === iconName)
  if (!iconVariant) throw new Error('No variant ' + iconName + ' in the icon set: draw the icon first')
  const template = await find('components', 'COMPONENT', 'thumbnail')
  const prop = (inst, name) => Object.keys(inst.componentProperties).find((k) => k.split('#')[0] === name)
  const iconInstance = () => {
    const inst = iconVariant.createInstance()
    const keylines = prop(inst, 'show template')
    if (keylines) inst.setProperties({ [keylines]: false })
    return inst
  }
  let right = Math.max(...pageNode.children.map((n) => n.x + n.width))
  const frameFor = (name, w, h, exportSettings) => {
    let frame = pageNode.children.find((n) => n.type === 'FRAME' && n.name === name)
    if (frame) for (const c of [...frame.children]) c.remove()
    else {
      frame = figma.createFrame()
      frame.name = name
      pageNode.appendChild(frame)
      frame.x = right + 200
      frame.y = 0
      right = frame.x + w
    }
    frame.resize(w, h)
    frame.fills = []
    frame.clipsContent = true
    frame.exportSettings = exportSettings
    return frame
  }

  const iconFrame = frameFor('icon', 128, 128, [
    { format: 'SVG', suffix: '', contentsOnly: true, svgOutlineText: true, svgIdAttribute: false, svgSimplifyStroke: true },
    { format: 'PNG', suffix: '', contentsOnly: true, constraint: { type: 'SCALE', value: 1 } },
  ])
  // A clip would wrap the SVG in a clip path.
  iconFrame.clipsContent = false
  flatIcon(iconInstance(), iconFrame)

  const thumbFrame = frameFor('thumbnail', 1920, 1080, [{ format: 'PNG', suffix: '', contentsOnly: true, constraint: { type: 'SCALE', value: 1 } }])
  const cover = template.createInstance()
  thumbFrame.appendChild(cover)
  for (const t of cover.findAllWithCriteria({ types: ['TEXT'] })) {
    for (const f of t.getStyledTextSegments(['fontName']).map((s) => s.fontName)) await figma.loadFontAsync(f)
  }
  cover.setProperties({ [prop(cover, 'title')]: title, [prop(cover, 'description')]: description })
  const fill = (slotName, node) => {
    const slot = cover.findOne((n) => n.type === 'SLOT' && n.name === slotName)
    for (const c of [...slot.children]) c.remove()
    slot.appendChild(node)
  }
  // At 2x, like the cover's text, or smaller where a large mockup would leave its half of the cover.
  const shot = variant.createInstance()
  shot.setProperties({ [pinsProperty(set)]: false })
  shot.rescale(Math.min(2, 864 / shot.width, 984 / shot.height))
  fill('plugin', shot)
  fill('icon', iconInstance())
  return { icon: iconFrame.id, thumbnail: thumbFrame.id }
}

// Turns an icon instance, appended to parent, into a static copy: its black fill and one white
// vector, so the SVG is a rect and a path. Strokes are outlined, white shapes merged, and black
// shapes cut out of what lies under them, in layer order. Hidden layers (the keylines) drop out.
function flatIcon(inst, parent) {
  parent.appendChild(inst)
  const frame = inst.detachInstance()
  const leaves = []
  const walk = (n) => {
    if (!n.visible) return
    if (n.type === 'GROUP' || n.type === 'FRAME') n.children.forEach(walk)
    else leaves.push(n)
  }
  frame.children.forEach(walk)
  const solid = (ps) => (Array.isArray(ps) ? ps.find((p) => p.visible !== false && p.type === 'SOLID' && (p.opacity ?? 1) > 0) : null)
  const light = (p) => p.color.r + p.color.g + p.color.b > 1.5
  // clone() and outlineStroke() put their node on the page. A clone keeps the original's transform;
  // an outline's is relative to the original's parent and covers the stroke's overhang.
  const [[, , fx], [, , fy]] = frame.absoluteTransform
  const mul = (a, b) => [
    [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1], a[0][0] * b[0][2] + a[0][1] * b[1][2] + a[0][2]],
    [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1], a[1][0] * b[0][2] + a[1][1] * b[1][2] + a[1][2]],
  ]
  const place = (shape, t) => {
    frame.appendChild(shape)
    shape.relativeTransform = [
      [t[0][0], t[0][1], t[0][2] - fx],
      [t[1][0], t[1][1], t[1][2] - fy],
    ]
  }
  let art = null
  const paint = (shape, p) => {
    if (light(p)) art = figma.union(art ? [art, shape] : [shape], frame)
    else if (art) art = figma.subtract([art, shape], frame)
    else shape.remove()
  }
  for (const n of leaves) {
    const t = n.absoluteTransform
    const fill = solid(n.fills)
    // strokeWeight is mixed when the sides differ, so ask outlineStroke(), which returns null for none.
    const stroke = solid(n.strokes)
    const outline = stroke ? n.outlineStroke() : null
    if (fill) {
      const s = n.clone()
      s.strokes = []
      place(s, t)
      paint(s, fill)
    }
    if (outline) {
      place(outline, mul(n.parent.absoluteTransform, outline.relativeTransform))
      paint(outline, stroke)
    }
    n.remove()
  }
  for (const c of [...frame.children]) if (c !== art) c.remove()
  const vector = figma.flatten([art], frame)
  vector.name = 'icon'
  vector.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
  frame.clipsContent = false
  return frame
}
