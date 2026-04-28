import type { UserType } from '@/stores/auth'
import type { DocStatus, DocType, DocFileVO, ParseResultVO } from '@/types/document'
import type { GraphData } from '@/types/graph'
import type { MatchDetailVO, MatchListItem } from '@/types/match'

const genId = (prefix: string) => `${prefix}-${Math.random().toString(16).slice(2, 10)}`

type DocTask = {
  doc: DocFileVO
  startedAt: number
  result: ParseResultVO
}

const docs = new Map<string, DocTask>()

export const mockAuth = {
  async login(payload: { account: string; password: string; userType: UserType }) {
    const permissions =
      payload.userType === 'ADMIN'
        ? ['ADMIN_USERS_VIEW', 'ADMIN_MONITOR_VIEW', 'ADMIN_AUDIT_VIEW']
        : []
    return {
      token: `mock-token-${payload.userType.toLowerCase()}`,
      userType: payload.userType,
      userId: payload.account || 'demo',
      permissions,
    }
  },
}

export const mockDocument = {
  async upload(payload: { fileName: string; fileType: 'DOC' | 'PDF'; docType: DocType }) {
    const id = genId('doc')
    const now = Date.now()
    const doc: DocFileVO = {
      id,
      fileName: payload.fileName,
      fileType: payload.fileType,
      docType: payload.docType,
      status: 'PENDING',
      createdAt: new Date(now).toISOString(),
    }
    const result: ParseResultVO = {
      docId: id,
      status: 'PENDING',
      resultJson: {
        skills: ['Java', 'Spring Boot', 'Vue 3', 'TypeScript', 'SQL'],
        education: [{ school: '某高校', degree: '本科', major: '计算机科学与技术' }],
        projects: [{ name: '能力图谱系统', summary: '解析简历并构建技能图谱，输出可解释匹配结果' }],
      },
      evidences: [{ field: 'skills', page: 1, text: '熟悉 Vue3/TS、Spring Boot、SQL...' }],
    }
    docs.set(id, { doc, startedAt: now, result })
    return { docId: id }
  },
  async status(docId: string) {
    const task = docs.get(docId)
    if (!task) {
      const err = new Error('任务不存在')
      ;(err as any).code = 'NOT_FOUND'
      throw err
    }
    const elapsed = Date.now() - task.startedAt
    const status: DocStatus =
      elapsed < 1500 ? 'PENDING' : elapsed < 4500 ? 'PROCESSING' : 'DONE'
    task.doc.status = status
    task.result.status = status
    return { id: task.doc.id, status }
  },
  async result(docId: string) {
    const task = docs.get(docId)
    if (!task) throw new Error('任务不存在')
    await mockDocument.status(docId)
    return task.result
  },
}

export const mockGraph = {
  async personGraph(personId: string): Promise<GraphData> {
    return {
      nodes: [
        { id: personId, label: '个人', type: 'Person' },
        { id: 'skill-vue', label: 'Vue 3', type: 'Skill' },
        { id: 'skill-ts', label: 'TypeScript', type: 'Skill' },
        { id: 'skill-spring', label: 'Spring Boot', type: 'Skill' },
        { id: 'proj-1', label: '图谱系统', type: 'Project' },
      ],
      edges: [
        { id: genId('e'), source: personId, target: 'skill-vue', type: 'HAS_SKILL' },
        { id: genId('e'), source: personId, target: 'skill-ts', type: 'HAS_SKILL' },
        { id: genId('e'), source: personId, target: 'skill-spring', type: 'HAS_SKILL' },
        { id: genId('e'), source: 'proj-1', target: 'skill-vue', type: 'APPLIED_IN' },
        { id: genId('e'), source: 'proj-1', target: 'skill-ts', type: 'APPLIED_IN' },
      ],
    }
  },
  async jobGraph(jobId: string): Promise<GraphData> {
    return {
      nodes: [
        { id: jobId, label: '岗位', type: 'Job' },
        { id: 'skill-vue', label: 'Vue 3', type: 'Skill' },
        { id: 'skill-ts', label: 'TypeScript', type: 'Skill' },
        { id: 'skill-g6', label: 'AntV G6', type: 'Skill' },
      ],
      edges: [
        { id: genId('e'), source: jobId, target: 'skill-vue', type: 'REQUIRES_SKILL' },
        { id: genId('e'), source: jobId, target: 'skill-ts', type: 'REQUIRES_SKILL' },
        { id: genId('e'), source: jobId, target: 'skill-g6', type: 'REQUIRES_SKILL' },
      ],
    }
  },
}

export const mockMatch = {
  async recommendJobs(): Promise<MatchListItem[]> {
    return [
      { recordId: genId('rec'), title: '前端开发（Vue3）', org: '某科技公司', score: 86 },
      { recordId: genId('rec'), title: '全栈开发（Java+Vue）', org: '某平台团队', score: 79 },
    ]
  },
  async recommendCandidates(): Promise<MatchListItem[]> {
    return [
      { recordId: genId('rec'), title: '候选人：张三', org: '3 年经验', score: 84 },
      { recordId: genId('rec'), title: '候选人：李四', org: '5 年经验', score: 77 },
    ]
  },
  async detail(recordId: string): Promise<MatchDetailVO> {
    return {
      recordId,
      score: 86,
      scoreBreakdown: {
        skillCoverage: 42,
        levelMatch: 20,
        vectorSim: 12,
        graphReasoning: 12,
      },
      matchedSkills: [
        { name: 'Vue 3', requiredLevel: 3, personLevel: 3 },
        { name: 'TypeScript', requiredLevel: 3, personLevel: 2 },
      ],
      missingSkills: [{ name: 'AntV G6', requiredLevel: 2, gap: 2 }],
      suggestions: ['补齐图谱可视化能力（G6 基础与交互），优先掌握布局与事件系统', '完善工程化规范：路由守卫、错误兜底与性能分包'],
    }
  },
}

