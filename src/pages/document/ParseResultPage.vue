<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getParseResult } from '@/api/document'
import type { ParseResultVO } from '@/types/document'

const route = useRoute()
const router = useRouter()

const docId = computed(() => String(route.params.docId || ''))
const isCompany = computed(() => route.path.startsWith('/company'))
const base = computed(() => (isCompany.value ? '/company' : '/person'))

const loading = ref(true)
const data = ref<ParseResultVO | null>(null)

onMounted(async () => {
  loading.value = true
  try {
    data.value = await getParseResult(docId.value)
  } catch (e: any) {
    ElMessage.error(e?.message || '获取解析结果失败')
  } finally {
    loading.value = false
  }
})

const goGraph = () => {
  const subjectId = isCompany.value ? 'job-001' : 'person-001'
  router.push(`${base.value}/graph/${subjectId}`)
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
        </div>
      </div>
    </el-card>

    <el-card shadow="never">
      <div v-if="loading" class="text-sm text-zinc-600">加载中...</div>
      <div v-else-if="!data" class="text-sm text-zinc-600">暂无数据</div>
      <div v-else class="space-y-4">
        <el-tabs>
          <el-tab-pane label="结构化字段">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="状态">{{ data.status }}</el-descriptions-item>
              <el-descriptions-item label="摘要">
                <span class="text-sm text-zinc-700">演示数据，可替换为后端真实解析字段。</span>
              </el-descriptions-item>
            </el-descriptions>

            <div class="mt-4">
              <el-collapse>
                <el-collapse-item title="解析结果（JSON）" name="json">
                  <pre class="max-h-[420px] overflow-auto rounded-lg bg-zinc-950 p-4 text-xs text-zinc-100">{{
                    JSON.stringify(data.resultJson, null, 2)
                  }}</pre>
                </el-collapse-item>
                <el-collapse-item title="证据（如有）" name="evidence">
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

