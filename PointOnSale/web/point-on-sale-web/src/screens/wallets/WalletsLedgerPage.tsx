import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ClipboardList, Wallet } from 'lucide-react'

import { PageHeader } from '@/components/ui/page-header'
import { DataTable, DataTableCell, DataTableRow } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { walletsService } from '@/services/company/wallets-service'

const selectClassName =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

const walletLabels: Record<string, string> = {
  FUND: 'Fund Wallet',
  INCOME: 'Income Wallet',
  INCENTIVE: 'Incentive Wallet',
}

export default function WalletsLedgerPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedWalletId, setSelectedWalletId] = useState(searchParams.get('walletId') || '')

  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets-mine'],
    queryFn: () => walletsService.getWalletsMine(),
  })

  useEffect(() => {
    if (!selectedWalletId && wallets.length > 0) {
      const initialWallet = String(wallets[0].id)
      setSelectedWalletId(initialWallet)
      setSearchParams({ walletId: initialWallet }, { replace: true })
    }
  }, [selectedWalletId, setSearchParams, wallets])

  const { data: ledger = [], isLoading } = useQuery({
    queryKey: ['wallets-ledger', selectedWalletId],
    queryFn: () => walletsService.getWalletLedger(selectedWalletId),
    enabled: Boolean(selectedWalletId),
  })

  const tableContent = useMemo(() => {
    if (isLoading) {
      return (
        <DataTable>
          <tbody>
            <DataTableRow>
              <DataTableCell colSpan={6} className='text-center py-8 text-foreground'>
                Loading wallet ledger...
              </DataTableCell>
            </DataTableRow>
          </tbody>
        </DataTable>
      )
    }

    if (ledger.length === 0) {
      return (
        <EmptyState
          icon={<ClipboardList className='h-8 w-8 text-muted-foreground/60' />}
          title='No ledger entries'
          description='Wallet movements will appear here once available.'
        />
      )
    }

    return (
      <DataTable>
        <thead>
          <DataTableRow>
            <DataTableCell isHeader>Date</DataTableCell>
            <DataTableCell isHeader>Type</DataTableCell>
            <DataTableCell isHeader>Amount</DataTableCell>
            <DataTableCell isHeader>Reference</DataTableCell>
            <DataTableCell isHeader>Notes</DataTableCell>
          </DataTableRow>
        </thead>
        <tbody>
          {ledger.map((entry) => {
            const isDebit = entry.fromWalletId === Number(selectedWalletId)
            const typeLabel = isDebit ? 'DEBIT' : 'CREDIT'

            return (
              <DataTableRow key={entry.id}>
                <DataTableCell className='text-foreground'>{formatDate(entry.createdAt)}</DataTableCell>
                <DataTableCell>
                  <Badge variant={isDebit ? 'secondary' : 'default'}>
                    {typeLabel}
                  </Badge>
                </DataTableCell>
                <DataTableCell className='text-foreground'>{formatCurrency(entry.amount)}</DataTableCell>
                <DataTableCell className='text-foreground'>{entry.refType} #{entry.refId}</DataTableCell>
                <DataTableCell className='text-foreground'>{entry.notes || '-'}</DataTableCell>
              </DataTableRow>
            )
          })}
        </tbody>
      </DataTable>
    )
  }, [isLoading, ledger])

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Wallet Ledger'
        description='Review wallet debits, credits, and transfers.'
        onBack={() => navigate('/wallets')}
        actions={
          <div className='flex items-center gap-2'>
            <Wallet className='h-4 w-4 text-muted-foreground' />
            <select
              className={selectClassName}
              value={selectedWalletId}
              onChange={(event) => {
                const value = event.target.value
                setSelectedWalletId(value)
                setSearchParams({ walletId: value }, { replace: true })
              }}
            >
              {wallets.map((wallet) => (
                <option key={wallet.id} value={wallet.id}>
                  {walletLabels[wallet.walletType] ?? wallet.walletType}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {tableContent}
    </div>
  )
}
