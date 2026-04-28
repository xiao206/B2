export interface MatchListItem {
  recordId: string
  title: string
  org: string
  score: number
}

export interface MatchEvidence {
  type: 'TEXT' | 'GRAPH' | 'VECTOR'
  field: string
  snippet?: string
  weight?: number
}

export interface MatchFeedback {
  id: string
  recordId: string
  userKey: string
  rating: 1 | 2 | 3 | 4 | 5
  tags: string[]
  comment: string
  createdAt: string
}

export interface MatchHistoryItem extends MatchListItem {
  userKey: string
  viewedAt: string
  side: 'PERSON' | 'COMPANY'
}

export interface MatchDetailVO {
  recordId: string
  score: number
  scoreBreakdown: Record<string, number>
  matchedSkills: Array<{ name: string; requiredLevel: number; personLevel: number }>
  missingSkills: Array<{ name: string; requiredLevel: number; gap: number }>
  suggestions?: string[]
  evidences?: MatchEvidence[]
  rationales?: string[]
}
