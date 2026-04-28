<script setup lang="ts">
import { ref } from 'vue'

type UserRow = { id: string; account: string; userType: 'PERSON' | 'COMPANY' | 'ADMIN'; status: 'ACTIVE' | 'DISABLED' }

const rows = ref<UserRow[]>([
  { id: 'u-001', account: 'demo', userType: 'PERSON', status: 'ACTIVE' },
  { id: 'u-002', account: 'hr-demo', userType: 'COMPANY', status: 'ACTIVE' },
  { id: 'u-003', account: 'admin', userType: 'ADMIN', status: 'ACTIVE' },
])
</script>

<template>
  <div class="space-y-4">
    <el-card shadow="never">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="text-base font-semibold">用户管理</div>
          <div class="mt-1 text-sm text-zinc-600">表格与筛选区骨架，后续可接入 /admin/users。</div>
        </div>
        <el-button v-permission="'ADMIN_USERS_VIEW'" type="primary">新增用户（占位）</el-button>
      </div>
    </el-card>

    <el-card shadow="never">
      <el-table :data="rows">
        <el-table-column prop="id" label="用户ID" width="160" />
        <el-table-column prop="account" label="账号" min-width="200" />
        <el-table-column prop="userType" label="角色" width="140" />
        <el-table-column prop="status" label="状态" width="140">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'danger'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default>
            <el-button v-permission="'ADMIN_USERS_VIEW'" link type="primary">查看</el-button>
            <el-button v-permission="'ADMIN_USERS_VIEW'" link type="danger">禁用</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

