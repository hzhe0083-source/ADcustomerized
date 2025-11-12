<template>
  <div class="layout">
    <aside class="glass sidebar" v-if="!hideSidebar">
      <div style="font-weight:700;color:#2563eb;margin-bottom:12px;cursor:pointer" @click="$router.push('/')">ADPrinting</div>
      <nav style="display:flex;flex-direction:column;gap:6px">
        <a :class="{active: $route.path==='/' }" href="#" @click.prevent="$router.push('/')">概览</a>
        <a :class="{active: $route.path.startsWith('/orders') }" href="#" @click.prevent="$router.push('/orders')">订单</a>
        <a :class="{active: $route.path.startsWith('/customers') }" href="#" @click.prevent="$router.push('/customers')">客户</a>
        <a :class="{active: $route.path.startsWith('/employees') }" href="#" @click.prevent="$router.push('/employees')">员工</a>
        <a :class="{active: $route.path.startsWith('/materials') }" href="#" @click.prevent="$router.push('/materials')">材料库存</a>
        <a :class="{active: $route.path.startsWith('/plans') }" href="#" @click.prevent="$router.push('/plans')">生产计划</a>
        <a :class="{active: $route.path.startsWith('/quality') }" href="#" @click.prevent="$router.push('/quality')">质量</a>
        <a :class="{active: $route.path.startsWith('/reports') }" href="#" @click.prevent="$router.push('/reports')">报表</a>
        <a :class="{active: $route.path.startsWith('/equipment') }" href="#" @click.prevent="$router.push('/equipment')">设备</a>
        <a :class="{active: $route.path.startsWith('/products') }" href="#" @click.prevent="$router.push('/products')">产品</a>
        <a :class="{active: $route.path.startsWith('/catalog') }" href="#" @click.prevent="$router.push('/catalog')">品类管理</a>
        <a :class="{active: $route.path.startsWith('/membership') }" href="#" @click.prevent="$router.push('/membership')">会员订阅</a>
        <a :class="{active: $route.path.startsWith('/nesting') }" href="#" @click.prevent="$router.push('/nesting')">拼版</a>
      </nav>
      <div class="spacer"></div>
      <div style="font-size:12px;color:#64748b">Ryan</div>
      <div style="font-size:12px;color:#64748b">Monash University</div>
      <div style="font-size:12px;color:#64748b">hzhe0083@gmail.com</div>
    </aside>
    <div class="content">
      <header class="glass" style="position:sticky;top:0;z-index:1000;height:64px;display:flex;align-items:center">
        <div class="container row" style="justify-content:flex-end;width:100%">
          <nav style="display:flex;gap:16px;align-items:center">
            <template v-if="!auth.isAuthenticated">
              <a @click.prevent="$router.push('/login')" href="#">登录</a>
              <a @click.prevent="$router.push('/register')" href="#">注册</a>
            </template>
            <template v-else>
              <div style="display:flex;align-items:center;gap:12px">
                <div :title="subInfo" style="display:flex;align-items:center;gap:8px;cursor:pointer" @click="$router.push('/membership')">
                  <div style="width:30px;height:30px;border-radius:50%;background:#2563eb;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600">
                    {{ avatarText }}
                  </div>
                  <div style="display:flex;flex-direction:column">
                    <span style="font-weight:600;line-height:16px">{{ auth.user?.username || '用户' }}</span>
                    <span v-if="expireText" style="font-size:12px;color:#64748b;line-height:14px">{{ expireText }}</span>
                  </div>
                </div>
                <a href="#" @click.prevent="logout">退出</a>
              </div>
            </template>
          </nav>
        </div>
      </header>
      <main class="container" style="padding:24px 16px 48px 16px">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from './services/api'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const hideSidebar = computed(() => route.path.startsWith('/login') || route.path.startsWith('/register') || route.path.startsWith('/shop') || route.path.startsWith('/s/'))
const auth = useAuthStore()
const merchantMe = ref<any>(null)
const expireText = computed(()=> merchantMe.value?.subscription?.end_date ? ('到期：'+merchantMe.value.subscription.end_date) : '')
const subInfo = computed(()=> merchantMe.value?.active ? '会员有效' : '未开通/已过期，点击开通')
const avatarText = computed(()=> (auth.user?.username||'U').slice(0,1).toUpperCase())

function logout(){ auth.logout(); window.location.href = '/login' }

onMounted(async ()=>{
  if (auth.isAuthenticated){
    try{ merchantMe.value = await api.get('/auth/merchant/me') }catch{}
  }
})
</script>

<style scoped></style>
