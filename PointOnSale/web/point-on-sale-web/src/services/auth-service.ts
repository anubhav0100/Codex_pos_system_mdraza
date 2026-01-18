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

export const authService = {
  login: async (credentials: LoginFormValues): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('auth/login', credentials)
    return response.data
  },
}
