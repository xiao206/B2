import { http } from '@/api/http'
import { mockGraph } from '@/api/mock'
import type { GraphData } from '@/types/graph'

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

export async function getPersonGraph(personId: string): Promise<GraphData> {
  if (useMock) return mockGraph.personGraph(personId)
  return http.get(`/graph/person/${encodeURIComponent(personId)}`)
}

export async function getJobGraph(jobId: string): Promise<GraphData> {
  if (useMock) return mockGraph.jobGraph(jobId)
  return http.get(`/graph/job/${encodeURIComponent(jobId)}`)
}

