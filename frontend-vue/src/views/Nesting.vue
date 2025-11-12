<template>
  <section>
    <div class="glass" style="padding:16px;border-radius:12px;margin-top:8px">
      <div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap">
        <div class="glass" style="padding:12px;border-radius:12px;min-width:280px">
          <div style="font-weight:600;margin-bottom:8px">参数</div>
          <div style="display:grid;grid-template-columns:90px 1fr;gap:8px;align-items:center">
            <div>板材宽</div>
            <input v-model.number="sheet.width" type="number" step="1" style="height:34px;border:1px solid #cbd5e1;border-radius:8px;padding:0 8px">
            <div>板材高</div>
            <input v-model.number="sheet.height" type="number" step="1" style="height:34px;border:1px solid #cbd5e1;border-radius:8px;padding:0 8px">
            <div>间隙</div>
            <input v-model.number="gap" type="number" step="1" style="height:34px;border:1px solid #cbd5e1;border-radius:8px;padding:0 8px">
            <div>留边</div>
            <input v-model.number="margin" type="number" step="1" style="height:34px;border:1px solid #cbd5e1;border-radius:8px;padding:0 8px">
          </div>
          <div class="spacer"></div>
          <div style="font-weight:600;margin-bottom:6px">导入矩形件</div>
          <div style="display:flex;gap:6px">
            <input v-model.number="item.w" type="number" placeholder="宽" style="height:34px;border:1px solid #cbd5e1;border-radius:8px;padding:0 8px;width:90px">
            <input v-model.number="item.h" type="number" placeholder="高" style="height:34px;border:1px solid #cbd5e1;border-radius:8px;padding:0 8px;width:90px">
            <input v-model.number="item.qty" type="number" placeholder="数量" style="height:34px;border:1px solid #cbd5e1;border-radius:8px;padding:0 8px;width:90px">
            <button class="ghost" @click="addRect">添加</button>
          </div>
          <div style="margin-top:6px;color:#64748b;font-size:12px">或上传图片矢量化后取外形尺寸</div>
          <div style="display:flex;gap:6px;margin-top:6px">
            <input type="file" multiple @change="pickFiles">
            <button class="ghost" @click="doVectorize" :disabled="!files.length">矢量化取尺寸</button>
          </div>
          <div class="spacer"></div>
          <div style="display:flex;gap:8px">
            <button class="primary" @click="pack">拼版</button>
            <button class="ghost" @click="exportSVG" :disabled="!placements.length">导出SVG</button>
          </div>
          <div style="margin-top:8px;color:#64748b;font-size:12px">利用率：{{ utilization }}，件数：{{ placements.length }}</div>
        </div>

        <div class="glass" style="flex:1;min-width:420px;padding:12px;border-radius:12px">
          <div style="font-weight:600;margin-bottom:6px">预览</div>
          <div ref="previewBox" style="position:relative;border:1px dashed #cbd5e1;border-radius:12px;height:520px;overflow:auto;background:#f8fafc">
            <svg v-if="sheets.length" :viewBox="'0 0 '+sheet.width+' '+sheet.height" :width="svgW" :height="svgH" @mousemove="onMove" @mouseup="onUp" @mouseleave="onUp">
              <rect x="0" y="0" :width="sheet.width" :height="sheet.height" fill="#fff" stroke="#e2e8f0"/>
              <g v-for="(p,i) in placements" :key="i" :transform="'translate('+p.x+','+p.y+')'">
                <template v-if="itemMap[p.id]?.thumb">
                  <image :href="itemMap[p.id].thumb" x="0" y="0" :width="p.w" :height="p.h" preserveAspectRatio="xMidYMid slice" @mousedown="onDown(i,$event)"/>
                  <rect :x="0" :y="0" :width="p.w" :height="p.h" fill="none" stroke="#60a5fa"/>
                </template>
                <template v-else>
                  <rect :x="0" :y="0" :width="p.w" :height="p.h" :fill="picked===i?'#fde68a':'#dbeafe'" stroke="#60a5fa" @mousedown="onDown(i,$event)"/>
                </template>
                <text :x="4" :y="12" font-size="12" fill="#334155">{{ p.id }}</text>
              </g>
            </svg>
            <div v-else style="color:#94a3b8;padding:12px">暂无数据，请添加矩形件或上传图片后点击“拼版”</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { packNesting, vectorizeFiles } from '../services/api'

