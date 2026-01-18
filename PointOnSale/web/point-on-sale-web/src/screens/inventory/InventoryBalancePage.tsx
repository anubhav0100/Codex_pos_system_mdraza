import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Filter, RefreshCcw } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, DataTableCell, DataTableRow } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { PermissionGate } from '@/components/auth/permission-gate'
import { inventoryService, type InventoryAdjustPayload } from '@/services/company/inventory-service'

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value)

interface InventoryBalancePageProps {
  initialAdjustOpen?: boolean
  returnTo?: string
}

const selectClassName =
  'h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export default function InventoryBalancePage({ initialAdjustOpen, returnTo }: InventoryBalancePageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [scopeDraft, setScopeDraft] = useState('')
  const [scopeFilter, setScopeFilter] = useState('')
  const [adjustOpen, setAdjustOpen] = useState(Boolean(initialAdjustOpen))
  const [adjustForm, setAdjustForm] = useState({
    productId: '',
    scopeNodeId: '',
    adjustmentType: 'INCREASE',
    quantity: '',
    reason: '',
  })

  useEffect(() => {
    if (initialAdjustOpen) {
      setAdjustOpen(true)
    }
  }, [initialAdjustOpen])

  useEffect(() => {
    setAdjustForm((prev) => ({
      ...prev,
      scopeNodeId: scopeFilter,
    }))
  }, [scopeFilter])

  const { data: balances = [], isLoading } = useQuery({
    queryKey: ['inventory-balance', scopeFilter],
    queryFn: () => inventoryService.getBalance(scopeFilter || undefined),
  })

  const adjustMutation = useMutation({
    mutationFn: (payload: InventoryAdjustPayload) => inventoryService.adjustInventory(payload),
    onSuccess: () => {
      toast.success('Inventory adjustment submitted')
      queryClient.invalidateQueries({ queryKey: ['inventory-balance'] })
      handleDialogOpenChange(false)
    },
    onError: () => toast.error('Failed to submit adjustment'),
  })

  const handleApplyScope = () => {
    setScopeFilter(scopeDraft.trim())
  }

  const handleAdjustSubmit = () => {
    if (!adjustForm.productId || !adjustForm.quantity) {
      toast.error('Please provide product ID and quantity')
      return
    }
    adjustMutation.mutate({
      productId: adjustForm.productId,
      scopeNodeId: adjustForm.scopeNodeId || undefined,
      adjustmentType: adjustForm.adjustmentType as InventoryAdjustPayload['adjustmentType'],
      quantity: Number(adjustForm.quantity),
      reason: adjustForm.reason || undefined,
    })
  }

  const handleDialogOpenChange = (open: boolean) => {
    setAdjustOpen(open)
    if (!open && returnTo) {
      navigate(returnTo, { replace: true })
    }
  }

  const tableContent = useMemo(() => {
    if (isLoading) {
      return (
        <DataTable>
          <tbody>
            <DataTableRow>
              <DataTableCell colSpan={7} className='text-center py-8 text-foreground'>
                Loading inventory balance...
              </DataTableCell>
            </DataTableRow>
          </tbody>
        </DataTable>
      )
    }

    if (balances.length === 0) {
      return (
        <EmptyState
          icon={<ClipboardList className='h-8 w-8 text-muted-foreground/60' />}
          title='No inventory records'
          description='Select a scope to see inventory availability.'
        />
      )
    }

    return (
      <DataTable>
        <thead>
          <DataTableRow>
            <DataTableCell isHeader>SKU</DataTableCell>
            <DataTableCell isHeader>Product</DataTableCell>
            <DataTableCell isHeader>On Hand</DataTableCell>
            <DataTableCell isHeader>Reserved</DataTableCell>
            <DataTableCell isHeader>Available</DataTableCell>
            <DataTableCell isHeader>Status</DataTableCell>
            <DataTableCell isHeader className='text-right'>Actions</DataTableCell>
          </DataTableRow>
        </thead>
        <tbody>
          {balances.map((item) => (
            <DataTableRow key={item.productId}>
              <DataTableCell className='font-medium text-foreground'>{item.sku}</DataTableCell>
              <DataTableCell className='text-foreground'>{item.productName}</DataTableCell>
              <DataTableCell className='text-foreground'>{formatNumber(item.onHand)}</DataTableCell>
              <DataTableCell className='text-foreground'>{formatNumber(item.reserved)}</DataTableCell>
              <DataTableCell className='text-foreground'>{formatNumber(item.available)}</DataTableCell>
              <DataTableCell>
                <Badge variant={item.available > 0 ? 'default' : 'secondary'}>
                  {item.available > 0 ? 'AVAILABLE' : 'OUT'}
                </Badge>
              </DataTableCell>
              <DataTableCell className='text-right'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    const query = scopeFilter ? `?scopeNodeId=${scopeFilter}` : ''
                    navigate(`/inventory/ledger/${item.productId}${query}`)
                  }}
                >
                  View Ledger
                </Button>
              </DataTableCell>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
    )
  }, [balances, isLoading, navigate, scopeFilter])

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Inventory Balance'
        description='Track on-hand inventory across your scope.'
        actions={
          <div className='flex flex-wrap items-center gap-2'>
            <div className='flex items-center gap-2'>
              <Input
                placeholder='Scope node ID'
                value={scopeDraft}
                onChange={(event) => setScopeDraft(event.target.value)}
                className='w-44'
              />
              <Button variant='outline' onClick={handleApplyScope} className='gap-2'>
                <Filter className='h-4 w-4' />
                Apply
              </Button>
            </div>
            <Button
              variant='outline'
              onClick={() => queryClient.invalidateQueries({ queryKey: ['inventory-balance'] })}
              className='gap-2'
            >
              <RefreshCcw className='h-4 w-4' />
              Refresh
            </Button>
            <PermissionGate perm='INVENTORY_ADJUST'>
              <Button onClick={() => navigate('/inventory/adjust')}>Adjust Inventory</Button>
            </PermissionGate>
          </div>
        }
      />

      {tableContent}

      <Dialog open={adjustOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Adjust Inventory</DialogTitle>
            <DialogDescription>Submit an inventory adjustment for the selected scope.</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4'>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>Scope Node</label>
              <Input
                placeholder='Scope node ID'
                value={adjustForm.scopeNodeId}
                onChange={(event) =>
                  setAdjustForm((prev) => ({
                    ...prev,
                    scopeNodeId: event.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>Product ID</label>
              <Input
                placeholder='Product ID'
                value={adjustForm.productId}
                onChange={(event) =>
                  setAdjustForm((prev) => ({
                    ...prev,
                    productId: event.target.value,
                  }))
                }
              />
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Adjustment Type</label>
                <select
                  className={selectClassName}
                  value={adjustForm.adjustmentType}
                  onChange={(event) =>
                    setAdjustForm((prev) => ({
                      ...prev,
                      adjustmentType: event.target.value,
                    }))
                  }
                >
                  <option value='INCREASE'>Increase</option>
                  <option value='DECREASE'>Decrease</option>
                </select>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Quantity</label>
                <Input
                  type='number'
                  min={1}
                  placeholder='0'
                  value={adjustForm.quantity}
                  onChange={(event) =>
                    setAdjustForm((prev) => ({
                      ...prev,
                      quantity: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>Reason</label>
              <Input
                placeholder='Reason for adjustment'
                value={adjustForm.reason}
                onChange={(event) =>
                  setAdjustForm((prev) => ({
                    ...prev,
                    reason: event.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button variant='outline' onClick={() => handleDialogOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdjustSubmit} disabled={adjustMutation.isPending}>
              Submit Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
