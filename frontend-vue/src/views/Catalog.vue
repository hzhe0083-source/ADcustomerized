<template>
  <section>
    <div class="glass" style="padding:16px;border-radius:12px;margin-top:8px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div>
          <h2 style="margin:0 0 4px 0">品类管理</h2>
          <p style="margin:0;color:#64748b">在此维护商城左侧导航品类以及品类下的属性与选项</p>
        </div>
        <div style="display:flex;gap:8px">
          <input v-model="catForm.name" placeholder="新建品类名称" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px"/>
          <input v-model="catForm.slug" placeholder="标识（英文/拼音）" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px"/>
          <button class="primary" @click="createCategory">添加品类</button>
        </div>
      </div>

      <div class="spacer"></div>

      <div class="row" style="align-items:flex-start">
        <!-- 左侧：分类列表 -->
        <div class="glass" style="flex:1;min-width:280px;padding:12px;border-radius:12px">
          <div style="font-weight:600;margin-bottom:8px">分类</div>
          <div v-for="c in categories" :key="c.id" @click="selectCategory(c)" :style="{padding:'8px 10px',border:'1px solid #e2e8f0',borderRadius:'8px',marginBottom:'8px',cursor:'pointer',background:selected?.id===c.id?'#eef2ff':'transparent'}">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
              <div>{{ c.name }} <span style="color:#94a3b8">/{{ c.slug }}</span></div>
              <button class="ghost" @click.stop="removeCategory(c.id)">删除</button>
            </div>
          </div>
          <div v-if="!categories.length" style="color:#94a3b8">暂无分类</div>
        </div>

        <!-- 右侧：属性管理 -->
        <div class="glass" style="flex:2;min-width:320px;padding:12px;border-radius:12px">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
            <div style="font-weight:600">属性（{{ selected?.name || '未选择分类' }}）</div>
            <div v-if="selected" style="display:flex;gap:8px">
              <input v-model="attrForm.name" placeholder="属性名：如 材质/尺寸" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px"/>
              <select v-model="attrForm.input_type" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px">
                <option value="select">选择</option>
                <option value="number">数字</option>
                <option value="text">文本</option>
                <option value="size">尺寸</option>
              </select>
              <button class="primary" @click="createAttribute">添加属性</button>
            </div>
          </div>

          <div class="spacer"></div>
          <div v-if="selected">
            <div v-for="a in attributes" :key="a.id" class="glass" style="padding:10px;border-radius:10px;margin-bottom:10px">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
                <div><strong>{{ a.name }}</strong> <span style="color:#94a3b8">({{ a.input_type }})</span></div>
                <button class="ghost" @click="removeAttribute(a.id)">删除</button>
              </div>
              <!-- 选项管理（仅 select 类型） -->
              <div v-if="a.input_type==='select'" style="margin-top:8px">
                <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap" v-if="initOpt(a.id)">
                  <input v-model="optForm[a.id].name" placeholder="选项名，如 2mm/3.2米宽膜" style="height:32px;border:1px solid #cbd5e1;border-radius:8px;padding:0 8px"/>
                  <input v-model.number="optForm[a.id].price_adjustment" type="number" step="0.01" placeholder="加价" style="height:32px;border:1px solid #cbd5e1;border-radius:8px;padding:0 8px;width:120px"/>
                  <button class="ghost" @click="createOption(a.id)">添加选项</button>
                </div>
                <div style="height:8px"></div>
                <div style="display:flex;gap:8px;flex-wrap:wrap">
                  <span v-for="o in a.options||[]" :key="o.id" style="border:1px solid #e2e8f0;border-radius:8px;padding:6px 10px;display:inline-flex;gap:6px;align-items:center">
                    {{ o.name }}<span v-if="o.price_adjustment">(+¥{{ Number(o.price_adjustment).toFixed(2) }})</span>
                    <a href="#" @click.prevent="removeOption(o.id)" style="color:#ef4444">删除</a>
                  </span>
                </div>
              </div>
            </div>
            <div v-if="!attributes.length" style="color:#94a3b8">该分类暂无属性</div>
          </div>
          <div v-else style="color:#94a3b8">请选择左侧分类后再进行属性管理</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import api from '../services/api'

const categories = ref<any[]>([])
const selected = ref<any | null>(null)
const attributes = ref<any[]>([])

const catForm = reactive({ name: '', slug: '' })
const attrForm = reactive({ name: '', input_type: 'select' })
const optForm = reactive<Record<string, any>>({})

async function loadCategories(){
  const res = await api.get('/catalog/categories/')
  categories.value = (res && res.results) ? res.results : (Array.isArray(res) ? res : [])
}

async function createCategory(){
  if (!catForm.name || !catForm.slug) return
  try{
    await api.post('/catalog/categories/', { name: catForm.name, slug: catForm.slug, sort_order: 0, is_active: true })
    catForm.name = ''; catForm.slug='';
    await loadCategories()
  }catch(e:any){
    alert((e?.response?.data?.detail) || '添加失败，请确认已绑定商户并开通订阅（可在“会员订阅”一键创建商户并试用）')
  }
}

async function removeCategory(id: string){
  await api.delete(`/catalog/categories/${id}/`)
  if (selected.value?.id===id) { selected.value=null; attributes.value=[] }
  await loadCategories()
}

function selectCategory(c: any){
  selected.value = c
  loadAttributes()
}

async function loadAttributes(){
  if (!selected.value) return
  const res = await api.get('/catalog/attributes/', { params: { category: selected.value.id } } as any).catch(async () => {
    const all = await api.get('/catalog/attributes/')
    return (all && all.results) ? all.results : all
  })
  attributes.value = (res && res.results) ? res.results : (Array.isArray(res) ? res.filter((x:any)=>x && (x.category===selected.value.id || x.category_id===selected.value.id)) : [])
}

async function createAttribute(){
  if (!selected.value || !attrForm.name) return
  await api.post('/catalog/attributes/', { category: selected.value.id, name: attrForm.name, key: attrForm.name, input_type: attrForm.input_type, required: false, sort_order: 0 })
  attrForm.name=''
  await loadAttributes()
}

async function removeAttribute(id: string){
  await api.delete(`/catalog/attributes/${id}/`)
  await loadAttributes()
}

function initOpt(attrId: string){
  if (!optForm[attrId]) optForm[attrId] = { name: '', price_adjustment: 0 }
  return true
}

async function createOption(attrId: string){
  const f = optForm[attrId]
  if (!f.name) return
  await api.post('/catalog/options/', { attribute: attrId, name: f.name, price_adjustment: Number(f.price_adjustment||0), sort_order: 0 })
  optForm[attrId] = { name: '', price_adjustment: 0 }
  await loadAttributes()
}

async function removeOption(id: string){
  await api.delete(`/catalog/options/${id}/`)
  await loadAttributes()
}

onMounted(loadCategories)
</script>

<style scoped></style>
