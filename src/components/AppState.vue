<script setup lang="ts">
const props = defineProps<{
  state: 'loading' | 'empty' | 'error'
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="py-10">
    <div v-if="props.state === 'loading'" class="text-center text-sm text-zinc-600 dark:text-zinc-400">
      {{ props.description || '加载中...' }}
    </div>
    <el-empty v-else :description="props.description || (props.state === 'error' ? '加载失败' : '暂无数据')">
      <template #default>
        <div v-if="props.title" class="mb-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">{{ props.title }}</div>
        <slot />
      </template>
    </el-empty>
  </div>
</template>