const sheet = reactive({ width: 3200, height: 5000 })
const gap = ref(10)
const margin = ref(15)
const item = reactive({ w: 1000, h: 800, qty: 1 })

const files = ref<File[]>([])
const thumbs = ref<Record<string,string>>({})
const itemMap = computed(()=>{
  const m: Record<string, any> = {}
  items.value.forEach(it=>{ if (it && it.id) m[it.id] = it })
  return m
})
const items = ref<any[]>([])
const sheets = ref<any[]>([])
const placements = ref<any[]>([])
const utilization = ref(0)

const previewBox = ref<HTMLElement | null>(null)
const scale = ref(1)
const svgW = computed(()=> (sheet.width*scale.value))
const svgH = computed(()=> (sheet.height*scale.value))

function pickFiles(e: Event){
  const input = e.target as HTMLInputElement
  if (input.files){
    files.value = Array.from(input.files)
    files.value.forEach(f=>{
      const reader = new FileReader()
      reader.onload = () => { thumbs.value[f.name] = String(reader.result || '') }
      reader.readAsDataURL(f)
    })
  }
}

function addRect(){
  if (!item.w || !item.h || !item.qty) return
  items.value.push({ id: 'R'+(items.value.length+1), w: Number(item.w), h: Number(item.h), qty: Number(item.qty), rotate: true })
}

async function doVectorize(){
  if (!files.value.length) return
  const fd = new FormData()
  files.value.forEach(f=> fd.append('files', f))
  try{
  const res = await vectorizeFiles(fd)
  const arr = res?.results || []
  arr.forEach((r: any, idx: number) => {
    if (r.error) return
    const w = Number(r.width)
    const h = Number(r.height)
    const id = r.name || ('I'+idx)
    const thumb = r.dataUrl || (thumbs.value[r.name || ''] || '')
    items.value.push({ id, w, h, qty: 1, rotate: true, thumb })
  })
  }catch(e:any){
    alert(e?.response?.data?.detail || '矢量化失败')
  }
}

async function pack(){
  const payload = { sheet: { width: sheet.width, height: sheet.height }, gap: gap.value, margin: margin.value, items: items.value }
  try{
    const res = await packNesting(payload)
    sheets.value = res.sheets || []
    placements.value = (res.placements || []).map((p:any)=>({ ...p }))
    utilization.value = res.utilization || 0
    fitScale()
  }catch(e:any){
    alert(e?.response?.data?.detail || '拼版失败')
  }
}

function fitScale(){
  const box = previewBox.value
  if (!box) return
  const bw = box.clientWidth - 24
  const bh = box.clientHeight - 24
  const sx = bw / sheet.width
  const sy = bh / sheet.height
  scale.value = Math.max(0.1, Math.min(sx, sy))
}

const picked = ref<number | null>(null)
let last = {x:0,y:0}
function onDown(i:number, e:MouseEvent){ picked.value = i; last = { x: e.offsetX/scale.value, y: e.offsetY/scale.value } }
function onMove(e:MouseEvent){ if (picked.value===null) return; const i = picked.value; const cur = { x: e.offsetX/scale.value, y: e.offsetY/scale.value }; const dx = cur.x - last.x; const dy = cur.y - last.y; placements.value[i].x = Math.max(0, Math.min(sheet.width - placements.value[i].w, placements.value[i].x + dx)); placements.value[i].y = Math.max(0, Math.min(sheet.height - placements.value[i].h, placements.value[i].y + dy)); last = cur }
function onUp(){ picked.value=null }

function exportSVG(){
  const header = `<svg xmlns="http://www.w3.org/2000/svg" width="${sheet.width}" height="${sheet.height}">`
  const bg = `<rect x="0" y="0" width="${sheet.width}" height="${sheet.height}" fill="#fff" stroke="#e2e8f0"/>`
  const body = placements.value.map((p:any, idx:number)=>`<g transform="translate(${p.x},${p.y})"><rect x="0" y="0" width="${p.w}" height="${p.h}" fill="#dbeafe" stroke="#60a5fa"/><text x="4" y="12" font-size="12" fill="#334155">${p.id||('P'+idx)}</text></g>`).join('')
  const svg = header + bg + body + `</svg>`
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'nesting.svg'
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(()=> setTimeout(fitScale, 0))
</script>

<style scoped></style>
