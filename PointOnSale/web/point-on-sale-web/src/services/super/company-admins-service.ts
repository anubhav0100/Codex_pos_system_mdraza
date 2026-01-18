import apiClient from '../api-client'

export interface CompanyAdmin {
    id: number
    fullName: string
    email: string
    phone: string
    isActive: boolean
    createdAt: string
    companyId: number
}

export interface CreateCompanyAdminDto {
    fullName: string
    email: string
    phone: string
}

export interface UpdateCompanyAdminDto {
    fullName: string
    phone: string
}

export interface CreateCompanyAdminResponse {
    userId: number
    temporaryPassword: string
}

export const companyAdminsService = {
    getCompanyAdmins: async (companyId: string) => {
        const response = await apiClient.get<CompanyAdmin[]>(`super/companies/${companyId}/admins`)
        return response.data
    },

    createCompanyAdmin: async (companyId: string, data: CreateCompanyAdminDto) => {
        const response = await apiClient.post<CreateCompanyAdminResponse>(
            `/super/companies/${companyId}/admins`,
            data,
        )
        return response.data
    },

    updateCompanyAdmin: async (userId: number, data: UpdateCompanyAdminDto) => {
        const response = await apiClient.put(`super/company-admins/${userId}`, data)
        return response.data
    },

    activateCompanyAdmin: async (userId: number) => {
        const response = await apiClient.patch(`super/company-admins/${userId}/activate`)
        return response.data
    },

    deactivateCompanyAdmin: async (userId: number) => {
        const response = await apiClient.patch(`super/company-admins/${userId}/deactivate`)
        return response.data
    },
}
