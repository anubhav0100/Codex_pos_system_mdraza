import apiClient from '../api-client'

export interface SubscriptionPlan {
    id: number
    name: string
    monthlyPrice: number
    limitsJson: string
    isActive: boolean
}

export interface CreateSubscriptionPlanDto {
    name: string
    monthlyPrice: number
    limitsJson: string
}

export interface UpdateSubscriptionPlanDto {
    name: string
    monthlyPrice: number
    limitsJson: string
    isActive: boolean
}

export interface AssignSubscriptionDto {
    planId: number
    startDate: string
    endDate: string
}

export const subscriptionPlanService = {
    getPlans: async () => {
        const response = await apiClient.get<SubscriptionPlan[]>('/super/subscription-plans')
        return response.data
    },

    createPlan: async (data: CreateSubscriptionPlanDto) => {
        const response = await apiClient.post<SubscriptionPlan>('/super/subscription-plans', data)
        return response.data
    },

    updatePlan: async (planId: number, data: UpdateSubscriptionPlanDto) => {
        const response = await apiClient.put<SubscriptionPlan>(`/super/subscription-plans/${planId}`, data)
        return response.data
    },

    deletePlan: async (planId: number) => {
        await apiClient.delete(`/super/subscription-plans/${planId}`)
    },

    assignPlanToCompany: async (companyId: string, data: AssignSubscriptionDto) => {
        const response = await apiClient.post(`/super/companies/${companyId}/subscription`, data)
        return response.data
    },
}
