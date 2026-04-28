<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { recommendCandidates, recommendJobs } from '@/api/match'
import type { MatchListItem } from '@/types/match'

const route = useRoute()
const router = useRouter()

const isCompany = computed(() => route.path.startsWith('/company'))
const title = computed(() => (isCompany.value ? '候选人推荐' : '职位推荐'))
const list = ref<MatchListItem[]>([])
const loading = ref(true)

const load = async () => {
  loading.value = true
  try {
    list.value = isCompany.value ? await recommendCandidates() : await recommendJobs()
  } catch (e: any) {
    ElMessage.error(e?.message || '加载推荐失败')
  } finally {
    loading.value = false
  }
}

onMounted(load)

const openDetail = (recordId: string) => {
  const base = isCompany.value ? '/company' : '/person'
  router.push(`${base}/match/detail/${encodeURIComponent(recordId)}`)
}
</script>

<template>
  <div class="space-y-4">
    <el-card shadow="never">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="text-base font-semibold">{{ title }}</div>
          <div class="mt-1 text-sm text-zinc-600">Top-N 推荐列表（演示数据），点击进入可解释详情。</div>
        </div>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </div>
    </el-card>

    <el-card shadow="never">
      <el-table :data="list" v-loading="loading">
        <el-table-column prop="title" label="名称" min-width="240" />
        <el-table-column prop="org" label="组织/备注" min-width="180" />
        <el-table-column prop="score" label="匹配度" width="120">
          <template #default="{ row }">
            <el-tag type="success">{{ row.score }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetail(row.recordId)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

