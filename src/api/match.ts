import { http } from '@/api/http'
import { mockMatch } from '@/api/mock'
import { isMockEnabled } from '@/api/env'
import type { MatchDetailVO, MatchListItem } from '@/types/match'

export async function recommendJobs(): Promise<MatchListItem[]> {
  if (isMockEnabled()) return mockMatch.recommendJobs()
  return http.post('/match/recommend-jobs', {})
}

export async function recommendCandidates(): Promise<MatchListItem[]> {
  if (isMockEnabled()) return mockMatch.recommendCandidates()
  return http.post('/match/recommend-candidates', {})
}

export async function getMatchDetail(recordId: string): Promise<MatchDetailVO> {
  if (isMockEnabled()) return mockMatch.detail(recordId)
  return http.get(`/match/${encodeURIComponent(recordId)}/detail`)
}
