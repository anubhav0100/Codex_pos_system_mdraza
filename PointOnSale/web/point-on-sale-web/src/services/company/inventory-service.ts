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
    const response = await apiClient.get<ApiResponse<any[]> | any[]>(
      'inventory/balance',
      {
        params: {
          scopeNodeId: scopeNodeId || undefined,
        },
      },
    )
    const rawData = unwrapResponse(response)
    // Transform API response (camelCase/backend properties) to UI properties
    return rawData.map((item: any) => ({
      scopeNodeId: item.scopeNodeId,
      productId: item.productId,
      productName: item.productName,
      sku: item.productSKU,        // Map productSKU -> sku
      onHand: item.qtyOnHand,      // Map qtyOnHand -> onHand
      reserved: 0,                 // Default to 0 as backend doesn't support it yet
      available: item.qtyOnHand,   // Available = OnHand - Reserved (0)
    })) as InventoryBalanceItem[]
  },
  getLedger: async ({ scopeNodeId, productId }: { scopeNodeId?: string; productId: string }) => {
    const response = await apiClient.get<ApiResponse<any[]> | any[]>(
      'inventory/ledger',
      {
        params: {
          scopeNodeId: scopeNodeId || undefined,
          productId,
        },
      },
    )
    const rawData = unwrapResponse(response)
    // Transform API response (camelCase/backend properties) to UI properties
    return rawData.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      movementType: item.txnType,         // Map txnType -> movementType
      quantity: item.qtyChange,           // Map qtyChange -> quantity
      balance: 0,                         // Backend doesn't provide running balance yet
      reference: `${item.refType} #${item.refId}`, // Construct reference
      scopeNodeId: item.scopeNodeId,
      createdAt: item.createdAt,
    })) as InventoryLedgerEntry[]
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

