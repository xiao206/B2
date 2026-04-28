import type { RouteRecordRaw } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import LoginPage from '@/pages/auth/LoginPage.vue'
import RegisterPage from '@/pages/auth/RegisterPage.vue'
import PersonDashboardPage from '@/pages/person/PersonDashboardPage.vue'
import CompanyDashboardPage from '@/pages/company/CompanyDashboardPage.vue'
import DocumentUploadPage from '@/pages/document/DocumentUploadPage.vue'
import ParseTaskPage from '@/pages/document/ParseTaskPage.vue'
import ParseResultPage from '@/pages/document/ParseResultPage.vue'
import GraphPage from '@/pages/graph/GraphPage.vue'
import MatchListPage from '@/pages/match/MatchListPage.vue'
import MatchDetailPage from '@/pages/match/MatchDetailPage.vue'
import AdminHomePage from '@/pages/admin/AdminHomePage.vue'
import AdminUsersPage from '@/pages/admin/AdminUsersPage.vue'
import AdminMonitorPage from '@/pages/admin/AdminMonitorPage.vue'
import AdminAuditPage from '@/pages/admin/AdminAuditPage.vue'
import ForbiddenPage from '@/pages/system/ForbiddenPage.vue'
import NotFoundPage from '@/pages/system/NotFoundPage.vue'

export type UserType = 'PERSON' | 'COMPANY' | 'ADMIN'

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    userTypes?: UserType[]
    title?: string
  }
}

export const routes: RouteRecordRaw[] = [
  {
    path: '/auth',
    component: AuthLayout,
    meta: { public: true },
    children: [
      { path: 'login', name: 'Login', component: LoginPage, meta: { public: true, title: '登录' } },
      { path: 'register', name: 'Register', component: RegisterPage, meta: { public: true, title: '注册' } },
    ],
  },
  {
    path: '/',
    redirect: '/auth/login',
  },
  {
    path: '/person',
    component: MainLayout,
    meta: { userTypes: ['PERSON'], title: '个人端' },
    children: [
      { path: 'dashboard', name: 'PersonDashboard', component: PersonDashboardPage, meta: { userTypes: ['PERSON'], title: '工作台' } },
      { path: 'doc/upload', name: 'PersonDocUpload', component: DocumentUploadPage, meta: { userTypes: ['PERSON'], title: '简历上传' } },
      { path: 'doc/task/:docId', name: 'PersonParseTask', component: ParseTaskPage, meta: { userTypes: ['PERSON'], title: '解析任务' } },
      { path: 'doc/result/:docId', name: 'PersonParseResult', component: ParseResultPage, meta: { userTypes: ['PERSON'], title: '解析结果' } },
      { path: 'graph/:subjectId', name: 'PersonGraph', component: GraphPage, meta: { userTypes: ['PERSON'], title: '能力图谱' } },
      { path: 'match/jobs', name: 'PersonMatchList', component: MatchListPage, meta: { userTypes: ['PERSON'], title: '职位推荐' } },
      { path: 'match/detail/:recordId', name: 'PersonMatchDetail', component: MatchDetailPage, meta: { userTypes: ['PERSON'], title: '匹配详情' } },
    ],
  },
  {
    path: '/company',
    component: MainLayout,
    meta: { userTypes: ['COMPANY'], title: '企业端' },
    children: [
      { path: 'dashboard', name: 'CompanyDashboard', component: CompanyDashboardPage, meta: { userTypes: ['COMPANY'], title: '工作台' } },
      { path: 'doc/upload', name: 'CompanyDocUpload', component: DocumentUploadPage, meta: { userTypes: ['COMPANY'], title: 'JD 上传' } },
      { path: 'doc/task/:docId', name: 'CompanyParseTask', component: ParseTaskPage, meta: { userTypes: ['COMPANY'], title: '解析任务' } },
      { path: 'doc/result/:docId', name: 'CompanyParseResult', component: ParseResultPage, meta: { userTypes: ['COMPANY'], title: '解析结果' } },
      { path: 'graph/:subjectId', name: 'CompanyGraph', component: GraphPage, meta: { userTypes: ['COMPANY'], title: '能力图谱' } },
      { path: 'match/candidates', name: 'CompanyMatchList', component: MatchListPage, meta: { userTypes: ['COMPANY'], title: '候选人推荐' } },
      { path: 'match/detail/:recordId', name: 'CompanyMatchDetail', component: MatchDetailPage, meta: { userTypes: ['COMPANY'], title: '匹配详情' } },
    ],
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { userTypes: ['ADMIN'], title: '管理端' },
    children: [
      { path: '', name: 'AdminHome', component: AdminHomePage, meta: { userTypes: ['ADMIN'], title: '概览' } },
      { path: 'users', name: 'AdminUsers', component: AdminUsersPage, meta: { userTypes: ['ADMIN'], title: '用户管理' } },
      { path: 'monitor', name: 'AdminMonitor', component: AdminMonitorPage, meta: { userTypes: ['ADMIN'], title: '运营监控' } },
      { path: 'audit', name: 'AdminAudit', component: AdminAuditPage, meta: { userTypes: ['ADMIN'], title: '日志审计' } },
    ],
  },
  { path: '/403', name: 'Forbidden', component: ForbiddenPage, meta: { public: true, title: '无权限' } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundPage, meta: { public: true, title: '页面不存在' } },
]

