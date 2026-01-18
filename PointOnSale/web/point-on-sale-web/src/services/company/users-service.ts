import apiClient from '@/services/api-client'

export interface UserSummary {
  id: number
  fullName: string
  email: string
  phone?: string
  isActive: boolean
  scopeNodeId: number
  createdAt?: string
  roles: string[]
}

export interface CreateUserDto {
  fullName: string
  email: string
  phone?: string
  scopeNodeId: number
  roleIds: number[]
}

export interface UpdateUserDto {
  fullName: string
  phone?: string
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

export const usersService = {
  getUsers: async (scopeNodeId: number) => {
    const response = await apiClient.get<ApiResponse<UserSummary[]> | UserSummary[]>('users', {
      params: { scopeNodeId },
    })
    return unwrapResponse(response)
  },
  createUser: async (data: CreateUserDto) => {
    const response = await apiClient.post<ApiResponse<{ userId?: number; temporaryPassword?: string }> | any>(
      'users',
      data,
    )
    return unwrapResponse(response)
  },
  updateUser: async (userId: number, data: UpdateUserDto) => {
    const response = await apiClient.put<ApiResponse<string> | string>(`/users/${userId}`, data)
    return unwrapResponse(response)
  },
  activateUser: async (userId: number) => {
    const response = await apiClient.patch<ApiResponse<string> | string>(`/users/${userId}/activate`)
    return unwrapResponse(response)
  },
  deactivateUser: async (userId: number) => {
    const response = await apiClient.patch<ApiResponse<string> | string>(`/users/${userId}/deactivate`)
    return unwrapResponse(response)
  },
  assignRoles: async (userId: number, roleIds: number[]) => {
    const response = await apiClient.post<ApiResponse<string> | string>(`/users/${userId}/roles`, {
      roleIds,
    })
    return unwrapResponse(response)
  },
}

