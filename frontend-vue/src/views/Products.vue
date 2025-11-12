<template>
  <section>
    <div class="glass" style="padding:16px;border-radius:12px;margin-top:8px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div>
          <h2 style="margin:0 0 4px 0">商品管理</h2>
          <p style="margin:0;color:#64748b">创建商品，配置“材质/尺寸/工艺”等选项</p>
        </div>
        <div style="display:flex;gap:8px">
          <input v-model="form.name" placeholder="商品名称" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px"/>
          <select v-model="form.category" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px">
            <option value="uv_roll">UV卷材</option>
            <option value="banner">喷绘布</option>
            <option value="car_sticker">车贴</option>
            <option value="lightbox">灯箱片</option>
            <option value="kt_board">KT板</option>
            <option value="pvc_board">PVC板</option>
          </select>
          <div style="display:inline-flex;align-items:center;border:1px solid #cbd5e1;border-radius:10px;height:36px;padding:0 10px">
            <span style="color:#64748b;margin-right:4px">¥</span>
            <input v-model="form.base_price" type="number" min="0" step="0.01" placeholder="基础价（必填）" style="border:none;outline:none;width:120px;height:100%;padding:0 4px"/>
            <span style="color:#64748b;margin-left:4px">/㎡</span>
          </div>
          <button class="primary" @click="createProduct">新增商品</button>
        </div>
      </div>

      <div class="spacer"></div>

      <div class="row" style="align-items:flex-start">
        <!-- 左侧：商品列表 -->
        <div class="glass" style="flex:1;min-width:280px;padding:12px;border-radius:12px">
          <div style="font-weight:600;margin-bottom:8px">商品列表</div>
          <div v-for="p in products" :key="p.id" @click="select(p)" :style="{padding:'8px 10px',border:'1px solid #e2e8f0',borderRadius:'8px',marginBottom:'8px',cursor:'pointer',background: current?.id===p.id?'#eef2ff':'transparent'}">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
              <div>{{ p.name }}</div>
              <a href="#" @click.prevent="removeProduct(p.id)" style="color:#ef4444">删除</a>
            </div>
            <div style="color:#64748b;font-size:12px">¥{{ Number(p.base_price).toFixed(2) }}/{{ p.unit }}</div>
          </div>
          <div v-if="products.length===0" style="color:#94a3b8">暂无商品</div>
        </div>

        <!-- 右侧：配置管理 -->
        <div class="glass" style="flex:2;min-width:320px;padding:12px;border-radius:12px">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
            <div style="font-weight:600">配置（{{ current?.name || '未选择商品' }}）</div>
            <div v-if="current" style="display:flex;gap:8px">
              <select v-model="cfgForm.config_type" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px">
                <option value="size">尺寸</option>
                <option value="material">材料</option>
                <option value="process">工艺</option>
                <option value="color">颜色</option>
                <option value="finish">后处理</option>
              </select>
              <input v-model="cfgForm.config_name" placeholder="配置名称，如 材质/工艺" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px"/>
              <button class="primary" @click="createConfig">添加配置</button>
            </div>
          </div>

          <div class="spacer"></div>
          <div v-if="current">
            <div v-for="c in configs" :key="c.id" class="glass" style="padding:10px;border-radius:10px;margin-bottom:10px">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
                <div><strong>{{ c.config_name }}</strong> <span style="color:#94a3b8">({{ c.config_type }})</span></div>
                <a href="#" @click.prevent="removeConfig(c.id)" style="color:#ef4444">删除配置</a>
              </div>
              <div style="margin-top:8px">
                <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap" v-if="initOpt(c.id)">
                  <input v-model="optForm[c.id].name" placeholder="选项名，如 2mm/3.2米宽膜" style="height:32px;border:1px solid #cbd5e1;border-radius:8px;padding:0 8px"/>
                  <input v-model.number="optForm[c.id].price_adjustment" type="number" step="0.01" placeholder="加价" style="height:32px;border:1px solid #cbd5e1;border-radius:8px;padding:0 8px;width:120px"/>
                  <button class="ghost" @click="createOption(c.id)">添加选项</button>
                </div>
                <div style="height:8px"></div>
                <div style="display:flex;gap:8px;flex-wrap:wrap">
                  <span v-for="o in c.options||[]" :key="o.id" style="border:1px solid #e2e8f0;border-radius:8px;padding:6px 10px;display:inline-flex;gap:6px;align-items:center">
                    {{ o.name }}<span v-if="o.price_adjustment">(+¥{{ Number(o.price_adjustment).toFixed(2) }})</span>
                    <a href="#" @click.prevent="removeOption(o.id)" style="color:#ef4444">删除</a>
                  </span>
                </div>
              </div>
            </div>
            <div v-if="!configs.length" style="color:#94a3b8">该商品暂无配置</div>
          </div>
          <div v-else style="color:#94a3b8">请选择左侧商品后再进行配置管理</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { listMerchantProducts, createMerchantProduct, deleteMerchantProduct, listProductConfigs, createProductConfig, deleteProductConfig, createConfigOption, deleteConfigOption } from '../services/api'

const products = ref<any[]>([])
const current = ref<any | null>(null)
const configs = ref<any[]>([])
const optForm = reactive<Record<string, any>>({})

const form = reactive({ name: '', category: 'uv_roll', base_price: '', unit: '平方米', is_active: true })
const cfgForm = reactive({ config_type: 'material', config_name: '' })

async function load(){
  const res = await listMerchantProducts()
  products.value = res?.results || res || []
}

async function select(p: any){
  current.value = p
  const res = await listProductConfigs({ product: p.id })
  configs.value = res?.results || res || []
}

async function createProduct(){
  if (!form.name) return
  await createMerchantProduct({ ...form, base_price: Number(form.base_price||0), images: [] })
  form.name=''; form.base_price=''
  await load()
}

async function removeProduct(id: string){
  await deleteMerchantProduct(id)
  if (current.value?.id===id){ current.value=null; configs.value=[] }
  await load()
}

async function createConfig(){
  if (!current.value || !cfgForm.config_name) return
  await createProductConfig({ ...cfgForm, product: current.value.id, is_required: true, display_order: 0 })
  cfgForm.config_name=''
  await select(current.value)
}

async function removeConfig(id: string){
  await deleteProductConfig(id)
  await select(current.value)
}

async function createOption(cfgId: string){
  const f = optForm[cfgId] || {}
  if (!f.name) return
  await createConfigOption({ config: cfgId, name: f.name, price_adjustment: Number(f.price_adjustment||0), is_default: false, display_order: 0 })
  optForm[cfgId] = { name: '', price_adjustment: 0 }
  await select(current.value)
}

async function removeOption(id: string){
  await deleteConfigOption(id)
  await select(current.value)
}

onMounted(load)

function initOpt(id: string){
  if (!optForm[id]) optForm[id] = { name: '', price_adjustment: 0 }
  return true
}
</script>

<style scoped></style>
