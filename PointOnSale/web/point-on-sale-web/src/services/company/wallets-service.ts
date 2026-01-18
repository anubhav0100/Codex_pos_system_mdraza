import apiClient from '@/services/api-client'

export interface WalletSummary {
  walletId: string
  walletType: 'FUND' | 'INCOME' | 'INCENTIVE'
  balance: number
  currency: string
  updatedAt?: string
}

export interface WalletLedgerEntry {
  id: string
  walletId: string
  entryType: 'CREDIT' | 'DEBIT' | 'TRANSFER'
  amount: number
  balance: number
  reference?: string
  createdAt: string
}

export interface WalletTransferDto {
  fromWalletId: string
  toWalletId: string
  amount: number
  note?: string
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

export const walletsService = {
  getWalletsMine: async () => {
    const response = await apiClient.get<ApiResponse<WalletSummary[]> | WalletSummary[]>('/wallets/mine')
    return unwrapResponse(response)
  },
  getWalletLedger: async (walletId: string) => {
    const response = await apiClient.get<ApiResponse<WalletLedgerEntry[]> | WalletLedgerEntry[]>(
      '/wallets/ledger',
      {
        params: {
          walletId,
        },
      },
    )
    return unwrapResponse(response)
  },
  transferWallets: async (payload: WalletTransferDto) => {
    const response = await apiClient.post<ApiResponse<string> | string>('/wallets/transfer', payload)
    return unwrapResponse(response)
  },
}
