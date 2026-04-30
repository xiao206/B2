<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getDocumentStatus, retryDocumentParse } from '@/api/document'
import { usePolling } from '@/composables/usePolling'
import { useDocumentStore } from '@/stores/document'
import { useAuditLogger } from '@/composables/useAuditLogger'
import { AUDIT_MODULES } from '@/constants/auditModules'

type DocStatus = 'UPLOADING' | 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED'

const route = useRoute()
const router = useRouter()
const docsStore = useDocumentStore()
const audit = useAuditLogger()

const docId = computed(() => String(route.params.docId || ''))
const status = ref<DocStatus>('PENDING')
const loading = ref(true)
const errorMessage = ref('')

const step = computed(() => {
  if (status.value === 'PENDING') return 1
  if (status.value === 'PROCESSING') return 2
  if (status.value === 'DONE') return 3
  if (status.value === 'FAILED') return 3
  return 1
})

const isCompany = computed(() => route.path.startsWith('/company'))
const base = computed(() => (isCompany.value ? '/company' : '/person'))

const fetchStatus = async () => {
  try {
    const resp = await getDocumentStatus(docId.value)
    const s = String((resp as any).status) as DocStatus
    status.value = s
    errorMessage.value = String((resp as any).errorMessage || '')
    loading.value = false
    docsStore.hydrate()
    docsStore.updateStatus(docId.value, s)
    if (s === 'DONE' || s === 'FAILED') {
      if (s === 'DONE') audit.logOk(AUDIT_MODULES.DOCUMENT_PARSE, { docId: docId.value, status: s })
      else audit.logFail(AUDIT_MODULES.DOCUMENT_PARSE, { docId: docId.value, status: s, errorMessage: errorMessage.value })
    }
    if (s === 'DONE' || s === 'FAILED') poll.stop()
  } catch (e: any) {
    loading.value = false
    poll.stop()
    errorMessage.value = e?.message || '查询状态失败'
    audit.logFail(AUDIT_MODULES.DOCUMENT_PARSE, { docId: docId.value, message: e?.message || '查询状态失败' })
    ElMessage.error(e?.message || '查询状态失败')
  }
}

const poll = usePolling(fetchStatus, 1200)

onMounted(async () => {
  await poll.start()
})

const goResult = () => router.push(`${base.value}/doc/result/${encodeURIComponent(docId.value)}`)

const retry = async () => {
  loading.value = true
  try {
    await retryDocumentParse(docId.value)
    audit.logOk(AUDIT_MODULES.DOCUMENT_PARSE_RETRY, { docId: docId.value })
    status.value = 'PENDING'
    errorMessage.value = ''
    poll.stop()
    await poll.start()
  } catch (e: any) {
    loading.value = false
    audit.logFail(AUDIT_MODULES.DOCUMENT_PARSE_RETRY, { docId: docId.value, message: e?.message || '重试失败' })
    ElMessage.error(e?.message || '重试失败')
  }
}
</script>

<template>
  <div class="space-y-4">
    <el-card shadow="never">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="text-base font-semibold">解析任务</div>
          <div class="mt-1 text-sm text-zinc-600">DocId：{{ docId }}</div>
        </div>
        <div class="flex items-center gap-2">
          <el-tag v-if="status === 'DONE'" type="success">完成</el-tag>
          <el-tag v-else-if="status === 'FAILED'" type="danger">失败</el-tag>
          <el-tag v-else-if="status === 'PROCESSING'" type="warning">处理中</el-tag>
          <el-tag v-else type="info">排队中</el-tag>
        </div>
      </div>
    </el-card>

    <el-card shadow="never">
      <div class="space-y-4">
        <el-steps :active="step" align-center>
          <el-step title="排队" description="任务进入队列" />
          <el-step title="解析中" description="抽取结构化信息" />
          <el-step title="完成" description="可查看结果与图谱" />
        </el-steps>

        <div v-if="loading" class="text-sm text-zinc-600">正在获取状态...</div>
        <div v-else-if="status === 'FAILED'" class="space-y-2 text-sm text-zinc-600">
          <div>解析失败。</div>
          <div v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">
            {{ errorMessage }}
          </div>
        </div>
        <div v-else-if="status === 'DONE'" class="text-sm text-zinc-600">
          解析完成，可进入结果页查看结构化字段与证据。
        </div>
        <div v-else class="text-sm text-zinc-600">状态将自动刷新。</div>

        <div class="flex justify-end gap-2">
          <el-button @click="router.push(`${base}/doc/list`)">返回文档中心</el-button>
          <el-button v-if="status === 'FAILED'" @click="router.push(`${base}/doc/upload`)">重新上传</el-button>
          <el-button v-if="status === 'FAILED'" type="primary" :loading="loading" @click="retry">重试解析</el-button>
          <el-button type="primary" :disabled="status !== 'DONE'" @click="goResult">查看结果</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>
