<template>
  <section>
    <div class="glass" style="padding:16px;border-radius:12px;margin-top:8px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div>
          <h2 style="margin:0 0 4px 0">材料库存</h2>
          <p style="margin:0;color:#64748b">查看材料清单、库存与最低库存预警</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <select v-model="filters.category" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px">
            <option value="">全部分类</option>
            <option value="ink">墨水</option>
            <option value="substrate">基材</option>
            <option value="coating">涂层</option>
            <option value="accessory">辅料</option>
          </select>
          <input v-model="filters.search" placeholder="搜索：名称/规格/供应商" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px;min-width:260px" @keyup.enter="load(1)"/>
          <button class="primary" @click="load(1)">查询</button>
        </div>
      </div>

      <div class="spacer"></div>

      <div v-if="loading" style="color:#64748b">加载中...</div>
      <div v-else>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="text-align:left;color:#475569">
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">名称</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">分类</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">规格</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">单位</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">库存</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">最低库存</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">单价</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">供应商</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in viewData" :key="m.id" :style="rowStyle(m)">
              <td style="padding:10px 6px">{{ m.name }}</td>
              <td style="padding:10px 6px">{{ catName(m.category) }}</td>
              <td style="padding:10px 6px">{{ m.specification || '-' }}</td>
              <td style="padding:10px 6px">{{ m.unit }}</td>
              <td style="padding:10px 6px">{{ n(m.stock_quantity) }}</td>
              <td style="padding:10px 6px">{{ n(m.min_stock) }}</td>
              <td style="padding:10px 6px">¥{{ n(m.unit_price, 2) }}</td>
              <td style="padding:10px 6px">{{ m.supplier || '-' }}</td>
              <td style="padding:10px 6px">{{ m.is_active ? '启用' : '停用' }}</td>
            </tr>
            <tr v-if="viewData.length===0">
              <td colspan="9" style="padding:12px;color:#94a3b8">暂无数据</td>
            </tr>
          </tbody>
        </table>

        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px">
          <div style="color:#64748b">共 {{ pagination.total }} 条</div>
          <div style="display:flex;align-items:center;gap:8px">
            <button class="ghost" :disabled="pagination.page<=1" @click="changePage(pagination.page-1)">上一页</button>
            <div style="min-width:80px;text-align:center">第 {{ pagination.page }} / {{ totalPages }} 页</div>
            <button class="ghost" :disabled="pagination.page>=totalPages" @click="changePage(pagination.page+1)">下一页</button>
            <select v-model.number="pagination.pageSize" @change="load(1)" style="height:36px;border:1px solid #cbd5e1;border-radius:10px;padding:0 10px">
              <option :value="10">每页 10 条</option>
              <option :value="20">每页 20 条</option>
              <option :value="50">每页 50 条</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { getMaterials } from '../services/api'

const loading = ref(false)
const data = ref<any[]>([])
const filters = reactive({ category: '', search: '' })
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const totalPages = computed(()=> Math.max(1, Math.ceil(pagination.total / pagination.pageSize)))

const viewData = computed(()=>{
  const kw = (filters.search||'').trim().toLowerCase()
  const cat = filters.category
  return data.value.filter(m => {
    if (!m) return false
    if (cat && m.category !== cat) return false
    if (!kw) return true
    const h = `${m.name||''} ${m.specification||''} ${m.supplier||''}`.toLowerCase()
    return h.includes(kw)
  })
})

function rowStyle(m:any){
  try{
    const low = Number(m.stock_quantity) < Number(m.min_stock)
    return low ? { background: 'rgba(239,68,68,0.06)' } : {}
  }catch{return {}}
}

function n(v:any, d=0){
  const num = Number(v||0)
  return d? num.toFixed(d) : num
}

function catName(v:string){
  switch(v){
    case 'ink': return '墨水'
    case 'substrate': return '基材'
    case 'coating': return '涂层'
    case 'accessory': return '辅料'
    default: return v || '-'
  }
}

async function load(page?:number){
  if (page) pagination.page = page
  loading.value = true
  try{
    const res = await getMaterials({ page: pagination.page, pageSize: pagination.pageSize })
    if (res?.results){
      data.value = res.results
      pagination.total = res.count || res.results.length
    }else if (Array.isArray(res)){
      data.value = res
      pagination.total = res.length
    }else{
      data.value = []
      pagination.total = 0
    }
  } finally { loading.value = false }
}

function changePage(p:number){
  pagination.page = Math.min(Math.max(1, p), totalPages.value)
  load()
}

onMounted(()=> load(1))
</script>

<style scoped></style>
