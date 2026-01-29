import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ClipboardList, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, DataTableCell, DataTableRow } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { PermissionGate } from '@/components/auth/permission-gate'
import { stockRequestsService, type CreateStockRequestDto, type StockRequestStatus } from '@/services/company/stock-requests-service'
import { productsService } from '@/services/company/products-service'
import { scopesService, type ScopeNode } from '@/services/company/scopes-service'

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

const flattenScopes = (nodes: ScopeNode[]): ScopeNode[] =>
  nodes.flatMap((node) => [node, ...(node.children ? flattenScopes(node.children) : [])])

const scopeTypeMap: Record<string, number> = {
  company: 1,
  state: 2,
  district: 3,
}

export default function StockRequestsOutgoingPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<StockRequestStatus | 'ALL'>('ALL')
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [requestForm, setRequestForm] = useState({
    supplierScopeType: 'company',
    supplierScopeNodeId: '',
    supplierName: '',
    productId: '',
    quantity: '',
    notes: '',
  })

  const { data: tree = [] } = useQuery({
    queryKey: ['scopes-tree'],
    queryFn: scopesService.getTree,
  })

  // Flatten scopes for easy filtering
  const allScopes = useMemo(() => flattenScopes(tree), [tree])

  // Filter scopes based on selected type
  const availableSupplierScopes = useMemo(() => {
    const targetType = scopeTypeMap[requestForm.supplierScopeType]
    if (!targetType) return []
    // Ensure loose comparison or string conversion match as scopeType might be string/number
    return allScopes.filter(scope => Number(scope.scopeType) === targetType)
  }, [allScopes, requestForm.supplierScopeType])

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['stock-requests', 'outgoing', statusFilter],
    queryFn: () =>
      stockRequestsService.getStockRequests({
        scope: 'mine',
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      }),
  })

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productsService.getProducts,
  })

  const createMutation = useMutation({
    mutationFn: (payload: CreateStockRequestDto) => stockRequestsService.createStockRequest(payload),
    onSuccess: () => {
      toast.success('Stock request created')
      queryClient.invalidateQueries({ queryKey: ['stock-requests'] })
      setWizardOpen(false)
      setWizardStep(1)
    },
    onError: () => toast.error('Failed to create stock request'),
  })

  const handleSubmit = () => {
    if (!requestForm.productId || !requestForm.quantity) {
      toast.error('Please provide product and quantity details')
      return
    }

    createMutation.mutate({
      supplierScopeType: requestForm.supplierScopeType as CreateStockRequestDto['supplierScopeType'],
      supplierScopeNodeId: requestForm.supplierScopeNodeId || undefined,
      supplierName: requestForm.supplierName || undefined,
      notes: requestForm.notes || undefined,
      items: [
        {
          productId: requestForm.productId,
          quantity: Number(requestForm.quantity),
        },
      ],
    })
  }

  const tableContent = useMemo(() => {
    if (isLoading) {
      return (
        <DataTable>
          <tbody>
            <DataTableRow>
              <DataTableCell colSpan={6} className='text-center py-8 text-foreground'>
                Loading requests...
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
          title='No outgoing requests'
          description='Create a new stock request for your suppliers.'
        />
      )
    }

    return (
      <DataTable>
        <thead>
          <DataTableRow>
            <DataTableCell isHeader>Request</DataTableCell>
            <DataTableCell isHeader>Supplier</DataTableCell>
            <DataTableCell isHeader>Status</DataTableCell>
            <DataTableCell isHeader>Items</DataTableCell>
            <DataTableCell isHeader>Requested At</DataTableCell>
          </DataTableRow>
        </thead>
        <tbody>
          {requests.map((request) => (
            <DataTableRow key={request.id}>
              <DataTableCell className='font-medium text-foreground'>#{request.id}</DataTableCell>
              <DataTableCell className='text-foreground'>
                {request.supplierName} ({request.supplierScopeType})
              </DataTableCell>
              <DataTableCell>
                <Badge className={
                  request.status === 'PENDING' ? 'bg-rainbow-orange text-white' :
                    request.status === 'APPROVED' ? 'bg-rainbow-green text-white' :
                      request.status === 'REJECTED' ? 'bg-destructive text-white' :
                        request.status === 'FULFILLED' ? 'bg-rainbow-cyan text-white' :
                          'bg-secondary'
                }>
                  {request.status}
                </Badge>
              </DataTableCell>
              <DataTableCell className='text-foreground'>{request.items.length} items</DataTableCell>
              <DataTableCell className='text-foreground'>{formatDate(request.requestedAt)}</DataTableCell>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
    )
  }, [isLoading, requests])

  return (
    <div className='space-y-6'>
      <PageHeader
        title={<span className="gradient-text">Outgoing Stock Requests</span>}
        description='Manage requests sent to suppliers.'
        actions={
          <div className='flex flex-wrap items-center gap-2'>
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
            <PermissionGate perm='STOCK_REQUESTS_CREATE'>
              <Button onClick={() => setWizardOpen(true)} className='gap-2'>
                <Plus className='h-4 w-4' />
                New Request
              </Button>
            </PermissionGate>
          </div>
        }
      />

      {tableContent}

      <Dialog
        open={wizardOpen}
        onOpenChange={(open) => {
          setWizardOpen(open)
          if (!open) {
            setWizardStep(1)
          }
        }}
      >
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Stock Request Wizard</DialogTitle>
            <DialogDescription>Step {wizardStep} of 2</DialogDescription>
          </DialogHeader>
          {wizardStep === 1 ? (
            <div className='grid gap-4'>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Supplier Scope</label>
                <select
                  className={selectClassName}
                  value={requestForm.supplierScopeType}
                  onChange={(event) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      supplierScopeType: event.target.value,
                      supplierScopeNodeId: '', // Reset node on type change
                    }))
                  }
                >
                  <option value='company'>Company</option>
                  <option value='state'>State</option>
                  <option value='district'>District</option>
                </select>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Supplier Scope Node</label>
                <select
                  className={selectClassName}
                  value={requestForm.supplierScopeNodeId}
                  onChange={(event) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      supplierScopeNodeId: event.target.value,
                    }))
                  }
                >
                  <option value=''>Select {requestForm.supplierScopeType}</option>
                  {availableSupplierScopes.length === 0 ? (
                    <option value='' disabled>No scopes found</option>
                  ) : (
                    availableSupplierScopes.map((scope) => (
                      <option key={scope.id} value={scope.id}>
                        {scope.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Supplier Name</label>
                <Input
                  placeholder='Optional supplier name'
                  value={requestForm.supplierName}
                  onChange={(event) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      supplierName: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          ) : (
            <div className='grid gap-4'>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Product</label>
                <select
                  className={selectClassName}
                  value={requestForm.productId}
                  onChange={(event) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      productId: event.target.value,
                    }))
                  }
                >
                  <option value=''>Select Product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Quantity</label>
                <Input
                  type='number'
                  min={1}
                  placeholder='0'
                  value={requestForm.quantity}
                  onChange={(event) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      quantity: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label className='text-sm font-medium text-muted-foreground'>Notes</label>
                <Input
                  placeholder='Optional notes for the supplier'
                  value={requestForm.notes}
                  onChange={(event) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      notes: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter className='gap-2 sm:gap-0'>
            {wizardStep === 1 ? (
              <Button variant='outline' onClick={() => setWizardOpen(false)}>
                Cancel
              </Button>
            ) : (
              <Button variant='outline' onClick={() => setWizardStep(1)}>
                Back
              </Button>
            )}
            {wizardStep === 1 ? (
              <Button onClick={() => setWizardStep(2)}>Next</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                Submit Request
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
