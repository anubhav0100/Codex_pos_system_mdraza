import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, CheckCircle2, XCircle, PackageCheck } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/utils/utils'

import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, DataTableCell, DataTableRow } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { PermissionGate } from '@/components/auth/permission-gate'
import { stockRequestsService, type StockRequestStatus } from '@/services/company/stock-requests-service'

const selectClassName =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

const statusOptions: { label: string; value: StockRequestStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Fulfilled', value: 'FULFILLED' },
]

export default function StockRequestsInboxPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<StockRequestStatus | 'ALL'>('ALL')

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['stock-requests', 'inbox', statusFilter],
    queryFn: () =>
      stockRequestsService.getStockRequests({
        scope: 'inbox',
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      }),
  })

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' | 'fulfill' }) => {
      if (action === 'approve') {
        return stockRequestsService.approveStockRequest(id)
      }
      if (action === 'reject') {
        return stockRequestsService.rejectStockRequest(id)
      }
      return stockRequestsService.fulfillStockRequest(id)
    },
    onSuccess: () => {
      toast.success('Request updated')
      queryClient.invalidateQueries({ queryKey: ['stock-requests'] })
    },
    onError: () => toast.error('Failed to update request'),
  })

  const tableContent = useMemo(() => {
    if (isLoading) {
      return (
        <DataTable>
          <tbody>
            <DataTableRow>
              <DataTableCell colSpan={7} className='text-center py-8 text-foreground'>
                Loading inbox requests...
              </DataTableCell>
            </DataTableRow>
          </tbody>
        </DataTable>
      )
    }

    if (requests.length === 0) {
      return (
        <EmptyState
          icon={<ClipboardList className='h-8 w-8 text-muted-foreground/60' />}
          title='No incoming requests'
          description='Supplier requests will appear here for review.'
        />
      )
    }

    return (
      <DataTable>
        <thead>
          <DataTableRow>
            <DataTableCell isHeader>Request</DataTableCell>
            <DataTableCell isHeader>Requester</DataTableCell>
            <DataTableCell isHeader>Status</DataTableCell>
            <DataTableCell isHeader>Items</DataTableCell>
            <DataTableCell isHeader>Requested At</DataTableCell>
            <DataTableCell isHeader className='text-right'>Actions</DataTableCell>
          </DataTableRow>
        </thead>
        <tbody>
          {requests.map((request) => (
            <DataTableRow key={request.id}>
              <DataTableCell className='font-medium text-foreground'>#{request.id}</DataTableCell>
              <DataTableCell className='text-foreground'>
                {request.partyName}
              </DataTableCell>
              <DataTableCell>
                <Badge className={cn(
                  'border-none font-bold text-[10px]',
                  request.status?.toUpperCase() === 'PENDING' ? 'bg-rainbow-orange/10 text-rainbow-orange' :
                    request.status?.toUpperCase() === 'APPROVED' ? 'bg-rainbow-green/10 text-rainbow-green' :
                      request.status?.toUpperCase() === 'REJECTED' ? 'bg-destructive/10 text-destructive' :
                        request.status?.toUpperCase() === 'FULFILLED' ? 'bg-rainbow-cyan/10 text-rainbow-cyan' :
                          'bg-secondary'
                )}>
                  {request.status}
                </Badge>
              </DataTableCell>
              <DataTableCell className='text-foreground'>
                <div className="group relative">
                  <span className="cursor-help border-b border-dotted border-muted-foreground/50">
                    {request.items.length} items
                  </span>
                  <div className="absolute left-0 bottom-full mb-2 hidden w-64 rounded-md border bg-popover p-2 text-sm text-popover-foreground shadow-md group-hover:block z-50">
                    <div className="space-y-1">
                      {request.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.productName || `Product ${item.productId}`}</span>
                          <span className="font-mono">x{item.qty || item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </DataTableCell>
              <DataTableCell className='text-foreground'>{formatDate(request.requestedAt)}</DataTableCell>
              <DataTableCell className='text-right space-x-2'>
                {(request.status?.toUpperCase() === 'SUBMITTED' || request.status?.toUpperCase() === 'PENDING') && (
                  <PermissionGate perm='STOCK_REQUESTS_APPROVE'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => actionMutation.mutate({ id: request.id, action: 'approve' })}
                      disabled={actionMutation.isPending}
                    >
                      <CheckCircle2 className='h-4 w-4' />
                      Approve
                    </Button>
                  </PermissionGate>
                )}
                {(request.status?.toUpperCase() === 'SUBMITTED' || request.status?.toUpperCase() === 'PENDING') && (
                  <PermissionGate perm='STOCK_REQUESTS_APPROVE'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => actionMutation.mutate({ id: request.id, action: 'reject' })}
                      disabled={actionMutation.isPending}
                    >
                      <XCircle className='h-4 w-4' />
                      Reject
                    </Button>
                  </PermissionGate>
                )}
                {request.status?.toUpperCase() === 'APPROVED' && (
                  <PermissionGate perm='STOCK_REQUESTS_FULFILL'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => actionMutation.mutate({ id: request.id, action: 'fulfill' })}
                      disabled={actionMutation.isPending}
                    >
                      <PackageCheck className='h-4 w-4' />
                      Fulfill
                    </Button>
                  </PermissionGate>
                )}
              </DataTableCell>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
    )
  }, [actionMutation, isLoading, requests])

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Inbox Requests'
        description='Review incoming stock requests and take action.'
        actions={
          <select
            className={selectClassName}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StockRequestStatus | 'ALL')}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        }
      />

      {tableContent}
    </div>
  )
}
