<template>
  <section>
    <div class="container">
      <div class="glass" style="padding:16px;border-radius:12px;margin-top:8px">
        <h2 style="margin:0 0 8px 0">购物车</h2>
        <div v-if="loading" style="color:#64748b">加载中...</div>
        <div v-else>
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="text-align:left;color:#475569">
                <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">商品</th>
                <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">数量</th>
                <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">配置</th>
                <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="it in items" :key="it.id">
                <td style="padding:10px 6px">{{ it.productName }}</td>
                <td style="padding:10px 6px"><input v-model.number="it.quantity" type="number" min="1" style="width:90px;height:30px;border:1px solid #cbd5e1;border-radius:6px;padding:0 8px"/></td>
                <td style="padding:10px 6px;color:#64748b">{{ formatCfg(it.config_data) }}</td>
                <td style="padding:10px 6px">
                  <a href="#" @click.prevent="update(it)">更新</a>
                  <span style="margin:0 8px">|</span>
                  <a href="#" style="color:#ef4444" @click.prevent="remove(it.id)">删除</a>
                </td>
              </tr>
              <tr v-if="items.length===0"><td colspan="4" style="padding:12px;color:#94a3b8">购物车为空</td></tr>
            </tbody>
          </table>

          <div class="spacer"></div>

          <div class="glass" style="padding:12px;border-radius:10px">
            <div style="font-weight:600;margin-bottom:6px">收货信息</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <input v-model="ship.customerName" placeholder="姓名" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px"/>
              <input v-model="ship.phone" placeholder="电话" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px"/>
              <input v-model="ship.email" placeholder="邮箱" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px"/>
              <input v-model="ship.address" placeholder="地址" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px;min-width:260px"/>
            </div>
            <div style="height:8px"></div>
            <div style="display:flex;gap:8px">
              <button class="primary" @click="checkout" :disabled="items.length===0">提交订单</button>
              <button class="ghost" @click="clear">清空</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCart, updateCartItem, deleteCartItem, clearCart, createOrder } from '../../services/api'

const loading = ref(false)
const items = ref<any[]>([])
const route = useRoute()
const router = useRouter()
const ship = ref({ customerName:'', phone:'', email:'', address:'', deliveryMethod:'快递', deliveryDate:'' })

function formatCfg(cfg:any){
  if (!cfg) return '-'
  const { width, height, unit } = cfg
  return [width&&height?`${width}×${height}${unit||''}`:'', cfg?.options?Object.values(cfg.options).length+'选项':'' ].filter(Boolean).join(' / ')
}

async function load(){
  loading.value = true
  try{
    const res = await getCart()
    items.value = res?.items || []
  } finally { loading.value = false }
}

async function update(it:any){ await updateCartItem(it.id, { quantity: it.quantity, configs: it.config_data }); await load() }
async function remove(id:string){ await deleteCartItem(id); await load() }
async function clear(){ await clearCart(); await load() }

async function checkout(){
  const merchant = (route.params.merchant as string) || ''
  const orderItems = items.value.map(it=> ({ productId: it.productId || it.product?.id || it.product_id, quantity: it.quantity, price: 0, configs: it.config_data }))
  const payload = { merchant: merchant || undefined, ...ship.value, notes:'', items: orderItems, totalAmount: 0 }
  const res = await createOrder(payload)
  await clear()
  if (merchant) router.replace(`/s/${merchant}/success/${res.id}`)
  else router.replace(`/shop/success/${res.id}`)
}

onMounted(load)
</script>

<style scoped></style>

