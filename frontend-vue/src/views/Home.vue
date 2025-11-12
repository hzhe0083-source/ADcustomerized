<template>
  <section>
    <div class="glass" style="padding:24px;border-radius:16px;margin-top:8px">
      <h1 style="margin:0 0 8px 0">概览</h1>
      <p style="margin:0;color:#475569">关键指标与近14日走势；预测采用 7 日均值基线。</p>
    </div>
    <div class="spacer"></div>

    <!-- KPIs -->
    <div class="row" style="flex-wrap:wrap">
      <div class="glass" style="flex:1;min-width:220px;padding:16px;border-radius:12px">
        <div style="color:#64748b">总营收</div>
        <div style="font-size:26px;font-weight:700">¥{{ kpi.revenue_total.toFixed(2) }}</div>
      </div>
      <div class="glass" style="flex:1;min-width:220px;padding:16px;border-radius:12px">
        <div style="color:#64748b">30日营收</div>
        <div style="font-size:26px;font-weight:700">¥{{ kpi.revenue_30.toFixed(2) }}</div>
      </div>
      <div class="glass" style="flex:1;min-width:220px;padding:16px;border-radius:12px">
        <div style="color:#64748b">7日订单</div>
        <div style="font-size:26px;font-weight:700">{{ kpi.orders_7 }}</div>
      </div>
      <div class="glass" style="flex:1;min-width:220px;padding:16px;border-radius:12px">
        <div style="color:#64748b">低库存物料</div>
        <div style="font-size:26px;font-weight:700">{{ kpi.low_stock_count }}</div>
      </div>
    </div>

    <div class="spacer"></div>

    <!-- Daily series (mini bar) -->
    <div class="glass" style="padding:16px;border-radius:12px">
      <h3 style="margin:0 0 8px 0">近14日订单/营收</h3>
      <div v-if="daily.length===0" style="color:#94a3b8">暂无数据</div>
      <div v-else style="display:flex;gap:8px;align-items:flex-end;height:120px">
        <div v-for="d in daily" :key="d.date" style="flex:1;display:flex;flex-direction:column;align-items:center">
          <div :title="'¥'+d.revenue.toFixed(2)" :style="{background:'#93c5fd',height: Math.max(4, d.revenue/maxRevenue*100)+'px', width:'18px', borderRadius:'6px'}"></div>
          <div style="height:4px"></div>
          <div :title="d.orders+'单'" :style="{background:'#60a5fa',height: Math.max(4, d.orders/maxOrders*100)+'px', width:'18px', borderRadius:'6px'}"></div>
          <div style="margin-top:6px;font-size:10px;color:#94a3b8">{{ d.date.slice(5) }}</div>
        </div>
      </div>
    </div>

    <div class="spacer"></div>

    <!-- Forecast (baseline) -->
    <div class="glass" style="padding:16px;border-radius:12px">
      <h3 style="margin:0 0 8px 0">7日基线预测</h3>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <div v-for="f in forecast" :key="f.day" class="glass" style="padding:12px 16px;border-radius:10px;min-width:160px">
          <div style="color:#64748b">+{{ f.day }} 天</div>
          <div style="font-weight:600">订单 ≈ {{ f.orders }}</div>
          <div style="color:#2563eb">营收 ≈ ¥{{ f.revenue.toFixed(2) }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

const kpi = ref<any>({ revenue_total:0, revenue_30:0, orders_7:0, low_stock_count:0 })
const daily = ref<any[]>([])
const forecast = ref<any[]>([])

const maxRevenue = computed(()=> Math.max(1, ...daily.value.map(d=>d.revenue)))
const maxOrders = computed(()=> Math.max(1, ...daily.value.map(d=>d.orders)))

const auth = useAuthStore()

onMounted(async () => {
  if (!auth.isAuthenticated) return
  try{
    const res = await api.get('/dashboard')
    Object.assign(kpi.value, res)
    daily.value = res.daily || []
    forecast.value = res.forecast || []
  }catch(e){
    // 忽略错误，保留空态
  }
})
</script>

<style scoped></style>
