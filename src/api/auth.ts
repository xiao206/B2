import { http } from '@/api/http'
import { mockAuth } from '@/api/mock'
import { isMockEnabled } from '@/api/env'
import type { UserType } from '@/stores/auth'

export interface LoginResp {
  token: string
  userType: UserType
  userId: string
  permissions?: string[]
}

export async function login(payload: { account: string; password: string; userType: UserType }): Promise<LoginResp> {
  if (isMockEnabled()) return mockAuth.login(payload)
  return http.post('/auth/login', payload)
}
