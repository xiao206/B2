export const STORAGE_KEYS = {
  AUTH: 'aimap.auth',
  DOCS: 'aimap.docs',
  MATCH: 'aimap.match',
  AUDIT: 'aimap.audit',
  ADMIN_USERS: 'aimap.admin.users',
  ADMIN_DATA: 'aimap.admin.data',
  MOCK_DOC_TASKS: 'aimap.mock.docTasks',
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

