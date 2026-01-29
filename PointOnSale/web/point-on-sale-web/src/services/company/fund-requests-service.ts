import apiClient from '@/services/api-client'

export interface FundRequestDto {
    id: number
    fromScopeNodeId: number
    fromScopeName: string
    toScopeNodeId: number
    toScopeName: string
    amount: number
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    notes: string
    rejectionReason?: string
    requestedAt: string
    processedAt?: string
}

export interface CreateFundRequestDto {
    toScopeNodeId: number
    amount: number
    notes?: string
}

export interface RejectFundRequestDto {
    reason: string
}

interface ApiResponse<T> {
    data: T
    message?: string
    success?: boolean
}

const unwrapResponse = <T>(response: { data: T | ApiResponse<T> }) => {
    const payload = response.data
    if (payload && typeof payload === 'object' && 'data' in payload) {
        return (payload as ApiResponse<T>).data
    }
    return payload as T
}

export const fundRequestsService = {
    getMyRequests: async (isIncoming: boolean = false) => {
        const response = await apiClient.get<ApiResponse<FundRequestDto[]> | FundRequestDto[]>(
            'fund-requests/my-requests',
            { params: { isIncoming } },
        )
        return unwrapResponse(response)
    },

    createRequest: async (payload: CreateFundRequestDto) => {
        const response = await apiClient.post<ApiResponse<number> | number>('fund-requests', payload)
        return unwrapResponse(response)
    },

    approveRequest: async (id: number) => {
        const response = await apiClient.post<ApiResponse<string> | string>(`fund-requests/${id}/approve`)
        return unwrapResponse(response)
    },

    rejectRequest: async (id: number, payload: RejectFundRequestDto) => {
        const response = await apiClient.post<ApiResponse<string> | string>(
            `fund-requests/${id}/reject`,
            payload,
        )
        return unwrapResponse(response)
    },
}
