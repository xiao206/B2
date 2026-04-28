import { http } from '@/api/http'
import { mockMatch } from '@/api/mock'
import type { MatchDetailVO, MatchListItem } from '@/types/match'

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

export async function recommendJobs(): Promise<MatchListItem[]> {
  if (useMock) return mockMatch.recommendJobs()
  return http.post('/match/recommend-jobs', {})
}

export async function recommendCandidates(): Promise<MatchListItem[]> {
  if (useMock) return mockMatch.recommendCandidates()
  return http.post('/match/recommend-candidates', {})
}

export async function getMatchDetail(recordId: string): Promise<MatchDetailVO> {
  if (useMock) return mockMatch.detail(recordId)
  return http.get(`/match/${encodeURIComponent(recordId)}/detail`)
}

