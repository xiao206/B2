<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { uploadDocument } from '@/api/document'
import type { DocType } from '@/types/document'

const route = useRoute()
const router = useRouter()

const isCompany = computed(() => route.path.startsWith('/company'))
const docType = computed<DocType>(() => (isCompany.value ? 'JOB_DESC' : 'RESUME'))
const title = computed(() => (isCompany.value ? 'JD 上传' : '简历上传'))

const file = ref<File | null>(null)
const authorized = ref(false)
const loading = ref(false)

const beforeUpload = (raw: File) => {
  const okType = /\.(pdf|doc|docx)$/i.test(raw.name)
  const okSize = raw.size <= 50 * 1024 * 1024
  if (!okType) ElMessage.warning('仅支持 PDF/DOC/DOCX')
  if (!okSize) ElMessage.warning('文件大小需 ≤ 50MB')
  if (!okType || !okSize) return false
  file.value = raw
  return false
}

const submit = async () => {
  if (!authorized.value) return ElMessage.warning('请先勾选授权确认')
  if (!file.value) return ElMessage.warning('请先选择文件')

  loading.value = true
  try {
    const { docId } = await uploadDocument({ file: file.value, docType: docType.value })
    ElMessage.success('上传成功，已进入解析任务')
    const base = isCompany.value ? '/company' : '/person'
    await router.push(`${base}/doc/task/${encodeURIComponent(docId)}`)
  } catch (e: any) {
    ElMessage.error(e?.message || '上传失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <el-card shadow="never">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="text-base font-semibold">{{ title }}</div>
          <div class="mt-1 text-sm text-zinc-600">
            支持 PDF/DOC/DOCX，最大 50MB。上传后会自动进入解析进度跟踪。
          </div>
        </div>
      </div>
    </el-card>

    <el-card shadow="never">
      <div class="space-y-4">
        <el-alert type="info" show-icon :closable="false">
          <template #title>合规提示</template>
          <template #default>
            请确认已获得文档主体授权，不上传非法采集的个人隐私数据。未勾选授权将无法提交。
          </template>
        </el-alert>

        <el-checkbox v-model="authorized">
          本人/本单位已获得该文档相关主体授权，并同意隐私条款与数据使用说明
        </el-checkbox>

        <el-upload drag :auto-upload="false" :show-file-list="true" :before-upload="beforeUpload">
          <div class="py-8">
            <div class="text-sm font-semibold text-zinc-900">拖拽文件到此处，或点击选择</div>
            <div class="mt-1 text-xs text-zinc-500">推荐开启 mock：VITE_USE_MOCK=true</div>
          </div>
        </el-upload>

        <div class="flex justify-end">
          <el-button type="primary" :loading="loading" @click="submit">提交并解析</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

