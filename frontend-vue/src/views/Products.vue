<template>
  <section>
    <div class="glass" style="padding:16px;border-radius:12px;margin-top:8px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div>
          <h2 style="margin:0 0 4px 0">商城下单</h2>
          <p style="margin:0;color:#64748b">上传文件，选择材质/尺寸，实时计算价格并下单</p>
        </div>
        <div style="display:flex;gap:8px">
          <select v-model="filters.category" style="height:36px;border-radius:10px;border:1px solid #cbd5e1;padding:0 10px">
            <option value="">全部分类</option>
            <option v-for="c in catalog" :key="c.id" :value="c.slug">{{ c.name }}</option>
          </select>
          <input v-model="filters.search" placeholder="搜索产品" style="height:36px;border-radius:10px;border:1px solid #cbd5e1;padding:0 10px;min-width:220px" @keyup.enter="load(1)"/>
          <button class="primary" @click="load(1)">查询</button>
        </div>
      </div>

      <div class="spacer"></div>

      <div v-if="loading" style="color:#64748b">加载中...</div>
      <div v-else>
        <div class="row" style="flex-wrap:wrap">
          <div v-for="p in products" :key="p.id" class="glass" style="width:260px;padding:12px;border-radius:12px">
            <div style="height:140px;background:#f1f5f9;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#94a3b8">
              <span>{{ (p.images && p.images.length)? '图片' : '无图' }}</span>
            </div>
            <div style="height:8px"></div>
            <div style="font-weight:600">{{ p.name }}</div>
            <div style="color:#64748b;font-size:12px">基础价：¥{{ Number(p.base_price).toFixed(2) }}/{{ p.unit }}</div>
            <div style="height:8px"></div>
            <button class="primary" @click="openOrder(p)">立即下单</button>
          </div>
          <div v-if="products.length===0" style="color:#94a3b8">暂无产品</div>
        </div>
      </div>
    </div>

    <!-- 下单抽屉 -->
    <div v-if="orderVisible" style="position:fixed;inset:0;background:rgba(15,23,42,0.35)">
      <div class="glass" style="position:absolute;right:0;top:0;height:100%;width:520px;padding:16px 16px 24px 16px;border-left:1px solid #e2e8f0;overflow:auto">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
          <h3 style="margin:0">下单：{{ current?.name }}</h3>
          <button class="ghost" @click="orderVisible=false">关闭</button>
        </div>
        <div class="spacer"></div>

        <div style="display:flex;flex-direction:column;gap:10px">
          <!-- 上传文件 -->
          <div>
            <div style="font-weight:600;margin-bottom:6px">打印文件</div>
            <input type="file" @change="onPickFile"/>
            <div v-if="files.length" style="font-size:12px;color:#64748b;margin-top:4px">已选择 {{ files.length }} 个文件</div>
          </div>

          <!-- 尺寸与数量 -->
          <div>
            <div style="font-weight:600;margin-bottom:6px">尺寸与数量</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <input v-model.number="form.width" type="number" placeholder="长" style="width:120px;height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px"/>
              <input v-model.number="form.height" type="number" placeholder="宽" style="width:120px;height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px"/>
              <select v-model="form.unit" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px">
                <option value="cm">cm</option>
                <option value="mm">mm</option>
                <option value="m">m</option>
              </select>
              <input v-model.number="form.quantity" type="number" min="1" placeholder="数量" style="width:120px;height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px"/>
              <button class="ghost" @click="doQuote">计算价格</button>
            </div>
          </div>

          <!-- 动态配置 -->
          <div v-for="cfg in (current?.configs||[])" :key="cfg.id">
            <div style="font-weight:600;margin-bottom:6px">{{ cfg.config_name }}</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <label v-for="opt in cfg.options" :key="opt.id" style="border:1px solid #cbd5e1;border-radius:8px;padding:6px 10px;cursor:pointer">
                <input type="radio" :name="'cfg-'+cfg.id" :value="opt.id" v-model="selectedOptions[cfg.id]" style="margin-right:6px"/>
                {{ opt.name }} <span v-if="Number(opt.price_adjustment)">(+¥{{ Number(opt.price_adjustment).toFixed(2) }})</span>
              </label>
            </div>
          </div>

          <!-- 价格结果 -->
          <div class="glass" v-if="quote" style="padding:12px;border-radius:10px">
            <div>面积：{{ quote.area }} m²</div>
            <div>单件价：¥{{ quote.unitPrice.toFixed(2) }}</div>
            <div>数量：{{ quote.quantity }}</div>
            <div style="font-weight:600">小计：¥{{ quote.subtotal.toFixed(2) }}</div>
          </div>

          <!-- 收货信息并下单 -->
          <div>
            <div style="font-weight:600;margin-bottom:6px">收货信息</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <input v-model="ship.customerName" placeholder="姓名" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px"/>
              <input v-model="ship.phone" placeholder="电话" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px"/>
              <input v-model="ship.email" placeholder="邮箱" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px"/>
              <input v-model="ship.address" placeholder="地址" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px;min-width:260px"/>
              <input v-model="ship.deliveryMethod" placeholder="配送方式" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px"/>
              <input v-model="ship.deliveryDate" placeholder="配送日期" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px"/>
            </div>
            <div style="height:8px"></div>
            <button class="primary" @click="submitOrder" :disabled="!quote">提交下单</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { getProducts, quotePrice, uploadFile, createOrder } from '../services/api'

