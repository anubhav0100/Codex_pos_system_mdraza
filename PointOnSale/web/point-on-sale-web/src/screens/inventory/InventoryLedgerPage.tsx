import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'

import { PageHeader } from '@/components/ui/page-header'
import { DataTable, DataTableCell, DataTableRow } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { inventoryService } from '@/services/company/inventory-service'

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

export default function InventoryLedgerPage() {
  const navigate = useNavigate()
  const { productId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const scopeNodeId = searchParams.get('scopeNodeId') || undefined

  const { data: ledger = [], isLoading } = useQuery({
    queryKey: ['inventory-ledger', productId, scopeNodeId],
    queryFn: () => inventoryService.getLedger({ scopeNodeId, productId }),
    enabled: Boolean(productId),
  })

  const tableContent = useMemo(() => {
    if (isLoading) {
      return (
        <DataTable>
          <tbody>
            <DataTableRow>
              <DataTableCell colSpan={6} className='text-center py-8 text-foreground'>
                Loading ledger entries...
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
          description='No movements recorded for this product yet.'
        />
      )
    }

    return (
      <DataTable>
        <thead>
          <DataTableRow>
            <DataTableCell isHeader>Date</DataTableCell>
            <DataTableCell isHeader>Movement</DataTableCell>
            <DataTableCell isHeader>Quantity</DataTableCell>
            <DataTableCell isHeader>Balance</DataTableCell>
            <DataTableCell isHeader>Reference</DataTableCell>
          </DataTableRow>
        </thead>
        <tbody>
          {ledger.map((entry) => (
            <DataTableRow key={entry.id}>
              <DataTableCell className='text-foreground'>{formatDate(entry.createdAt)}</DataTableCell>
              <DataTableCell>
                <Badge variant='secondary'>{entry.movementType.replace('_', ' ')}</Badge>
              </DataTableCell>
              <DataTableCell className='text-foreground'>{formatNumber(entry.quantity)}</DataTableCell>
              <DataTableCell className='text-foreground'>{formatNumber(entry.balance)}</DataTableCell>
              <DataTableCell className='text-foreground'>{entry.reference || '-'}</DataTableCell>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
    )
  }, [isLoading, ledger])

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Inventory Ledger'
        description={`Product ID: ${productId || '-'}`}
        onBack={() => navigate('/inventory/balance')}
      />

      {tableContent}
    </div>
  )
}
