<template>
  <div style="display:flex;align-items:center;justify-content:center;min-height:calc(100vh - 64px - 96px)">
    <div class="row" style="width:760px">
      <div class="glass" style="flex:1;display:flex;align-items:center;justify-content:center;border-radius:16px">
        <a href="https://github.com" target="_blank" rel="noreferrer" style="display:flex;align-items:center;gap:12px;padding:24px;color:#0f172a">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.427 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.607.069-.607 1.003.07 1.53 1.03 1.53 1.03.892 1.53 2.341 1.088 2.91.833.092-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.952 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.748-1.026 2.748-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.849-2.338 4.695-4.566 4.943.359.31.678.921.678 1.856 0 1.339-.012 2.419-.012 2.749 0 .268.18.58.688.481A10.019 10.019 0 0 0 22 12.017C22 6.484 17.523 2 12 2Z" clip-rule="evenodd"/></svg>
          <span style="font-weight:600">GitHub</span>
        </a>
      </div>
      <div class="glass" style="flex:1;padding:24px;border-radius:16px">
        <h2 style="margin:0 0 12px 0">登录</h2>
        <p style="margin:0 0 16px 0;color:#475569">使用账户密码登录系统</p>
        <form @submit.prevent="onSubmit" style="display:flex;flex-direction:column;gap:12px">
          <input v-model="username" type="text" placeholder="用户名" style="height:44px;border-radius:10px;border:1px solid #cbd5e1;padding:0 12px"/>
          <input v-model="password" type="password" placeholder="密码" style="height:44px;border-radius:10px;border:1px solid #cbd5e1;padding:0 12px"/>
          <button class="primary" type="submit">登录</button>
        </form>
        <div class="spacer"></div>
        <div style="font-size:14px;color:#64748b">
          没有账号？ <a href="#" @click.prevent="$router.push('/register')">去注册</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import api, { login } from '../services/api'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const username = ref('')
const password = ref('')
const auth = useAuthStore()

async function onSubmit(){
  try{
    const res = await login({ username: username.value, password: password.value })
    auth.setAuth(res.user, res.access || res.token)
    router.replace('/orders')
  }catch(e){
    alert('登录失败')
  }
}
</script>

<style scoped></style>
