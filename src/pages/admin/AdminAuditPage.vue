<script setup lang="ts">
import { reactive, ref } from 'vue'

type LogRow = { id: string; user: string; module: string; result: 'OK' | 'FAIL'; time: string }

const query = reactive({ user: '', module: '' })
const rows = ref<LogRow[]>([
  { id: 'log-001', user: 'demo', module: 'document.upload', result: 'OK', time: '2026-04-28 10:12:33' },
  { id: 'log-002', user: 'admin', module: 'admin.users', result: 'OK', time: '2026-04-28 10:18:07' },
  { id: 'log-003', user: 'hr-demo', module: 'match.recommend', result: 'FAIL', time: '2026-04-28 10:22:41' },
])

const filtered = () => {
  const u = query.user.trim()
  const m = query.module.trim()
  return rows.value.filter((r) => (!u || r.user.includes(u)) && (!m || r.module.includes(m)))
}
</script>

<template>
  <div class="space-y-4">
    <el-card shadow="never">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="text-base font-semibold">日志审计</div>
          <div class="mt-1 text-sm text-zinc-600">演示“按用户/模块筛选 + 表格展示”。</div>
        </div>
      </div>
    </el-card>

    <el-card shadow="never">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
        <el-input v-model="query.user" placeholder="用户" clearable />
        <el-input v-model="query.module" placeholder="模块" clearable />
        <div class="flex items-center justify-end">
          <el-button v-permission="'ADMIN_AUDIT_VIEW'" type="primary">导出（占位）</el-button>
        </div>
      </div>
    </el-card>

    <el-card shadow="never">
      <el-table :data="filtered()">
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="user" label="用户" width="160" />
        <el-table-column prop="module" label="模块" min-width="240" />
        <el-table-column prop="result" label="结果" width="120">
          <template #default="{ row }">
            <el-tag :type="row.result === 'OK' ? 'success' : 'danger'">{{ row.result }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default>
            <el-button v-permission="'ADMIN_AUDIT_VIEW'" link type="primary">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

