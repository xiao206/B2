<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useDocumentStore } from '@/stores/document'
import { getParseResult } from '@/api/document'
import type { ParseResultVO } from '@/types/document'

const docsStore = useDocumentStore()
const drawerOpen = ref(false)
const current = ref<ParseResultVO | null>(null)
const loading = ref(false)

onMounted(() => {
  docsStore.hydrate()
})

const list = computed(() => docsStore.docs)

const openResult = async (docId: string) => {
  drawerOpen.value = true
  loading.value = true
  current.value = null
  try {
    const cached = docsStore.results[docId]
    if (cached) {
      current.value = cached
      return
    }
    const r = await getParseResult(docId)
    current.value = r
    docsStore.setResult(docId, r)
  } catch (e: any) {
    ElMessage.error(e?.message || '获取结果失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <el-card shadow="never">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div class="text-base font-semibold">文档库</div>
          <div class="mt-1 text-sm text-zinc-600">查看全量上传记录与解析结果入口（演示）。</div>
        </div>
      </div>
    </el-card>

    <el-card shadow="never">
      <el-table :data="list">
        <el-table-column prop="id" label="DocId" width="220" />
        <el-table-column prop="docType" label="类型" width="120" />
        <el-table-column prop="fileName" label="文件名" min-width="260" />
        <el-table-column prop="status" label="状态" width="140" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="'ADMIN_DOCS_VIEW'" link type="primary" :disabled="row.status !== 'DONE'" @click="openResult(row.id)">
              查看结果
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-drawer v-model="drawerOpen" title="解析结果" size="50%">
      <div v-if="loading" class="text-sm text-zinc-600">加载中...</div>
      <div v-else-if="!current" class="text-sm text-zinc-600">暂无数据</div>
      <div v-else class="space-y-3">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="DocId">{{ current.docId }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ current.status }}</el-descriptions-item>
        </el-descriptions>
        <pre class="max-h-[520px] overflow-auto rounded-lg bg-zinc-950 p-4 text-xs text-zinc-100">{{
          JSON.stringify(current.resultJson, null, 2)
        }}</pre>
      </div>
    </el-drawer>
  </div>
</template>

