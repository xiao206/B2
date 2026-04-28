<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import RadarChart from '@/components/RadarChart.vue'
import { getMatchDetail } from '@/api/match'
import type { MatchDetailVO } from '@/types/match'

const route = useRoute()
const router = useRouter()

const recordId = computed(() => String(route.params.recordId || ''))
const isCompany = computed(() => route.path.startsWith('/company'))
const base = computed(() => (isCompany.value ? '/company' : '/person'))

const loading = ref(true)
const detail = ref<MatchDetailVO | null>(null)

const indicators = computed(() => {
  const obj = detail.value?.scoreBreakdown ?? {}
  return Object.keys(obj).map((k) => ({ name: k, max: 50 }))
})

const values = computed(() => {
  const obj = detail.value?.scoreBreakdown ?? {}
  return Object.keys(obj).map((k) => obj[k] ?? 0)
})

const load = async () => {
  loading.value = true
  try {
    detail.value = await getMatchDetail(recordId.value)
  } catch (e: any) {
    ElMessage.error(e?.message || '加载详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="space-y-4">
    <el-card shadow="never">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div class="text-base font-semibold">匹配详情</div>
          <div class="mt-1 text-sm text-zinc-600">RecordId：{{ recordId }}</div>
        </div>
        <div class="flex items-center gap-2">
          <el-button @click="router.push(`${base}/match/${isCompany ? 'candidates' : 'jobs'}`)">返回列表</el-button>
          <el-button :loading="loading" @click="load">刷新</el-button>
        </div>
      </div>
    </el-card>

    <el-card shadow="never">
      <div v-if="loading" class="text-sm text-zinc-600">加载中...</div>
      <div v-else-if="!detail" class="text-sm text-zinc-600">暂无数据</div>
      <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div class="lg:col-span-1 space-y-4">
          <div class="rounded-xl border border-zinc-200 bg-white p-4">
            <div class="text-sm font-semibold text-zinc-700">总分</div>
            <div class="mt-2 text-3xl font-semibold text-zinc-900">{{ detail.score }}</div>
            <div class="mt-2">
              <el-progress :percentage="detail.score" :stroke-width="10" />
            </div>
          </div>

          <div class="rounded-xl border border-zinc-200 bg-white p-4">
            <div class="text-sm font-semibold text-zinc-700">缺失技能</div>
            <div class="mt-3 space-y-2">
              <div v-for="s in detail.missingSkills" :key="s.name" class="flex items-center justify-between">
                <div class="text-sm text-zinc-800">{{ s.name }}</div>
                <el-tag type="danger">差距 {{ s.gap }}</el-tag>
              </div>
              <div v-if="detail.missingSkills.length === 0" class="text-sm text-zinc-600">暂无</div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 space-y-4">
          <RadarChart title="分项拆解（示例）" :indicators="indicators" :values="values" />

          <el-card shadow="never">
            <div class="text-sm font-semibold text-zinc-700">技能覆盖</div>
            <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div class="rounded-lg border border-zinc-200 bg-white p-3">
                <div class="text-xs text-zinc-500">已满足</div>
                <div class="mt-2 flex flex-wrap gap-2">
                  <el-tag v-for="s in detail.matchedSkills" :key="s.name" type="success">
                    {{ s.name }}
                  </el-tag>
                  <div v-if="detail.matchedSkills.length === 0" class="text-sm text-zinc-600">暂无</div>
                </div>
              </div>
              <div class="rounded-lg border border-zinc-200 bg-white p-3">
                <div class="text-xs text-zinc-500">建议</div>
                <ul class="mt-2 space-y-1 text-sm text-zinc-700">
                  <li v-for="(s, idx) in detail.suggestions || []" :key="idx">{{ s }}</li>
                  <li v-if="(detail.suggestions || []).length === 0" class="text-zinc-600">暂无</li>
                </ul>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>
  </div>
</template>

