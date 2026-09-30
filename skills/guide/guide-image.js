// Turns a built mockup into a guide image: a variant of the plugin's image set, with numbered pins.
// Run it in the same use_figma call as buildMockup, on the plugin's page. A pin is a label's text,
// { text, nth }, or { find: (win) => node }, where node may be any object with an absoluteBoundingBox.
// dx and dy move the pin's tip.
async function guideImage({ set: setName, image, win, pins, pad = 24 }) {
  const pageNode = figma.currentPage
  const variantName = 'Property 1=' + image
  let set = pageNode.children.find((n) => n.type === 'COMPONENT_SET' && n.name === setName)
  if (set) for (const c of set.children.filter((c) => c.name === variantName)) c.remove()
  const comp = figma.createComponent()
  comp.name = variantName
  comp.fills = []
  comp.clipsContent = false
  pageNode.appendChild(comp)
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
  if (set) set.appendChild(comp)
  else {
    set = figma.combineAsVariants([comp], pageNode)
    set.name = setName
    set.x = 0
    set.y = 0
  }
  let x = 40
  let h = 0
  for (const c of set.children) {
    c.x = x
    c.y = 40
    x += c.width + 40
    h = Math.max(h, c.height)
  }
  set.resize(x, h + 80)
  return { set: set.id, image: comp.id, pins: placed }
}
