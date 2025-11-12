<template>
  <section>
    <div class="container">
      <div class="glass" style="padding:24px;border-radius:16px;margin-top:12px;text-align:center">
        <h2 style="margin:0 0 8px 0">下单成功</h2>
        <p style="margin:0 0 12px 0;color:#64748b">订单已提交，我们将尽快处理</p>
        <div>订单ID：{{ orderId }}</div>
        <div class="spacer"></div>
        <div style="display:flex;gap:8px;justify-content:center">
          <button class="primary" @click="goOrders">查看我的订单</button>
          <button class="ghost" @click="goHome">返回商城</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const orderId = route.params.orderId as string

function goOrders(){
  const m = (route.params.merchant as string) || ''
  if (m) router.push(`/s/${m}/orders`)
  else router.push('/orders')
}
function goHome(){
  const m = (route.params.merchant as string) || ''
  if (m) router.push(`/s/${m}`)
  else router.push('/shop')
}
</script>

<style scoped></style>

