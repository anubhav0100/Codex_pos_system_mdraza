import apiClient from '@/services/api-client'

export interface InventoryBalanceItem {
  productId: string
  sku: string
  productName: string
  scopeNodeId?: string
  unit?: string
  onHand: number
  reserved: number
  available: number
}

export interface InventoryLedgerEntry {
  id: string
  productId: string
  movementType: 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'SALE' | 'RETURN'
  quantity: number
  balance: number
  reference?: string
  scopeNodeId?: string
  createdAt: string
}

export interface InventoryAdjustPayload {
  productId: string
  scopeNodeId?: string
  adjustmentType: 'INCREASE' | 'DECREASE'
  quantity: number
  reason?: string
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

export const inventoryService = {
  getBalance: async (scopeNodeId?: string) => {
    const response = await apiClient.get<ApiResponse<InventoryBalanceItem[]> | InventoryBalanceItem[]>(
      'inventory/balance',
      {
        params: {
          scopeNodeId: scopeNodeId || undefined,
        },
      },
    )
    return unwrapResponse(response)
  },
  getLedger: async ({ scopeNodeId, productId }: { scopeNodeId?: string; productId: string }) => {
    const response = await apiClient.get<ApiResponse<InventoryLedgerEntry[]> | InventoryLedgerEntry[]>(
      'inventory/ledger',
      {
        params: {
          scopeNodeId: scopeNodeId || undefined,
          productId,
        },
      },
    )
    return unwrapResponse(response)
  },
  adjustInventory: async (payload: InventoryAdjustPayload) => {
    const apiPayload = {
      scopeNodeId: Number(payload.scopeNodeId),
      productId: Number(payload.productId),
      qtyChange: payload.adjustmentType === 'DECREASE' ? -payload.quantity : payload.quantity,
      notes: payload.reason || 'Manual Adjustment',
    }
    const response = await apiClient.post<ApiResponse<string> | string>('inventory/adjust', apiPayload)
    return unwrapResponse(response)
  },
}

