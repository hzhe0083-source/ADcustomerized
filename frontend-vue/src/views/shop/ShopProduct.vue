<template>
  <section>
    <div class="container">
      <div class="glass" style="padding:16px;border-radius:12px;margin-top:8px">
        <div v-if="!product" style="color:#64748b">加载中...</div>
        <div v-else style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div>
            <div style="height:260px;background:#f1f5f9;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#94a3b8">{{ (product.images && product.images.length)? '图片预览' : '无图' }}</div>
            <div class="spacer"></div>
            <h2 style="margin:0 0 8px 0">{{ product.name }}</h2>
            <div style="color:#64748b">基础价：¥{{ Number(product.base_price).toFixed(2) }}/{{ product.unit }}</div>
            <div style="height:12px"></div>
            <div>
              <div style="font-weight:600;margin-bottom:6px">上传打印文件</div>
              <input type="file" multiple @change="onPick" />
              <div v-if="files.length" style="font-size:12px;color:#64748b;margin-top:4px">已选择 {{ files.length }} 个文件</div>
            </div>
          </div>
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
              <button class="ghost" @click="quote">计算价格</button>
            </div>

            <div class="spacer"></div>
            <div v-for="cfg in (product.configs||[])" :key="cfg.id">
              <div style="font-weight:600;margin-bottom:6px">{{ cfg.config_name }}</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                <label v-for="opt in cfg.options" :key="opt.id" style="border:1px solid #cbd5e1;border-radius:8px;padding:6px 10px;cursor:pointer">
                  <input type="radio" :name="'cfg-'+cfg.id" :value="opt.id" v-model="selected[cfg.id]" style="margin-right:6px"/>
                  {{ opt.name }} <span v-if="Number(opt.price_adjustment)">(+¥{{ Number(opt.price_adjustment).toFixed(2) }})</span>
                </label>
              </div>
              <div style="height:8px"></div>
            </div>

            <div class="glass" v-if="result" style="padding:12px;border-radius:10px">
              <div>面积：{{ result.area }} m²</div>
              <div>单件价：¥{{ result.unitPrice.toFixed(2) }}</div>
              <div>数量：{{ result.quantity }}</div>
              <div style="font-weight:600">小计：¥{{ result.subtotal.toFixed(2) }}</div>
            </div>

            <div class="spacer"></div>
            <div style="font-weight:600;margin-bottom:6px">收货信息</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <input v-model="ship.customerName" placeholder="姓名" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px"/>
              <input v-model="ship.phone" placeholder="电话" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px"/>
              <input v-model="ship.email" placeholder="邮箱" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px"/>
              <input v-model="ship.address" placeholder="地址" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px;min-width:260px"/>
            </div>
            <div style="height:8px"></div>
            <div style="display:flex;gap:8px">
              <button class="primary" @click="submit" :disabled="!result">立即下单</button>
              <button class="ghost" @click="addToCart">加入购物车</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductById, quotePrice, uploadFile, createOrder, getMerchantPublic, addCartItem } from '../../services/api'

const route = useRoute()
const router = useRouter()
const product = ref<any | null>(null)
const files = ref<File[]>([])
const uploadedUrls = ref<string[]>([])
const form = reactive({ width: 100, height: 100, unit: 'cm', quantity: 1 })
const selected = reactive<Record<string, number | undefined>>({})
const result = ref<any | null>(null)
const ship = reactive({ customerName: '', phone: '', email: '', address: '', deliveryMethod: '快递', deliveryDate: '' })
const merchantInfo = ref<any | null>(null)

onMounted(async () => {
  const id = route.params.id as string
  const mslug = (route.params.merchant as string) || ''
  if (mslug) merchantInfo.value = await getMerchantPublic(mslug).catch(()=>null)
  product.value = await getProductById(id)
})

function onPick(e: Event){
  const input = e.target as HTMLInputElement
  if (input.files) files.value = Array.from(input.files)
}

async function ensureUpload(){
  const urls: string[] = []
  for (const f of files.value){
    const res = await uploadFile(f, 'orders')
    urls.push(res.url)
  }
  uploadedUrls.value = urls
  return urls
}

async function quote(){
  const options = Object.entries(selected).filter(([,v])=>!!v).map(([cfgId,optId])=>({ configId: Number(cfgId), optionId: Number(optId) }))
  const merchant = (route.params.merchant as string) || ''
  result.value = await quotePrice({ productId: product.value.id, width: form.width, height: form.height, unit: form.unit, quantity: form.quantity, options, merchant: merchant || undefined })
}

async function submit(){
  if (!result.value) await quote()
  const files = await ensureUpload()
  const item = {
    productId: product.value.id,
    quantity: form.quantity,
    price: result.value?.unitPrice || 0,
    configs: { width: form.width, height: form.height, unit: form.unit, options: selected, files, quote: result.value }
  }
  const merchant = (route.params.merchant as string) || ''
  const payload = { merchant: merchant || undefined, ...ship, notes: '', items: [item], totalAmount: result.value?.subtotal || 0 }
  const res = await createOrder(payload)
  alert('下单成功，订单号：' + (res.orderNumber || res.id))
  if (merchant) router.replace(`/s/${merchant}/success/${res.id}`)
  else router.replace(`/shop/success/${res.id}`)
}

async function addToCart(){
  const merchant = (route.params.merchant as string) || ''
  await addCartItem({ merchant: merchant || undefined, productId: product.value.id, quantity: form.quantity, configs: { width: form.width, height: form.height, unit: form.unit, options: selected } })
  if (merchant) router.push(`/s/${merchant}/cart`)
  else router.push('/shop/cart')
}
</script>

<style scoped></style>
