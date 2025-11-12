<template>
  <div>
    <header class="glass" style="position:sticky;top:0;z-index:1000;height:64px;display:flex;align-items:center">
      <div class="container row" style="justify-content:space-between;width:100%">
        <div style="font-weight:700;color:#2563eb;cursor:pointer" @click="$router.push('/')">ADPrinting</div>
        <nav style="display:flex;gap:16px;align-items:center">
          <a @click.prevent="$router.push('/')" href="#">首页</a>
          <a @click.prevent="$router.push('/login')" href="#">登录</a>
          <a @click.prevent="$router.push('/register')" href="#">注册</a>
        </nav>
      </div>
    </header>
    <main class="container" style="padding:24px 16px 48px 16px">
      <router-view />
    </main>
    <footer class="glass" style="margin-top:48px">
      <div class="container" style="padding:24px 16px;text-align:center;color:#334155">
        个人开发者：Ryan（Monash University） · 邮箱：hzhe0083@gmail.com
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
