import { http } from '@/api/http'
import { mockGraph } from '@/api/mock'
import { isMockEnabled } from '@/api/env'
import type { GraphData } from '@/types/graph'

export async function getPersonGraph(personId: string): Promise<GraphData> {
  if (isMockEnabled()) return mockGraph.personGraph(personId)
  return http.get(`/graph/person/${encodeURIComponent(personId)}`)
}

export async function getJobGraph(jobId: string): Promise<GraphData> {
  if (isMockEnabled()) return mockGraph.jobGraph(jobId)
  return http.get(`/graph/job/${encodeURIComponent(jobId)}`)
}
