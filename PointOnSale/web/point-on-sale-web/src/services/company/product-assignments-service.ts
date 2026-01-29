import apiClient from '@/services/api-client'

interface ApiResponse<T> {
  data: T
  message?: string
  success?: boolean
}

export interface ScopeProductAssignment {
  id: number
  productId: number
  sku: string
  name: string
  defaultSalePrice: number
  priceOverride?: number | null
  isAllowed: boolean
  effectivePrice?: number | null
}

export interface AssignProductPayload {
  scopeNodeId: number
  productId: number
  isAllowed: boolean
  priceOverride?: number | null
}

export interface BulkAssignProductPayload {
  scopeNodeId: number
  productIds: number[]
  isAllowed: boolean
  priceOverride?: number | null
}

export interface UpdateAssignmentPayload {
  isAllowed: boolean
  priceOverride?: number | null
}

const unwrapResponse = <T,>(response: { data: T | ApiResponse<T> }) => {
  const payload = response.data
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<T>).data
  }
  return payload as T
}

export const productAssignmentsService = {
  assignProduct: async (payload: AssignProductPayload) => {
    const response = await apiClient.post<ApiResponse<string> | string>('product-assignments/assign', payload)
    return unwrapResponse(response)
  },
  assignProducts: async (payload: BulkAssignProductPayload) => {
    const response = await apiClient.post<ApiResponse<string> | string>('product-assignments/assign-bulk', payload)
    return unwrapResponse(response)
  },
  getScopeProducts: async (scopeNodeId: number) => {
    const response = await apiClient.get<ApiResponse<ScopeProductAssignment[]> | ScopeProductAssignment[]>(
      `/scopes/${scopeNodeId}/products`,
    )
    return unwrapResponse(response)
  },
  updateAssignment: async (id: number, payload: UpdateAssignmentPayload) => {
    const response = await apiClient.put<ApiResponse<string> | string>(`product-assignments/${id}`, payload)
    return unwrapResponse(response)
  },
  deleteAssignment: async (id: number) => {
    const response = await apiClient.delete<ApiResponse<string> | string>(`product-assignments/${id}`)
    return unwrapResponse(response)
  },
}

