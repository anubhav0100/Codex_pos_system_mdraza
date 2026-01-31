import apiClient from '@/services/api-client'

export interface CreateSaleItemDto {
  productId: number
  qty: number
}

export interface CreateSaleDto {
  scopeNodeId: number
  items: CreateSaleItemDto[]
}

export const PaymentMethod = {
  Cash: 0,
  Card: 1,
  UPI: 2,
  Online: 3
} as const

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod]

export interface ConfirmPaymentDto {
  paymentMethod: PaymentMethod
  paymentRef?: string
}

export interface SalesOrderItemDto {
  productId: number
  productName: string
  qty: number
  unitPrice: number
  taxPercent: number
  lineTotal: number
}

export interface SalesOrderDto {
  id: number
  status: string
  scopeNodeId: number
  total: number
  taxTotal: number
  grandTotal: number
  paymentMethod: string
  paymentRef: string
  createdAt: string
  items: SalesOrderItemDto[]
}

export const posService = {
  createSale: async (data: CreateSaleDto): Promise<SalesOrderDto> => {
    const response = await apiClient.post<SalesOrderDto>('pos/sales', data)
    return response.data
  },
  getSale: async (id: number): Promise<SalesOrderDto> => {
    const response = await apiClient.get<SalesOrderDto>(`pos/sales/${id}`)
    return response.data
  },
  getSales: async (scopeNodeId: number, dateFrom?: string, dateTo?: string): Promise<SalesOrderDto[]> => {
    const params = { scopeNodeId, dateFrom, dateTo }
    const response = await apiClient.get<SalesOrderDto[]>('pos/sales', { params })
    return response.data
  },
  confirmPayment: async (id: number, data: ConfirmPaymentDto): Promise<SalesOrderDto> => {
    const response = await apiClient.post<SalesOrderDto>(`pos/sales/${id}/confirm-payment`, data)
    return response.data
  }
}
