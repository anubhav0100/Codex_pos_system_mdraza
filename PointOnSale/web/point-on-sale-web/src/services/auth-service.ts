import apiClient from './api-client'
import type { UserProfile } from '@/store/use-auth-store'

export interface LoginResponse {
  accessToken: string
  userProfile: UserProfile
}

export interface LoginFormValues {
  email: string
  password: string
}

interface ApiResponse<T> {
  data: T
  message?: string
  success?: boolean
}

const unwrapResponse = <T,>(response: { data: T | ApiResponse<T> }) => {
  const payload = response.data
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<T>).data
  }
  return payload as T
}

export const authService = {
  login: async (credentials: LoginFormValues): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse> | LoginResponse>('auth/login', credentials)
    return unwrapResponse(response)
  },
}
