<template>
  <section>
    <div class="glass" style="padding:16px;border-radius:12px;margin-top:8px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div>
          <h2 style="margin:0 0 4px 0">客户管理</h2>
          <p style="margin:0;color:#64748b">查看客户列表、搜索客户并查看详情</p>
        </div>
        <div style="display:flex;gap:8px">
          <input v-model="filters.keyword" placeholder="搜索：名称/公司/电话/邮箱" style="height:36px;border-radius:10px;border:1px solid #cbd5e1;padding:0 10px;min-width:260px" @keyup.enter="fetchList(1)"/>
          <select v-model="filters.status" style="height:36px;border-radius:10px;border:1px solid #cbd5e1;padding:0 10px">
            <option value="">全部状态</option>
            <option value="active">启用</option>
            <option value="inactive">停用</option>
          </select>
          <button class="primary" @click="fetchList(1)">查询</button>
        </div>
      </div>

      <div class="spacer"></div>

      <div v-if="loading" style="color:#64748b">加载中...</div>
      <div v-else>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="text-align:left;color:#475569">
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">客户名</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">公司</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">电话</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">邮箱</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">信用额度</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">已用额度</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">状态</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">创建时间</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in customers" :key="c.id">
              <td style="padding:10px 6px">{{ c.user?.username || c.name || '-' }}</td>
              <td style="padding:10px 6px">{{ c.company || c.companyName || '-' }}</td>
              <td style="padding:10px 6px">{{ c.phone || '-' }}</td>
              <td style="padding:10px 6px">{{ c.user?.email || c.email || '-' }}</td>
              <td style="padding:10px 6px">{{ c.creditLimit ?? '-' }}</td>
              <td style="padding:10px 6px">{{ c.usedCredit ?? '-' }}</td>
              <td style="padding:10px 6px">{{ c.status || (c.isActive===false?'inactive':'active') }}</td>
              <td style="padding:10px 6px">{{ toDateTime(c.createdAt || c.created_at) }}</td>
              <td style="padding:10px 6px">
                <a href="#" @click.prevent="openDetail(c)">详情</a>
              </td>
            </tr>
            <tr v-if="customers.length === 0">
              <td colspan="9" style="padding:12px;color:#94a3b8">暂无客户数据</td>
            </tr>
          </tbody>
        </table>

        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px">
          <div style="color:#64748b">共 {{ pagination.total }} 条</div>
          <div style="display:flex;align-items:center;gap:8px">
            <button class="ghost" :disabled="pagination.page<=1" @click="changePage(pagination.page-1)">上一页</button>
            <div style="min-width:80px;text-align:center">第 {{ pagination.page }} / {{ totalPages }} 页</div>
            <button class="ghost" :disabled="pagination.page>=totalPages" @click="changePage(pagination.page+1)">下一页</button>
            <select v-model.number="pagination.pageSize" @change="fetchList(1)" style="height:36px;border-radius:10px;border:1px solid #cbd5e1;padding:0 10px">
              <option :value="10">每页 10 条</option>
              <option :value="20">每页 20 条</option>
              <option :value="50">每页 50 条</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div v-if="detailVisible" style="position:fixed;inset:0;background:rgba(15,23,42,0.35)">
      <div class="glass" style="position:absolute;right:0;top:0;height:100%;width:440px;padding:16px 16px 24px 16px;border-left:1px solid #e2e8f0;overflow:auto">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
          <h3 style="margin:0">客户详情</h3>
          <button class="ghost" @click="detailVisible=false">关闭</button>
        </div>
        <div class="spacer"></div>
        <div v-if="detail">
          <div style="display:grid;grid-template-columns:100px 1fr;gap:8px;align-items:center">
            <div style="color:#64748b">客户名</div><div>{{ detail.user?.username || detail.name || '-' }}</div>
            <div style="color:#64748b">公司</div><div>{{ detail.company || detail.companyName || '-' }}</div>
            <div style="color:#64748b">邮箱</div><div>{{ detail.user?.email || detail.email || '-' }}</div>
            <div style="color:#64748b">电话</div><div>{{ detail.phone || '-' }}</div>
            <div style="color:#64748b">信用额度</div><div>{{ detail.creditLimit ?? '-' }}</div>
            <div style="color:#64748b">已用额度</div><div>{{ detail.usedCredit ?? '-' }}</div>
            <div style="color:#64748b">状态</div><div>{{ detail.status || (detail.isActive===false?'inactive':'active') }}</div>
            <div style="color:#64748b">创建时间</div><div>{{ toDateTime(detail.createdAt || detail.created_at) }}</div>
          </div>
          <div class="spacer"></div>
          <div>
            <div style="font-weight:600;margin-bottom:6px">收货地址</div>
            <div v-if="Array.isArray(detail.shippingAddresses) && detail.shippingAddresses.length">
              <ul>
                <li v-for="(addr,i) in detail.shippingAddresses" :key="i">{{ formatAddress(addr) }}</li>
              </ul>
            </div>
            <div v-else style="color:#94a3b8">暂无地址</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import { getCustomers, getCustomerById } from '../services/api'

type AnyObj = Record<string, any>

const loading = ref(false)
const customers = ref<AnyObj[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })
const filters = reactive({ keyword: '', status: '' })

const detailVisible = ref(false)
const detail = ref<AnyObj | null>(null)

const totalPages = computed(() => Math.max(1, Math.ceil(pagination.total / pagination.pageSize)))

function toDateTime(v: any){
  if (!v) return '-'
  try{ return new Date(v).toLocaleString() }catch{ return String(v) }
}

function formatAddress(addr: any){
  if (!addr) return '-'
  if (typeof addr === 'string') return addr
  const { province, city, district, detail } = addr
  return [province, city, district, detail].filter(Boolean).join(' ')
}

async function fetchList(page?: number){
  if (page) pagination.page = page
  loading.value = true
  try{
    const params: AnyObj = { page: pagination.page, pageSize: pagination.pageSize }
    if (filters.keyword) params.search = filters.keyword
    if (filters.status) params.status = filters.status
    const res = await getCustomers(params)
    if (res?.results){
      customers.value = res.results
      pagination.total = res.count || res.total || res.results.length
    } else if (Array.isArray(res)){
      customers.value = res
      pagination.total = res.length
    } else {
      customers.value = []
      pagination.total = 0
    }
  } finally {
    loading.value = false
  }
}

async function openDetail(c: AnyObj){
  try{
    detail.value = await getCustomerById(c.id)
  }catch{
    detail.value = c
  }
  detailVisible.value = true
}

function changePage(p: number){
  pagination.page = Math.min(Math.max(1, p), totalPages.value)
  fetchList()
}

onMounted(() => fetchList(1))
</script>

<style scoped></style>
