<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import GraphCanvas from '@/components/GraphCanvas.vue'
import { getJobGraph, getPersonGraph } from '@/api/graph'
import type { GraphData } from '@/types/graph'
import { isWebGLAvailable } from '@/utils/webgl'

const route = useRoute()

const subjectId = computed(() => String(route.params.subjectId || ''))
const isCompany = computed(() => route.path.startsWith('/company'))
const title = computed(() => (isCompany.value ? '职位能力图谱' : '个人能力图谱'))

const layout = ref<'force' | 'radial' | 'dagre'>('radial')
const data = ref<GraphData>({ nodes: [], edges: [] })
const webglOk = ref(true)
const loading = ref(true)

const load = async () => {
  loading.value = true
  try {
    data.value = isCompany.value ? await getJobGraph(subjectId.value) : await getPersonGraph(subjectId.value)
  } catch (e: any) {
    ElMessage.error(e?.message || '加载图谱失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  webglOk.value = isWebGLAvailable()
  await load()
})
</script>

<template>
  <div class="space-y-4">
    <el-card shadow="never">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="text-base font-semibold">{{ title }}</div>
          <div class="mt-1 text-sm text-zinc-600">
            支持拖拽、缩放与布局切换。节点数量过大时建议使用服务端裁剪与增量加载策略。
          </div>
        </div>
        <div class="flex items-center gap-2">
          <el-tag v-if="!webglOk" type="warning">已进入兼容模式</el-tag>
          <el-select v-model="layout" class="w-[160px]">
            <el-option label="辐射布局" value="radial" />
            <el-option label="力导向" value="force" />
            <el-option label="层次布局" value="dagre" />
          </el-select>
          <el-button :loading="loading" @click="load">刷新</el-button>
        </div>
      </div>
    </el-card>

    <div v-if="loading" class="text-sm text-zinc-600">加载中...</div>
    <GraphCanvas v-else :data="data" :layout="layout" />
  </div>
</template>

