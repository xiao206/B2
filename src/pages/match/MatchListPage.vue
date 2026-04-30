<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { recommendCandidates, recommendJobs } from '@/api/match'
import type { MatchListItem } from '@/types/match'
import { useMatchStore } from '@/stores/match'
import { useAuthStore } from '@/stores/auth'
import { useAuditLogger } from '@/composables/useAuditLogger'
import { AUDIT_MODULES } from '@/constants/auditModules'
import { formatDateTime } from '@/utils/date'
import AppEmpty from '@/components/AppEmpty.vue'

const route = useRoute()
const router = useRouter()
const matchStore = useMatchStore()
const auth = useAuthStore()
const audit = useAuditLogger()

const isCompany = computed(() => route.path.startsWith('/company'))
const title = computed(() => (isCompany.value ? '候选人推荐' : '职位推荐'))
const list = ref<MatchListItem[]>([])
const loading = ref(true)
const tab = ref<'recommend' | 'favorite' | 'history'>('recommend')

const userKey = computed(() => `${auth.userType ?? 'ANON'}:${auth.userId || 'anon'}`)
const favoriteSet = computed(() => matchStore.favoriteSet(userKey.value))
const historyList = computed(() => matchStore.historyByUser(userKey.value).filter((h) => (isCompany.value ? h.side === 'COMPANY' : h.side === 'PERSON')))

const favoriteList = computed(() => {
  const ids = favoriteSet.value
  const byId = new Map(list.value.map((x) => [x.recordId, x]))
  const stored = matchStore.historyByUser(userKey.value).filter((h) => ids.has(h.recordId))
  const merged = new Map<string, MatchListItem>()
  for (const x of stored) merged.set(x.recordId, x)
  for (const id of ids) {
    const r = byId.get(id)
    if (r) merged.set(id, r)
  }
  return Array.from(merged.values())
})

const load = async () => {
  loading.value = true
  try {
    list.value = isCompany.value ? await recommendCandidates() : await recommendJobs()
    audit.logOk(AUDIT_MODULES.MATCH_RECOMMEND, { side: isCompany.value ? 'COMPANY' : 'PERSON', count: list.value.length })
  } catch (e: any) {
    audit.logFail(AUDIT_MODULES.MATCH_RECOMMEND, { side: isCompany.value ? 'COMPANY' : 'PERSON', message: e?.message || '加载推荐失败' })
    ElMessage.error(e?.message || '加载推荐失败')
  } finally {
    loading.value = false
  }
}

onMounted(load)
onMounted(() => {
  matchStore.hydrate()
})

const openDetail = (row: MatchListItem) => {
  const base = isCompany.value ? '/company' : '/person'
  matchStore.addHistory(row, isCompany.value ? 'COMPANY' : 'PERSON')
  audit.logOk(AUDIT_MODULES.MATCH_DETAIL_OPEN, { side: isCompany.value ? 'COMPANY' : 'PERSON', recordId: row.recordId })
  router.push(`${base}/match/detail/${encodeURIComponent(row.recordId)}`)
}

const toggleFav = (recordId: string) => {
  matchStore.toggleFavorite(recordId)
  audit.logOk(AUDIT_MODULES.MATCH_FAVORITE_TOGGLE, { recordId })
}
</script>

<template>
  <div class="space-y-4">
    <el-card shadow="never">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="text-base font-semibold">{{ title }}</div>
          <div class="mt-1 text-sm text-zinc-600">支持收藏、历史与反馈记录（本地持久化）。</div>
        </div>
        <el-button :loading="loading" @click="load">刷新</el-button>
      </div>
    </el-card>

    <el-card shadow="never">
      <el-tabs v-model="tab">
        <el-tab-pane label="推荐" name="recommend" />
        <el-tab-pane label="收藏" name="favorite" />
        <el-tab-pane label="历史" name="history" />
      </el-tabs>

      <AppEmpty v-if="tab === 'recommend' && !loading && list.length === 0" description="暂无推荐数据。">
        <el-button type="primary" @click="load">刷新</el-button>
      </AppEmpty>
      <el-table
        v-if="tab === 'recommend'"
        :data="list"
        v-loading="loading"
      >
        <el-table-column prop="title" label="名称" min-width="240" />
        <el-table-column prop="org" label="组织/备注" min-width="180" />
        <el-table-column prop="score" label="匹配度" width="120">
          <template #default="{ row }">
            <el-tag type="success">{{ row.score }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetail(row)">查看</el-button>
            <el-button link :type="favoriteSet.has(row.recordId) ? 'warning' : 'info'" @click="toggleFav(row.recordId)">
              {{ favoriteSet.has(row.recordId) ? '已收藏' : '收藏' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <AppEmpty v-else-if="tab === 'favorite' && favoriteList.length === 0" description="暂无收藏。">
        <el-button @click="tab = 'recommend'">去推荐列表</el-button>
      </AppEmpty>
      <el-table
        v-else-if="tab === 'favorite'"
        :data="favoriteList"
      >
        <el-table-column prop="title" label="名称" min-width="240" />
        <el-table-column prop="org" label="组织/备注" min-width="180" />
        <el-table-column prop="score" label="匹配度" width="120">
          <template #default="{ row }">
            <el-tag type="success">{{ row.score }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetail(row)">查看</el-button>
            <el-button link type="danger" @click="toggleFav(row.recordId)">取消收藏</el-button>
          </template>
        </el-table-column>
      </el-table>

      <AppEmpty v-else-if="tab === 'history' && historyList.length === 0" description="暂无历史记录。" />
      <el-table
        v-else
        :data="historyList"
      >
        <el-table-column prop="title" label="名称" min-width="240" />
        <el-table-column prop="org" label="组织/备注" min-width="180" />
        <el-table-column prop="score" label="匹配度" width="120">
          <template #default="{ row }">
            <el-tag type="success">{{ row.score }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="viewedAt" label="最近查看" width="200">
          <template #default="{ row }">
            <span class="text-xs text-zinc-600">{{ formatDateTime(row.viewedAt) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDetail(row)">查看</el-button>
            <el-button link :type="favoriteSet.has(row.recordId) ? 'warning' : 'info'" @click="toggleFav(row.recordId)">
              {{ favoriteSet.has(row.recordId) ? '已收藏' : '收藏' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
