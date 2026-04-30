<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useDocumentStore } from '@/stores/document'
import type { DocStatus } from '@/types/document'
import AppEmpty from '@/components/AppEmpty.vue'
import { formatDateTime } from '@/utils/date'
import { downloadCsv, downloadJson } from '@/utils/export'

const route = useRoute()
const router = useRouter()
const docsStore = useDocumentStore()

const isCompany = computed(() => route.path.startsWith('/company'))
const base = computed(() => (isCompany.value ? '/company' : '/person'))
const title = computed(() => (isCompany.value ? 'JD 文档中心' : '简历文档中心'))

onMounted(() => {
  docsStore.hydrate()
})

const source = computed(() => {
  const t = isCompany.value ? 'JOB_DESC' : 'RESUME'
  return docsStore.docs.filter((d) => d.docType === t)
})

const query = reactive<{
  keyword: string
  status: '' | DocStatus
  sort: 'created_desc' | 'created_asc'
}>({
  keyword: '',
  status: '',
  sort: 'created_desc',
})

const page = ref(1)
const pageSize = ref(10)

watch(
  () => [query.keyword, query.status, query.sort],
  () => {
    page.value = 1
  },
)

const filtered = computed(() => {
  const k = query.keyword.trim().toLowerCase()
  let rows = source.value.slice()
  if (k) rows = rows.filter((d) => `${d.fileName} ${d.fileType}`.toLowerCase().includes(k))
  if (query.status) rows = rows.filter((d) => d.status === query.status)
  rows.sort((a, b) => {
    const ta = new Date(a.createdAt).getTime()
    const tb = new Date(b.createdAt).getTime()
    return query.sort === 'created_asc' ? ta - tb : tb - ta
  })
  return rows
})

const paged = computed(() => filtered.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))

const statusTag = (s: DocStatus) => {
  if (s === 'DONE') return { type: 'success', label: '完成' }
  if (s === 'FAILED') return { type: 'danger', label: '失败' }
  if (s === 'PROCESSING') return { type: 'warning', label: '处理中' }
  if (s === 'PENDING') return { type: 'info', label: '排队中' }
  if (s === 'UPLOADING') return { type: 'info', label: '上传中' }
  return { type: 'info', label: s }
}

const goUpload = () => router.push(`${base.value}/doc/upload`)
const goTask = (docId: string) => router.push(`${base.value}/doc/task/${encodeURIComponent(docId)}`)
const goResult = (docId: string) => router.push(`${base.value}/doc/result/${encodeURIComponent(docId)}`)

const selectedIds = ref<string[]>([])

const onSelectionChange = (rows: any[]) => {
  selectedIds.value = rows.map((r) => String(r.id))
}

const currentIds = computed(() => (selectedIds.value.length ? selectedIds.value : filtered.value.map((d) => d.id)))

const batchRemove = async () => {
  const ids = currentIds.value
  if (!ids.length) return ElMessage.warning('暂无可删除数据')
  await ElMessageBox.confirm(`确认删除 ${ids.length} 条文档记录？`, '提示', { type: 'warning' })
  docsStore.hydrate()
  ids.forEach((id) => docsStore.removeDoc(id))
  selectedIds.value = []
  ElMessage.success('已删除')
}

const exportMetaJson = () => {
  const ids = currentIds.value
  const rows = filtered.value.filter((d) => ids.includes(d.id))
  if (!rows.length) return ElMessage.warning('暂无可导出数据')
  downloadJson(`docs-${Date.now()}.json`, rows)
}

const exportMetaCsv = () => {
  const ids = currentIds.value
  const rows = filtered.value.filter((d) => ids.includes(d.id))
  if (!rows.length) return ElMessage.warning('暂无可导出数据')
  downloadCsv(
    `docs-${Date.now()}.csv`,
    rows.map((d) => ({
      id: d.id,
      fileName: d.fileName,
      fileType: d.fileType,
      docType: d.docType,
      status: d.status,
      createdAt: d.createdAt,
    })),
  )
}

const exportResultsJson = () => {
  const ids = currentIds.value
  if (!ids.length) return ElMessage.warning('暂无可导出数据')
  docsStore.hydrate()
  const payload = ids.map((id) => ({ docId: id, result: docsStore.results[id] ?? null }))
  downloadJson(`doc-results-${Date.now()}.json`, payload)
}

const removeOne = async (id: string) => {
  await ElMessageBox.confirm('确认删除该文档记录？', '提示', { type: 'warning' })
  docsStore.hydrate()
  docsStore.removeDoc(id)
  selectedIds.value = selectedIds.value.filter((x) => x !== id)
  ElMessage.success('已删除')
}
</script>

<template>
  <div class="space-y-4">
    <el-card shadow="never">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div class="text-base font-semibold">{{ title }}</div>
          <div class="mt-1 text-sm text-zinc-600">包含上传记录、解析任务与结果入口（本地 sessionStorage 持久化）。</div>
        </div>
        <el-button type="primary" @click="goUpload">新增上传</el-button>
      </div>
    </el-card>

    <el-card shadow="never">
      <div class="mb-3 grid grid-cols-1 gap-3 md:grid-cols-4">
        <el-input v-model="query.keyword" placeholder="搜索（文件名/类型）" clearable />
        <el-select v-model="query.status" placeholder="状态" clearable>
          <el-option label="排队中" value="PENDING" />
          <el-option label="处理中" value="PROCESSING" />
          <el-option label="完成" value="DONE" />
          <el-option label="失败" value="FAILED" />
        </el-select>
        <el-select v-model="query.sort">
          <el-option label="创建时间：新到旧" value="created_desc" />
          <el-option label="创建时间：旧到新" value="created_asc" />
        </el-select>
        <div class="flex items-center justify-end gap-2">
          <el-button @click="exportMetaJson">导出 JSON</el-button>
          <el-button @click="exportMetaCsv">导出 CSV</el-button>
          <el-button @click="exportResultsJson">导出结果</el-button>
          <el-button type="danger" @click="batchRemove">删除</el-button>
        </div>
      </div>

      <AppEmpty v-if="filtered.length === 0" description="暂无记录，请先上传文档。">
        <el-button type="primary" @click="goUpload">去上传</el-button>
      </AppEmpty>
      <el-table v-else :data="paged" @selection-change="onSelectionChange">
        <el-table-column type="selection" width="48" />
        <el-table-column prop="fileName" label="文件名" min-width="260" />
        <el-table-column prop="fileType" label="类型" width="90" />
        <el-table-column prop="createdAt" label="创建时间" width="200">
          <template #default="{ row }">
            <span class="text-xs text-zinc-600">{{ formatDateTime(row.createdAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="140">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status).type">{{ statusTag(row.status).label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="goTask(row.id)">任务</el-button>
            <el-button link type="primary" :disabled="row.status !== 'DONE'" @click="goResult(row.id)">结果</el-button>
            <el-button link type="danger" @click="removeOne(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="filtered.length" class="mt-3 flex justify-end">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="filtered.length"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
        />
      </div>
    </el-card>
  </div>
</template>
