<template>
  <section>
    <div class="container" style="display:flex;gap:16px;align-items:flex-start">
      
      <!-- 分类侧栏（顾客端） -->
      <aside class="glass" style="width:220px;padding:12px;border-radius:12px;position:sticky;top:80px">
        <div style="font-weight:700;margin-bottom:8px">{{ merchant?.name || '全部分类' }}</div>
        <div>
          <a href="#" :class="{active: !category}" @click.prevent="select('')" style="display:block;padding:8px 10px;border-radius:8px">全部</a>
          <a v-for="c in catalog" :key="c.id" href="#" @click.prevent="select(c.slug)" :class="{active: category===c.slug}" style="display:block;padding:8px 10px;border-radius:8px">
            {{ c.name }}
          </a>
        </div>
        <div class="spacer"></div>
        <div v-if="merchant" style="font-size:12px;color:#64748b">
          <a href="#" @click.prevent="goOrders()">我的订单</a>
        </div>
      </aside>

      <!-- 商品列表 -->
      <div style="flex:1;min-width:0">
        <div class="glass" style="padding:16px;border-radius:12px">
          <div style="display:flex;gap:8px;justify-content:space-between;align-items:center;flex-wrap:wrap">
            <h2 style="margin:0">商城</h2>
            <div style="display:flex;gap:8px">
              <input v-model="search" placeholder="搜索产品" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px;min-width:260px" @keyup.enter="load(1)"/>
              <button class="primary" @click="load(1)">搜索</button>
            </div>
          </div>
          <div class="spacer"></div>
          <div v-if="loading" style="color:#64748b">加载中...</div>
          <div v-else class="row" style="flex-wrap:wrap">
            <div v-for="p in products" :key="p.id" class="glass" style="width:260px;padding:12px;border-radius:12px">
              <div style="height:140px;background:#f1f5f9;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#94a3b8">{{ (p.images && p.images.length)? '图片' : '无图' }}</div>
              <div style="height:8px"></div>
              <div style="font-weight:600">{{ p.name }}</div>
              <div style="color:#64748b;font-size:12px">基础价：¥{{ Number(p.base_price).toFixed(2) }}/{{ p.unit }}</div>
              <div style="height:8px"></div>
              <button class="primary" @click="goProduct(p.id)">去下单</button>
            </div>
            <div v-if="products.length===0" style="color:#94a3b8">暂无产品</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api, { getProducts, getMerchantPublic } from '../../services/api'

const catalog = ref<any[]>([])
const products = ref<any[]>([])
const category = ref('')
const search = ref('')
const loading = ref(false)
const route = useRoute()
const router = useRouter()
const merchant = ref<any | null>(null)

async function load(page = 1){
  loading.value = true
  try{
    const merchant = (route.params.merchant as string) || ''
    const res = await getProducts({ merchant: merchant || undefined, category: category.value || undefined, search: search.value || undefined, page, pageSize: 12 })
    products.value = res?.results || res || []
  } finally { loading.value = false }
}

function select(slug: string){
  category.value = slug
  load(1)
}

onMounted(async ()=>{
  const mslug = (route.params.merchant as string) || ''
  if (mslug){ merchant.value = await getMerchantPublic(mslug).catch(()=>null) }
  // 分类也按商户过滤
  catalog.value = await api.get('/catalog/categories/', { params: mslug? { merchant: mslug } : undefined } as any)
  load()
})

function goProduct(id: string){
  const merchant = (route.params.merchant as string) || ''
  if (merchant) router.push(`/s/${merchant}/p/${id}`)
  else router.push(`/shop/product/${id}`)
}

function goOrders(){
  const m = (route.params.merchant as string) || ''
  if (m) router.push(`/s/${m}/orders`)
  else router.push('/orders')
}

watch(()=>route.params.merchant, ()=>{
  category.value=''
  load(1)
})
</script>

<style scoped>
.active{ background: rgba(37,99,235,0.12); color:#1d4ed8 }
</style>
