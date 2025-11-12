<template>
  <section>
    <div class="glass" style="padding:16px;border-radius:12px;margin-top:8px">
      <h2 style="margin:0 0 8px 0">我的订单</h2>
      <div v-if="loading" style="color:#64748b">加载中...</div>
      <div v-else>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="text-align:left;color:#475569">
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">订单号</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">客户</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">金额</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">状态</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">下单时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id">
              <td style="padding:10px 6px">{{ o.orderNumber || o.id }}</td>
              <td style="padding:10px 6px">{{ o.customerName || '-' }}</td>
              <td style="padding:10px 6px">¥{{ Number(o.totalAmount || 0).toFixed(2) }}</td>
              <td style="padding:10px 6px">{{ o.status }}</td>
              <td style="padding:10px 6px">{{ new Date(o.createdAt || o.created_at).toLocaleString() }}</td>
            </tr>
            <tr v-if="orders.length === 0">
              <td colspan="5" style="padding:12px;color:#94a3b8">暂无订单</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getOrders } from '../services/api'

const loading = ref(false)
const orders = ref<any[]>([])

onMounted(async () => {
  loading.value = true
  try{
    const res = await getOrders({ page: 1, pageSize: 10 })
    if (res?.results) orders.value = res.results
    else if (Array.isArray(res)) orders.value = res
  } finally {
    loading.value = false
  }
})
</script>

<style scoped></style>

