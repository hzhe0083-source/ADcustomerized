<template>
  <section>
    <div class="glass" style="padding:24px;border-radius:16px;margin-top:8px">
      <h1 style="margin:0 0 8px 0">欢迎使用 ADPrinting</h1>
      <p style="margin:0;color:#475569">简洁高效的工厂管理界面。已去除轮播与广告元素。</p>
    </div>
    <div class="spacer"></div>
    <div class="row">
      <div class="glass" style="flex:1;padding:16px;border-radius:12px">
        <h3 style="margin:0 0 6px 0">快速入口</h3>
        <div class="row" style="flex-wrap:wrap">
          <button class="primary" @click="$router.push('/login')">登录</button>
          <button class="ghost" style="margin-left:8px" @click="$router.push('/')">首页</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped></style>