const loading = ref(false)
const products = ref<any[]>([])
const filters = reactive({ category: '', search: '' })
const pagination = reactive({ page: 1, pageSize: 12, total: 0 })
const catalog = ref<any[]>([])

async function load(page?: number){
  if (page) pagination.page = page
  loading.value = true
  try{
    const res = await getProducts({ category: filters.category || undefined, search: filters.search || undefined, page: pagination.page, pageSize: pagination.pageSize })
    if (res?.results){
      products.value = res.results
      pagination.total = res.count || res.results.length
    }else if(Array.isArray(res)){
      products.value = res
      pagination.total = res.length
    }
  } finally {
    loading.value = false
  }
}

onMounted(async ()=>{ catalog.value = await api.get('/catalog/categories/'); load(1) })

const orderVisible = ref(false)
const current = ref<any | null>(null)
const files = ref<File[]>([])
const uploadedUrls = ref<string[]>([])
const form = reactive({ width: 100, height: 100, unit: 'cm', quantity: 1 })
const selectedOptions = reactive<Record<string, number | undefined>>({})
const quote = ref<any | null>(null)

function openOrder(p: any){
  current.value = p
  files.value = []
  uploadedUrls.value = []
  quote.value = null
  Object.keys(selectedOptions).forEach(k=> delete selectedOptions[k])
  orderVisible.value = true
}

function onPickFile(e: Event){
  const input = e.target as HTMLInputElement
  if (input.files && input.files.length){
    files.value = Array.from(input.files)
  }
}

async function ensureUpload(){
  if (!files.value.length) return [] as string[]
  const urls: string[] = []
  for (const f of files.value){
    const res = await uploadFile(f, 'orders')
    urls.push(res.url)
  }
  uploadedUrls.value = urls
  return urls
}

async function doQuote(){
  const optPairs = Object.entries(selectedOptions)
    .filter(([,v])=>!!v)
    .map(([cfgId, optId])=>({ configId: cfgId as any, optionId: Number(optId) }))
  const res = await quotePrice({ productId: current.value.id, width: form.width, height: form.height, unit: form.unit, quantity: form.quantity, options: optPairs })
  quote.value = res
}

async function submitOrder(){
  const fileUrls = await ensureUpload()
  if (!quote.value) await doQuote()
  const item = {
    productId: current.value.id,
    quantity: form.quantity,
    price: quote.value?.unitPrice || 0,
    configs: {
      width: form.width,
      height: form.height,
      unit: form.unit,
      options: selectedOptions,
      files: fileUrls,
      quote: quote.value,
    }
  }
  const payload = { ...ship, notes: '', items: [item], totalAmount: quote.value?.subtotal || 0 }
  const res = await createOrder(payload)
  alert('下单成功，订单号：' + (res.orderNumber || res.id))
  orderVisible.value = false
}

const ship = reactive({ customerName: '', phone: '', email: '', address: '', deliveryMethod: '快递', deliveryDate: '' })
</script>

<style scoped></style>
