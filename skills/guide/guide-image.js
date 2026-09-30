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
