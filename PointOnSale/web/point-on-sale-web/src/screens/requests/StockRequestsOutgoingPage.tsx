import { useMemo, useState } from 'react'
import { cn } from '@/utils/utils'
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
import { StatCard } from '@/components/ui/stat-card'
import { Package, Clock, Truck, CheckCircle2 } from 'lucide-react'
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
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Submitted', value: 'SUBMITTED' },
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

  const submitMutation = useMutation({
    mutationFn: (id: string) => stockRequestsService.submitStockRequest(id),
    onSuccess: () => {
      toast.success('Stock request submitted successfully')
      queryClient.invalidateQueries({ queryKey: ['stock-requests'] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to submit request'),
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
            <DataTableCell isHeader className="text-right">Actions</DataTableCell>
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
                <Badge className={cn(
                  'border-none font-bold text-[10px]',
                  (request.status === 'DRAFT' || request.status === 'Draft') ? 'bg-muted text-muted-foreground' :
                    (request.status === 'SUBMITTED' || request.status === 'Submitted' || request.status === 'PENDING' || request.status === 'Pending') ? 'bg-rainbow-orange/10 text-rainbow-orange' :
                      (request.status === 'APPROVED' || request.status === 'Approved') ? 'bg-rainbow-green/10 text-rainbow-green' :
                        (request.status === 'REJECTED' || request.status === 'Rejected') ? 'bg-destructive/10 text-destructive' :
                          (request.status === 'FULFILLED' || request.status === 'Fulfilled') ? 'bg-rainbow-cyan/10 text-rainbow-cyan' :
                            'bg-secondary'
                )}>
                  {request.status}
                </Badge>
              </DataTableCell>
              <DataTableCell className='text-foreground'>{request.items.length} items</DataTableCell>
              <DataTableCell className='text-foreground'>{formatDate(request.requestedAt)}</DataTableCell>
              <DataTableCell className="text-right">
                {(request.status === 'DRAFT' || request.status === 'Draft') && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-[10px] font-black uppercase tracking-widest text-rainbow-blue hover:bg-rainbow-blue/5"
                    onClick={() => submitMutation.mutate(request.id)}
                    disabled={submitMutation.isPending}
                  >
                    Send Request
                  </Button>
                )}
              </DataTableCell>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
    )
  }, [isLoading, requests])

  return (
    <div className='space-y-6'>
      <PageHeader
        title={<span className="bg-gradient-to-r from-rainbow-cyan via-rainbow-blue to-rainbow-violet bg-clip-text text-transparent font-bold">Stock Requests</span>}
        description='Manage and track outgoing stock requests for your suppliers.'
        actions={
          <div className='flex flex-wrap items-center gap-2'>
            <select
              className={cn(selectClassName, 'glass-card border-none ring-1 ring-border/50')}
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
              <Button onClick={() => setWizardOpen(true)} className='gap-2 bg-gradient-to-r from-rainbow-green to-rainbow-cyan text-white border-0 vibrant-button'>
                <Plus className='h-4 w-4' />
                New Request
              </Button>
            </PermissionGate>
          </div>
        }
      />

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <StatCard
          title='Total Requests'
          value={requests.length.toString()}
          icon={<Package className='h-4 w-4 text-white/80' />}
          className='bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 text-white hover-scale'
        />
        <StatCard
          title='Pending'
          value={requests.filter(r => r.status === 'PENDING').length.toString()}
          icon={<Clock className='h-4 w-4 text-white/80' />}
          className='bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 text-white hover-scale'
        />
        <StatCard
          title='Approved'
          value={requests.filter(r => r.status === 'APPROVED').length.toString()}
          icon={<CheckCircle2 className='h-4 w-4 text-white/80' />}
          className='bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 text-white hover-scale'
        />
        <StatCard
          title='Fulfilled'
          value={requests.filter(r => r.status === 'FULFILLED').length.toString()}
          icon={<Truck className='h-4 w-4 text-white/80' />}
          className='bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 text-white hover-scale'
        />
      </div>

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
