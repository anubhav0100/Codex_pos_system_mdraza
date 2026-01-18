import apiClient from '@/services/api-client'

export interface Role {
  id: number
  code: string
  name: string
  description?: string
  scopeType: number
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

export const rolesService = {
  getRoles: async (scopeType?: number) => {
    const response = await apiClient.get<ApiResponse<Role[]> | Role[]>('roles', {
      params: scopeType !== undefined ? { scopeType } : undefined,
    })
    return unwrapResponse(response)
  },
}

