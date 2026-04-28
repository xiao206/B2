<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="space-y-4">
    <el-card shadow="never">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="text-base font-semibold">管理端概览</div>
          <div class="mt-1 text-sm text-zinc-600">用于演示“运营与监控需求”的页面骨架。</div>
        </div>
      </div>
    </el-card>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
      <el-card shadow="never" class="cursor-pointer" @click="router.push('/admin/users')">
        <div class="text-sm font-semibold">用户管理</div>
        <div class="mt-1 text-sm text-zinc-600">查询、分页、禁用/重置（占位）。</div>
      </el-card>
      <el-card shadow="never" class="cursor-pointer" @click="router.push('/admin/monitor')">
        <div class="text-sm font-semibold">运营监控</div>
        <div class="mt-1 text-sm text-zinc-600">服务状态、解析/匹配指标、模型模式。</div>
      </el-card>
      <el-card shadow="never" class="cursor-pointer" @click="router.push('/admin/audit')">
        <div class="text-sm font-semibold">日志审计</div>
        <div class="mt-1 text-sm text-zinc-600">按用户/时间/模块筛选与详情抽屉。</div>
      </el-card>
    </div>
  </div>
</template>

