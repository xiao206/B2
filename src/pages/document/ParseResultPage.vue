<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getParseResult } from '@/api/document'
import type { ParseResultVO } from '@/types/document'
import { useDocumentStore } from '@/stores/document'
import AppEmpty from '@/components/AppEmpty.vue'
import AppState from '@/components/AppState.vue'
import { downloadCsv, downloadJson } from '@/utils/export'

const route = useRoute()
const router = useRouter()
const docsStore = useDocumentStore()

const docId = computed(() => String(route.params.docId || ''))
const isCompany = computed(() => route.path.startsWith('/company'))
const base = computed(() => (isCompany.value ? '/company' : '/person'))

const loading = ref(true)
const data = ref<ParseResultVO | null>(null)
const error = ref('')

const parsed = computed(() => {
  const v = data.value?.resultJson
  if (!v || typeof v !== 'object') return null
  return v as any
})

const skills = computed<string[]>(() => {
  const s = parsed.value?.skills
  return Array.isArray(s) ? s.filter((x: any) => typeof x === 'string') : []
})

const educations = computed<Array<{ school?: string; degree?: string; major?: string }>>(() => {
  const e = parsed.value?.education
  return Array.isArray(e) ? e : []
})

const projects = computed<Array<{ name?: string; summary?: string }>>(() => {
  const p = parsed.value?.projects
  return Array.isArray(p) ? p : []
})

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    data.value = await getParseResult(docId.value)
    if (data.value) {
      docsStore.hydrate()
      docsStore.setResult(docId.value, data.value)
      docsStore.updateStatus(docId.value, data.value.status)
    }
  } catch (e: any) {
    error.value = e?.message || '获取解析结果失败'
    ElMessage.error(e?.message || '获取解析结果失败')
  } finally {
    loading.value = false
  }
})

const goGraph = () => {
  const subjectId = isCompany.value ? 'job-001' : 'person-001'
  router.push(`${base.value}/graph/${subjectId}`)
}

const downloadResult = () => {
  if (!data.value) return
  downloadJson(`parse-result-${docId.value}.json`, data.value)
}

const copyResult = async () => {
  if (!data.value) return
  const text = JSON.stringify(data.value.resultJson, null, 2)
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.left = '-9999px'
      document.body.appendChild(el)
      el.focus()
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    ElMessage.success('已复制 JSON')
  } catch {
    ElMessage.error('复制失败')
  }
}

const downloadEvidence = () => {
  if (!data.value) return
  downloadCsv(
    `parse-evidences-${docId.value}.csv`,
    (data.value.evidences || []).map((e) => ({
      field: e.field,
      page: e.page ?? '',
      text: e.text ?? '',
    })),
  )
}
</script>

<template>
  <div class="space-y-4">
    <el-card shadow="never">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="text-base font-semibold">解析结果</div>
          <div class="mt-1 text-sm text-zinc-600">DocId：{{ docId }}</div>
        </div>
        <div class="flex items-center gap-2">
          <el-button @click="router.push(`${base}/doc/task/${docId}`)">返回任务</el-button>
          <el-button type="primary" @click="goGraph">查看图谱</el-button>
          <el-button v-if="data" @click="downloadResult">下载</el-button>
        </div>
      </div>
    </el-card>

    <el-card shadow="never">
      <AppState v-if="loading" state="loading" />
      <AppState v-else-if="error" state="error" :description="error">
        <el-button @click="router.push(`${base}/doc/task/${docId}`)">返回任务</el-button>
      </AppState>
      <AppEmpty v-else-if="!data" description="暂无数据" />
      <div v-else class="space-y-4">
        <div v-if="data.status === 'FAILED' && data.errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ data.errorMessage }}
        </div>
        <el-tabs>
          <el-tab-pane label="结构化字段">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="状态">{{ data.status }}</el-descriptions-item>
            </el-descriptions>

            <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
              <el-card shadow="never" class="lg:col-span-1">
                <div class="text-sm font-semibold text-zinc-700">技能</div>
                <div class="mt-3 flex flex-wrap gap-2">
                  <el-tag v-for="s in skills" :key="s" type="success">{{ s }}</el-tag>
                  <div v-if="skills.length === 0" class="text-sm text-zinc-600">暂无</div>
                </div>
              </el-card>
              <el-card shadow="never" class="lg:col-span-2">
                <div class="text-sm font-semibold text-zinc-700">教育经历</div>
                <div class="mt-3 space-y-2">
                  <div v-for="(e, idx) in educations" :key="idx" class="rounded-lg border border-zinc-200 bg-white p-3">
                    <div class="text-sm text-zinc-800">{{ e.school || '未知学校' }}</div>
                    <div class="mt-1 text-xs text-zinc-500">{{ [e.degree, e.major].filter(Boolean).join(' / ') }}</div>
                  </div>
                  <div v-if="educations.length === 0" class="text-sm text-zinc-600">暂无</div>
                </div>
              </el-card>
            </div>

            <el-card shadow="never" class="mt-4">
              <div class="text-sm font-semibold text-zinc-700">项目经历</div>
              <div class="mt-3 space-y-2">
                <div v-for="(p, idx) in projects" :key="idx" class="rounded-lg border border-zinc-200 bg-white p-3">
                  <div class="text-sm text-zinc-800">{{ p.name || '未命名项目' }}</div>
                  <div class="mt-1 text-sm text-zinc-600">{{ p.summary || '暂无描述' }}</div>
                </div>
                <div v-if="projects.length === 0" class="text-sm text-zinc-600">暂无</div>
              </div>
            </el-card>

            <div class="mt-4">
              <el-collapse>
                <el-collapse-item title="解析结果（JSON）" name="json">
                  <div class="mb-2 flex justify-end gap-2">
                    <el-button size="small" @click="copyResult">复制 JSON</el-button>
                    <el-button size="small" @click="downloadResult">下载结果</el-button>
                  </div>
                  <pre class="max-h-[420px] overflow-auto rounded-lg bg-zinc-950 p-4 text-xs text-zinc-100">{{
                    JSON.stringify(data.resultJson, null, 2)
                  }}</pre>
                </el-collapse-item>
                <el-collapse-item title="证据（如有）" name="evidence">
                  <div class="mb-2 flex justify-end">
                    <el-button size="small" @click="downloadEvidence">下载证据 CSV</el-button>
                  </div>
                  <el-table :data="data.evidences || []" size="small">
                    <el-table-column prop="field" label="字段" width="160" />
                    <el-table-column prop="page" label="页码" width="90" />
                    <el-table-column prop="text" label="片段" />
                  </el-table>
                </el-collapse-item>
              </el-collapse>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>
