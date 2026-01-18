import apiClient from '@/services/api-client'

export interface ScopeStockSummary {
  totalItems?: number
  totalValue?: number
  lowStockItems?: number
}

export interface ScopeNode {
  id: number
  name: string
  scopeType: number | string
  isActive: boolean
  parentId?: number | null
  stateId?: number | null
  districtId?: number | null
  localId?: number | null
  usersCount?: number
  stockSummary?: ScopeStockSummary
  children?: ScopeNode[]
}

export interface CreateScopeDto {
  name: string
  parentScopeId: number
}

export interface UpdateScopeDto {
  name: string
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

export const scopesService = {
  getTree: async () => {
    const response = await apiClient.get<ApiResponse<ScopeNode[]> | ScopeNode[]>(
      'company/scopes/tree',
    )
    return unwrapResponse(response)
  },
  createState: async (data: CreateScopeDto) => {
    const response = await apiClient.post<ApiResponse<string> | string>('company/scopes/state', data)
    return unwrapResponse(response)
  },
  createDistrict: async (data: CreateScopeDto) => {
    const response = await apiClient.post<ApiResponse<string> | string>(
      'company/scopes/district',
      data,
    )
    return unwrapResponse(response)
  },
  createLocal: async (data: CreateScopeDto) => {
    const response = await apiClient.post<ApiResponse<string> | string>('company/scopes/local', data)
    return unwrapResponse(response)
  },
  updateScope: async (id: number, data: UpdateScopeDto) => {
    const response = await apiClient.put<ApiResponse<string> | string>(`/company/scopes/${id}`, data)
    return unwrapResponse(response)
  },
  activateScope: async (id: number) => {
    const response = await apiClient.patch<ApiResponse<string> | string>(
      `/company/scopes/${id}/activate`,
    )
    return unwrapResponse(response)
  },
  deactivateScope: async (id: number) => {
    const response = await apiClient.patch<ApiResponse<string> | string>(
      `/company/scopes/${id}/deactivate`,
    )
    return unwrapResponse(response)
  },
  deleteScope: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<string> | string>(`/company/scopes/${id}`)
    return unwrapResponse(response)
  },
}

