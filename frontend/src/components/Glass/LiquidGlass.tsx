import React, { useEffect } from 'react'

declare global {
  interface Window { liquidGlass?: { destroy: () => void } }
}

const ns = 'http://www.w3.org/2000/svg'
const xlink = 'http://www.w3.org/1999/xlink'

function smoothStep(a: number, b: number, t: number) {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)))
  return x * x * (3 - 2 * x)
}

function len(x: number, y: number) {
  return Math.hypot(x, y)
}

function roundedRectSDF(x: number, y: number, w: number, h: number, r: number) {
  const qx = Math.abs(x) - w + r
  const qy = Math.abs(y) - h + r
  return Math.min(Math.max(qx, qy), 0) + len(Math.max(qx, 0), Math.max(qy, 0)) - r
}

function tex(x: number, y: number) {
  return { x, y }
}

function LiquidGlass() {
  useEffect(() => {
    if (window.liquidGlass) {
      window.liquidGlass.destroy()
    }

    const width = 320
    const height = 200
    const dpi = 1
    const id = 'lg-' + Math.random().toString(36).slice(2)
    const offset = 10

    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.top = '50%'
    container.style.left = '50%'
    container.style.transform = 'translate(-50%, -50%)'
    container.style.width = width + 'px'
    container.style.height = height + 'px'
    container.style.overflow = 'hidden'
    container.style.borderRadius = '24px'
    container.style.boxShadow = '0 10px 30px rgba(0,0,0,.25), 0 -10px 25px inset rgba(0,0,0,.15)'
    container.style.cursor = 'grab'
    container.style.backdropFilter = `url(#${id}_filter) blur(0.25px) contrast(1.2) brightness(1.05) saturate(1.1)`
    container.style.zIndex = '50'
    container.style.pointerEvents = 'auto'

    const svg = document.createElementNS(ns, 'svg')
    svg.setAttribute('width', '0')
    svg.setAttribute('height', '0')
    svg.style.position = 'fixed'
    svg.style.top = '0'
    svg.style.left = '0'
    svg.style.pointerEvents = 'none'
    svg.style.zIndex = '49'

    const defs = document.createElementNS(ns, 'defs')
    const filter = document.createElementNS(ns, 'filter')
    filter.setAttribute('id', `${id}_filter`)
    filter.setAttribute('filterUnits', 'userSpaceOnUse')
    filter.setAttribute('color-interpolation-filters', 'sRGB')
    filter.setAttribute('x', '0')
    filter.setAttribute('y', '0')
    filter.setAttribute('width', String(width))
    filter.setAttribute('height', String(height))

    const feImage = document.createElementNS(ns, 'feImage')
    feImage.setAttribute('id', `${id}_map`)
    feImage.setAttribute('width', String(width))
    feImage.setAttribute('height', String(height))

    const feDisp = document.createElementNS(ns, 'feDisplacementMap')
    feDisp.setAttribute('in', 'SourceGraphic')
    feDisp.setAttribute('in2', `${id}_map`)
    feDisp.setAttribute('xChannelSelector', 'R')
    feDisp.setAttribute('yChannelSelector', 'G')

    filter.appendChild(feImage)
    filter.appendChild(feDisp)
    defs.appendChild(filter)
    svg.appendChild(defs)

    const canvas = document.createElement('canvas')
    canvas.width = width * dpi
    canvas.height = height * dpi
    const ctx = canvas.getContext('2d')!

    const mouse = { x: 0, y: 0 }
    let mouseUsed = false

    function constrain(x: number, y: number) {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const minX = offset
      const maxX = vw - width - offset
      const minY = offset
      const maxY = vh - height - offset
      return { x: Math.max(minX, Math.min(maxX, x)), y: Math.max(minY, Math.min(maxY, y)) }
    }

    function update() {
      const proxy = new Proxy(mouse, {
        get(target, prop: any) {
          mouseUsed = true
          return (target as any)[prop]
        },
      })

      mouseUsed = false
      const w = canvas.width
      const h = canvas.height
      const data = new Uint8ClampedArray(w * h * 4)
      const raw: number[] = []
      let maxScale = 0

      for (let i = 0; i < data.length; i += 4) {
        const x = (i / 4) % w
        const y = Math.floor(i / 4 / w)
        const uvx = x / w
        const uvy = y / h
        const ix = uvx - 0.5
        const iy = uvy - 0.5
        const d = roundedRectSDF(ix, iy, 0.3, 0.2, 0.6)
        const disp = smoothStep(0.8, 0, d - 0.15)
        const scaled = smoothStep(0, 1, disp)
        const pos = tex(ix * scaled + 0.5, iy * scaled + 0.5)
        const dx = pos.x * w - x
        const dy = pos.y * h - y
        maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy))
        raw.push(dx, dy)
      }

      maxScale *= 0.5
      let k = 0
      for (let i = 0; i < data.length; i += 4) {
        const r = raw[k++] / maxScale + 0.5
        const g = raw[k++] / maxScale + 0.5
        data[i] = r * 255
        data[i + 1] = g * 255
        data[i + 2] = 0
        data[i + 3] = 255
      }
      ctx.putImageData(new ImageData(data, w, h), 0, 0)
      feImage.setAttributeNS(xlink, 'href', canvas.toDataURL())
      feDisp.setAttribute('scale', String(maxScale / dpi))
    }

    let isDragging = false
    let startX = 0
    let startY = 0
    let initX = 0
    let initY = 0

    container.addEventListener('mousedown', (e) => {
      isDragging = true
      container.style.cursor = 'grabbing'
      startX = e.clientX
      startY = e.clientY
      const rect = container.getBoundingClientRect()
      initX = rect.left
      initY = rect.top
      e.preventDefault()
    })

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const nx = initX + (e.clientX - startX)
        const ny = initY + (e.clientY - startY)
        const c = constrain(nx, ny)
        container.style.left = c.x + 'px'
        container.style.top = c.y + 'px'
        container.style.transform = 'none'
      }
      const rect = container.getBoundingClientRect()
      mouse.x = (e.clientX - rect.left) / rect.width
      mouse.y = (e.clientY - rect.top) / rect.height
      if (mouseUsed) update()
    })

    document.addEventListener('mouseup', () => {
      isDragging = false
      container.style.cursor = 'grab'
    })

    window.addEventListener('resize', () => {
      const rect = container.getBoundingClientRect()
      const c = constrain(rect.left, rect.top)
      if (rect.left !== c.x || rect.top !== c.y) {
        container.style.left = c.x + 'px'
        container.style.top = c.y + 'px'
        container.style.transform = 'none'
      }
    })

    update()
    document.body.appendChild(svg)
    document.body.appendChild(container)

    window.liquidGlass = {
      destroy() {
        svg.remove()
        container.remove()
        canvas.remove()
      },
    }

    return () => {
      if (window.liquidGlass) window.liquidGlass.destroy()
    }
  }, [])

  return null
}

export default LiquidGlass

