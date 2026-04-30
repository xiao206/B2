export const AUDIT_MODULES = {
  DOCUMENT_UPLOAD: 'document.upload',
  DOCUMENT_PARSE: 'document.parse',
  MATCH_RECOMMEND: 'match.recommend',
  MATCH_DETAIL_OPEN: 'match.detail.open',
  MATCH_FAVORITE_TOGGLE: 'match.favorite.toggle',
  MATCH_FEEDBACK: 'match.feedback',
  MATCH_FEEDBACK_CLEAR: 'match.feedback.clear',
} as const

export type AuditModule = (typeof AUDIT_MODULES)[keyof typeof AUDIT_MODULES]

