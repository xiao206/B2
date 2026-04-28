import { http } from '@/api/http'
import { mockAuth } from '@/api/mock'
import type { UserType } from '@/stores/auth'

export interface LoginResp {
  token: string
  userType: UserType
  userId: string
  permissions?: string[]
}

const useMock = import.meta.env.VITE_USE_MOCK === 'true'

export async function login(payload: { account: string; password: string; userType: UserType }): Promise<LoginResp> {
  if (useMock) return mockAuth.login(payload)
  return http.post('/auth/login', payload)
}

