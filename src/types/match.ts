export interface MatchListItem {
  recordId: string
  title: string
  org: string
  score: number
}

export interface MatchDetailVO {
  recordId: string
  score: number
  scoreBreakdown: Record<string, number>
  matchedSkills: Array<{ name: string; requiredLevel: number; personLevel: number }>
  missingSkills: Array<{ name: string; requiredLevel: number; gap: number }>
  suggestions?: string[]
}

