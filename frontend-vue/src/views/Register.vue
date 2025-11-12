<template>
  <div style="display:flex;align-items:center;justify-content:center;min-height:calc(100vh - 64px - 96px)">
    <div class="glass" style="width:520px;padding:24px;border-radius:16px">
      <h2 style="margin:0 0 12px 0">注册</h2>
      <p style="margin:0 0 16px 0;color:#475569">创建你的账户</p>
      <form @submit.prevent="onSubmit" style="display:flex;flex-direction:column;gap:12px">
        <input v-model.trim="username" type="text" placeholder="用户名（必填）" required style="height:44px;border-radius:10px;border:1px solid #cbd5e1;padding:0 12px"/>
        <input v-model.trim="email" type="email" placeholder="邮箱（可选）" style="height:44px;border-radius:10px;border:1px solid #cbd5e1;padding:0 12px"/>
        <input v-model.trim="password" type="password" placeholder="密码（必填）" required style="height:44px;border-radius:10px;border:1px solid #cbd5e1;padding:0 12px"/>
        <button class="primary" type="submit">注册</button>
      </form>
      <div class="spacer"></div>
      <div style="font-size:14px;color:#64748b">
        已有账号？ <a href="#" @click.prevent="$router.push('/login')">去登录</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { register } from '../services/api'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const email = ref('')
const password = ref('')

async function onSubmit(){
  if ((password.value || '').length < 6){
    alert('密码至少 6 位')
    return
  }
  try{
    const payload: any = { username: username.value.trim(), password: password.value }
    if (email.value) payload.email = email.value.trim()
    const res = await register(payload)
    if (res?.access || res?.token){
      localStorage.setItem('token', res.access || res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      router.replace('/orders')
    } else {
      router.push('/login')
    }
  }catch(e: any){
    const msg = e?.response?.data ? JSON.stringify(e.response.data) : (e?.message || '注册失败')
    alert(msg)
  }
}
</script>

<style scoped></style>
