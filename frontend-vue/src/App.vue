<template>
  <div class="layout">
    <aside class="glass sidebar">
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
      </nav>
      <div class="spacer"></div>
      <div style="font-size:12px;color:#64748b">个人开发者：Ryan · 邮箱：hzhe0083@gmail.com</div>
    </aside>
    <div class="content">
      <header class="glass" style="position:sticky;top:0;z-index:1000;height:64px;display:flex;align-items:center">
        <div class="container row" style="justify-content:flex-end;width:100%">
          <nav style="display:flex;gap:16px;align-items:center">
            <a @click.prevent="$router.push('/login')" href="#">登录</a>
            <a @click.prevent="$router.push('/register')" href="#">注册</a>
          </nav>
        </div>
      </header>
      <main class="container" style="padding:24px 16px 48px 16px">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
