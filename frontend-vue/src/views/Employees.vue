<template>
  <section>
    <div class="glass" style="padding:16px;border-radius:12px;margin-top:8px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div>
          <h2 style="margin:0 0 4px 0">员工管理 / 考勤</h2>
          <p style="margin:0;color:#64748b">员工签到/签退，以及最近考勤记录</p>
        </div>
        <div style="display:flex;gap:8px">
          <button class="primary" @click="doCheckIn">签到</button>
          <button class="ghost" @click="doCheckOut">签退</button>
        </div>
      </div>

      <div class="spacer"></div>

      <div class="glass" style="padding:12px;border-radius:10px">
        <div style="font-weight:600;margin-bottom:6px">今日</div>
        <div v-if="today">
          <div>签到：{{ dt(today.check_in_time) || '-' }}</div>
          <div>签退：{{ dt(today.check_out_time) || '-' }}</div>
          <div>状态：{{ zh(today.status) }}</div>
        </div>
        <div v-else style="color:#94a3b8">今日暂无记录</div>
      </div>

      <div class="spacer"></div>

      <div>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="text-align:left;color:#475569">
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">日期</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">签到</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">签退</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">状态</th>
              <th style="padding:8px 6px;border-bottom:1px solid #e2e8f0">备注</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in records" :key="r.id">
              <td style="padding:10px 6px">{{ r.date }}</td>
              <td style="padding:10px 6px">{{ dt(r.check_in_time) || '-' }}</td>
              <td style="padding:10px 6px">{{ dt(r.check_out_time) || '-' }}</td>
              <td style="padding:10px 6px">{{ zh(r.status) }}</td>
              <td style="padding:10px 6px">{{ r.notes || '-' }}</td>
            </tr>
            <tr v-if="records.length===0"><td colspan="5" style="padding:12px;color:#94a3b8">暂无记录</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getAttendance, checkIn, checkOut } from '../services/api'

const records = ref<any[]>([])
const today = ref<any | null>(null)

function dt(v:any){ return v ? new Date(v).toLocaleString() : '' }
function zh(s:string){ return s==='present'?'出勤':s==='late'?'迟到':s==='absent'?'缺勤':s }

async function load(){
  const res = await getAttendance({ start: new Date(Date.now()-15*24*3600*1000).toISOString().slice(0,10) })
  const list = res?.results || res || []
  records.value = list
  const todayStr = new Date().toISOString().slice(0,10)
  today.value = list.find((x:any)=>x.date===todayStr) || null
}

async function doCheckIn(){ await checkIn(); await load() }
async function doCheckOut(){ await checkOut(); await load() }

onMounted(load)
</script>

<style scoped></style>
