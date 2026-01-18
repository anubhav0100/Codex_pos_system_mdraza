import apiClient from '../api-client'

export interface Company {
    id: string
    name: string
    gstin?: string
    status: 'ACTIVE' | 'INACTIVE'
    createdAt: string
    updatedAt: string
}

export interface CreateCompanyDto {
    name: string
    gstin?: string
    status: 'ACTIVE' | 'INACTIVE'
}

export type UpdateCompanyDto = Partial<CreateCompanyDto>

export interface CompanyQueryParams {
    page?: number
    pageSize?: number
    search?: string
    status?: string
}

export interface PaginatedResponse<T> {
    items: T[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}

export const companyService = {
    getCompanies: async (params: CompanyQueryParams) => {
        const response = await apiClient.get<PaginatedResponse<Company>>('super/companies', { params })
        return response.data
    },

    getCompany: async (id: string) => {
        const response = await apiClient.get<Company>(`/super/companies/${id}`)
        return response.data
    },

    createCompany: async (data: CreateCompanyDto) => {
        const response = await apiClient.post<Company>('super/companies', data)
        return response.data
    },

    updateCompany: async (id: string, data: UpdateCompanyDto) => {
        const response = await apiClient.put<Company>(`/super/companies/${id}`, data)
        return response.data
    },

    deleteCompany: async (id: string) => {
        await apiClient.delete(`/super/companies/${id}`)
    },

    toggleStatus: async (id: string, isActive: boolean) => {
        await apiClient.patch(`/super/companies/${id}/status`, { isActive })
    },
}


