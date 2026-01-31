import apiClient from '@/services/api-client'

export type StockRequestStatus = 'DRAFT' | 'SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED'

export interface StockRequestItem {
  productId: string
  quantity: number
}

export interface StockRequestSummary {
  id: string
  partyName: string
  status: StockRequestStatus
  items: StockRequestItem[]
  requestedAt: string
  createdByUserName?: string
}

export interface CreateStockRequestDto {
  supplierScopeType: 'company' | 'state' | 'district'
  supplierScopeNodeId?: string
  supplierName?: string
  notes?: string
  items: StockRequestItem[]
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

export const stockRequestsService = {
  getStockRequests: async ({ scope, status }: { scope: 'mine' | 'inbox'; status?: string }) => {
    const response = await apiClient.get<ApiResponse<StockRequestSummary[]> | StockRequestSummary[]>(
      '/stock-requests',
      {
        params: {
          scope,
          status: status || undefined,
        },
      },
    )
    const requests = unwrapResponse(response) as any

    if (!Array.isArray(requests)) {
      return []
    }

    // Transform backend DTO to frontend format
    // Backend returns FromScopeName and ToScopeName. 
    // We handle both PascalCase and camelCase just to be safe.
    return requests.map((r: any) => {
      const fromName = r.fromScopeName || r.FromScopeName || 'Unknown'
      const toName = r.toScopeName || r.ToScopeName || 'Unknown'

      return {
        id: r.id || r.Id,
        partyName: scope === 'mine' ? toName : fromName,
        status: (r.status || r.Status || '').toString(),
        items: r.items || r.Items || [],
        requestedAt: r.requestedAt || r.RequestedAt,
        createdByUserName: r.createdByUserName || r.CreatedByUserName
      }
    }) as StockRequestSummary[]
  },
  createStockRequest: async (payload: CreateStockRequestDto) => {
    // Transform frontend payload to backend DTO
    const apiPayload = {
      FromScopeNodeId: 0, // Backend will default this to user's scope
      ToScopeNodeId: Number(payload.supplierScopeNodeId),
      Items: payload.items.map((item) => ({
        ProductId: Number(item.productId),
        Qty: Number(item.quantity),
      })),
      // Backend DTO in StockRequestDtos.cs doesn't verify Notes yet in CreateStockRequestDto, 
      // but adding it won't hurt if we added it to DTO later. 
      // For now, only Items, FromScopeNodeId, ToScopeNodeId are in the DTO.
    }
    const response = await apiClient.post<ApiResponse<string> | string>('stock-requests', apiPayload)
    return unwrapResponse(response)
  },
  approveStockRequest: async (requestId: string) => {
    const response = await apiClient.post<ApiResponse<string> | string>(
      `/stock-requests/${requestId}/approve`,
    )
    return unwrapResponse(response)
  },
  rejectStockRequest: async (requestId: string) => {
    const response = await apiClient.post<ApiResponse<string> | string>(
      `/stock-requests/${requestId}/reject`,
    )
    return unwrapResponse(response)
  },
  fulfillStockRequest: async (requestId: string) => {
    const response = await apiClient.post<ApiResponse<string> | string>(
      `/stock-requests/${requestId}/fulfill`,
    )
    return unwrapResponse(response)
  },
  submitStockRequest: async (requestId: string) => {
    const response = await apiClient.post<ApiResponse<string> | string>(
      `/stock-requests/${requestId}/submit`,
    )
    return unwrapResponse(response)
  },
}

