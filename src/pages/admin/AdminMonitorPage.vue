<script setup lang="ts">
import { ref } from 'vue'

const stats = ref([
  { title: '解析成功率', value: '98.2%', hint: '近 24h（演示）', type: 'success' as const },
  { title: '解析平均耗时', value: '2.6s', hint: '近 24h（演示）', type: 'info' as const },
  { title: '匹配平均响应', value: '420ms', hint: '近 24h（演示）', type: 'warning' as const },
  { title: '模型模式', value: '本地', hint: '最近健康检查：刚刚', type: 'danger' as const },
])
</script>

<template>
  <div class="space-y-4">
    <el-card shadow="never">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="text-base font-semibold">运营监控</div>
          <div class="mt-1 text-sm text-zinc-600">监控聚合接口可对齐 /admin/monitor/summary（占位）。</div>
        </div>
        <el-button v-permission="'ADMIN_MONITOR_VIEW'">刷新</el-button>
      </div>
    </el-card>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <el-card v-for="s in stats" :key="s.title" shadow="never">
        <div class="text-xs text-zinc-500">{{ s.title }}</div>
        <div class="mt-2 text-2xl font-semibold text-zinc-900">{{ s.value }}</div>
        <div class="mt-1 text-xs text-zinc-500">{{ s.hint }}</div>
      </el-card>
    </div>

    <el-card shadow="never">
      <el-alert type="info" show-icon :closable="false">
        <template #title>落地建议</template>
        <template #default>
          后续可把“解析任务数/成功率/平均耗时、匹配调用量/平均响应、服务健康与错误码 Top”等指标由后端聚合后返回，
          前端按 30~60s 轮询刷新，并保留导出与审计入口。
        </template>
      </el-alert>
    </el-card>
  </div>
</template>

