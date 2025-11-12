<template>
  <section>
    <div class="glass" style="padding:16px;border-radius:12px;margin-top:8px">
      <h2 style="margin:0 0 8px 0">会员订阅</h2>
      <div v-if="loading" style="color:#64748b">加载中...</div>
      <div v-else>
        <div v-if="me?.merchant">
          <div style="margin-bottom:12px">店铺：<strong>{{ me.merchant.name }}</strong>（{{ me.merchant.slug }}）</div>
          <div v-if="me.subscription">
            <div>当前状态：<strong>{{ me.active ? '有效' : '已过期' }}</strong></div>
            <div>套餐：{{ me.subscription.plan?.name || '-' }}</div>
            <div>有效期：{{ me.subscription.start_date }} ~ {{ me.subscription.end_date }}</div>
          </div>
          <div v-else style="color:#94a3b8">尚未开通订阅</div>
          <div class="spacer"></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="primary" @click="subscribeYearly">立即开通/续费：¥60,000 / 年</button>
            <button class="ghost" @click="trial">开通试用（14天）</button>
          </div>
        </div>
        <div v-else>
          <div style="color:#ef4444;margin-bottom:8px">当前账号未绑定商户，无法开通会员</div>
          <button class="primary" @click="bootstrap">一键创建商户并绑定</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '../services/api'

const loading = ref(false)
const me = ref<any>(null)

async function load(){
  loading.value = true
  try{
    me.value = await api.get('/auth/merchant/me')
  } finally { loading.value = false }
}

async function trial(){
  await api.post('/auth/merchant/subscribe', { period: 'trial', plan_code: 'vip_60k', trial_days: 14 })
  await load()
  alert('已开通试用')
}

async function subscribeYearly(){
  await api.post('/auth/merchant/subscribe', { period: 'yearly', plan_code: 'vip_60k' })
  await load()
  alert('已开通/续费一年')
}

onMounted(load)

async function bootstrap(){
  await api.post('/auth/merchant/bootstrap')
  await load()
}
</script>

<style scoped></style>
