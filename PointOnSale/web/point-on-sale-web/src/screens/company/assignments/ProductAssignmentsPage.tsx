import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Boxes, CheckCircle2, Map, PackagePlus, Trash2, XCircle } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { DataTable, DataTableCell, DataTableRow } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { PermissionGate } from '@/components/auth/permission-gate'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { scopesService, type ScopeNode } from '@/services/company/scopes-service'
import { productsService } from '@/services/company/products-service'
import {
  productAssignmentsService,
  type ScopeProductAssignment,
} from '@/services/company/product-assignments-service'

const formatAmount = (value?: number | null) => {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

const flattenScopes = (nodes: ScopeNode[]): ScopeNode[] =>
  nodes.flatMap((node) => [node, ...(node.children ? flattenScopes(node.children) : [])])

const findScope = (nodes: ScopeNode[], id: number | null): ScopeNode | null => {
  if (id === null) return null
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const match = findScope(node.children, id)
      if (match) return match
    }
  }
  return null
}

const scopeTypeIcons: Record<string, React.JSX.Element> = {
  '1': <Boxes className='h-4 w-4 text-muted-foreground' />,
  '2': <Map className='h-4 w-4 text-muted-foreground' />,
  '3': <Map className='h-4 w-4 text-muted-foreground' />,
  '4': <Map className='h-4 w-4 text-muted-foreground' />,
}

const parsePriceOverride = (value?: string) => {
  if (!value) return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

export default function ProductAssignmentsPage() {
  const queryClient = useQueryClient()
  const [selectedScopeId, setSelectedScopeId] = useState<number | null>(null)
  const [assignOpen, setAssignOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ScopeProductAssignment | null>(null)
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([])
  const [assignAllowed, setAssignAllowed] = useState(true)
  const [assignPriceOverride, setAssignPriceOverride] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [priceOverrides, setPriceOverrides] = useState<Record<number, string>>({})

  const { data: tree = [], isLoading: isScopesLoading } = useQuery({
    queryKey: ['scopes-tree'],
    queryFn: scopesService.getTree,
  })

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: productsService.getProducts,
  })

  const allScopes = useMemo(() => flattenScopes(tree), [tree])
  const selectedScope = useMemo(
    () => findScope(tree, selectedScopeId) ?? allScopes[0] ?? null,
    [allScopes, selectedScopeId, tree],
  )

  useEffect(() => {
    if (!selectedScopeId && allScopes.length > 0) {
      setSelectedScopeId(allScopes[0].id)
    }
  }, [allScopes, selectedScopeId])

  const {
    data: assignments = [],
    isLoading: isAssignmentsLoading,
  } = useQuery({
    queryKey: ['scope-products', selectedScope?.id],
    queryFn: () => productAssignmentsService.getScopeProducts(selectedScope?.id ?? 0),
    enabled: Boolean(selectedScope?.id),
  })

  useEffect(() => {
    const nextOverrides: Record<number, string> = {}
    assignments.forEach((assignment) => {
      nextOverrides[assignment.id] = assignment.priceOverride?.toString() ?? ''
    })

    // Check if distinct before setting to prevent infinite loop
    setPriceOverrides(prev => {
      if (JSON.stringify(prev) === JSON.stringify(nextOverrides)) {
        return prev
      }
      return nextOverrides
    })
  }, [assignments])

  useEffect(() => {
    if (assignOpen) {
      setSelectedProductIds([])
      setAssignAllowed(true)
      setAssignPriceOverride('')
      setProductSearch('')
    }
  }, [assignOpen])

  const assignMutation = useMutation({
    mutationFn: productAssignmentsService.assignProducts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scope-products'] })
      setAssignOpen(false)
      toast.success('Products assigned successfully')
    },
    onError: () => toast.error('Failed to assign products'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { isAllowed: boolean; priceOverride?: number | null } }) =>
      productAssignmentsService.updateAssignment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scope-products'] })
      toast.success('Assignment updated')
    },
    onError: () => toast.error('Failed to update assignment'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productAssignmentsService.deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scope-products'] })
      setDeleteTarget(null)
      toast.success('Assignment removed')
    },
    onError: () => toast.error('Failed to remove assignment'),
  })

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase()
    if (!term) return products
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term),
    )
  }, [productSearch, products])

  // const selectedProduct = products.find((product) => product.id === selectedProductId) ?? null

  const handleAssign = () => {
    if (!selectedScope || selectedProductIds.length === 0) {
      toast.error('Select a scope and at least one product')
      return
    }
    assignMutation.mutate({
      scopeNodeId: selectedScope.id,
      productIds: selectedProductIds,
      isAllowed: assignAllowed,
      priceOverride: parsePriceOverride(assignPriceOverride),
    })
  }

  const handleToggleAllowed = (assignment: ScopeProductAssignment) => {
    const overrideValue = parsePriceOverride(priceOverrides[assignment.id])
    updateMutation.mutate({
      id: assignment.id,
      payload: {
        isAllowed: !assignment.isAllowed,
        priceOverride: overrideValue,
      },
    })
  }

  const handleSaveOverride = (assignment: ScopeProductAssignment) => {
    const overrideValue = parsePriceOverride(priceOverrides[assignment.id])
    updateMutation.mutate({
      id: assignment.id,
      payload: {
        isAllowed: assignment.isAllowed,
        priceOverride: overrideValue,
      },
    })
  }

  const getEffectivePrice = (assignment: ScopeProductAssignment) => {
    if (assignment.effectivePrice !== undefined && assignment.effectivePrice !== null) {
      return assignment.effectivePrice
    }
    const overrideValue = parsePriceOverride(priceOverrides[assignment.id])
    return overrideValue ?? assignment.priceOverride ?? assignment.defaultSalePrice
  }

  const renderNode = (node: ScopeNode, depth = 0) => (
    <div key={node.id}>
      <button
        type='button'
        onClick={() => setSelectedScopeId(node.id)}
        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition ${selectedScope?.id === node.id ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/50'
          }`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        {scopeTypeIcons[String(node.scopeType)] ?? <Boxes className='h-4 w-4 text-muted-foreground' />}
        <span className='flex-1 truncate text-left'>{node.name}</span>
        {!node.isActive && <Badge variant='secondary'>Inactive</Badge>}
      </button>
      {node.children?.length ? node.children.map((child) => renderNode(child, depth + 1)) : null}
    </div>
  )

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Product Assignments'
        description='Control which products are available and priced per scope.'
      />

      <div className='grid gap-6 lg:grid-cols-[320px_1fr]'>
        <Card className='premium-card'>
          <CardHeader>
            <CardTitle>Scope Selector</CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            <ScrollArea className='h-[520px]'>
              <div className='p-3'>
                {isScopesLoading ? (
                  <div className='text-sm text-muted-foreground'>Loading scope tree...</div>
                ) : tree.length === 0 ? (
                  <EmptyState
                    icon={<Map className='h-8 w-8 text-muted-foreground/50' />}
                    title='No Scopes Found'
                    description='Create scopes to begin assigning products.'
                  />
                ) : (
                  tree.map((node) => renderNode(node))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className='premium-card'>
          <CardHeader className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
            <div>
              <CardTitle>Assigned Products</CardTitle>
              <p className='text-sm text-muted-foreground'>
                {selectedScope ? `Scope: ${selectedScope.name}` : 'Select a scope to view assignments.'}
              </p>
            </div>
            <PermissionGate perm='PRODUCT_ASSIGNMENTS_ASSIGN'>
              <Button onClick={() => setAssignOpen(true)} disabled={!selectedScope}>
                <PackagePlus className='h-4 w-4 mr-2' />
                Assign Product
              </Button>
            </PermissionGate>
          </CardHeader>
          <CardContent className='p-0'>
            {isAssignmentsLoading ? (
              <DataTable>
                <tbody>
                  <DataTableRow>
                    <DataTableCell colSpan={8} className='text-center py-8 text-foreground'>
                      Loading assignments...
                    </DataTableCell>
                  </DataTableRow>
                </tbody>
              </DataTable>
            ) : assignments.length === 0 ? (
              <div className='p-6'>
                <EmptyState
                  icon={<Boxes className='h-8 w-8 text-muted-foreground/50' />}
                  title='No Assignments'
                  description='Assign products to the selected scope to see them here.'
                />
              </div>
            ) : (
              <DataTable>
                <thead>
                  <DataTableRow>
                    <DataTableCell isHeader>Product</DataTableCell>
                    <DataTableCell isHeader>SKU</DataTableCell>
                    <DataTableCell isHeader>Base Price</DataTableCell>
                    <DataTableCell isHeader>Price Override</DataTableCell>
                    <DataTableCell isHeader>Effective Price</DataTableCell>
                    <DataTableCell isHeader>Status</DataTableCell>
                    <DataTableCell isHeader className='text-right'>Actions</DataTableCell>
                  </DataTableRow>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <DataTableRow key={assignment.id}>
                      <DataTableCell className='font-medium text-foreground'>{assignment.name}</DataTableCell>
                      <DataTableCell className='text-foreground'>{assignment.sku}</DataTableCell>
                      <DataTableCell className='text-foreground'>{formatAmount(assignment.defaultSalePrice)}</DataTableCell>
                      <DataTableCell>
                        <div className='flex items-center gap-2'>
                          <Input
                            type='number'
                            className='w-28'
                            value={priceOverrides[assignment.id] ?? ''}
                            onChange={(event) =>
                              setPriceOverrides((prev) => ({
                                ...prev,
                                [assignment.id]: event.target.value,
                              }))
                            }
                          />
                          <PermissionGate perm='PRODUCT_ASSIGNMENTS_EDIT'>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => handleSaveOverride(assignment)}
                              disabled={updateMutation.isPending}
                            >
                              Save
                            </Button>
                          </PermissionGate>
                        </div>
                      </DataTableCell>
                      <DataTableCell className='text-foreground'>{formatAmount(getEffectivePrice(assignment))}</DataTableCell>
                      <DataTableCell>
                        <Badge variant={assignment.isAllowed ? 'default' : 'secondary'}>
                          {assignment.isAllowed ? 'ALLOWED' : 'BLOCKED'}
                        </Badge>
                      </DataTableCell>
                      <DataTableCell className='text-right space-x-2'>
                        <PermissionGate perm='PRODUCT_ASSIGNMENTS_EDIT'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleToggleAllowed(assignment)}
                            disabled={updateMutation.isPending}
                          >
                            {assignment.isAllowed ? (
                              <>
                                <XCircle className='h-4 w-4 mr-2' />
                                Block
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className='h-4 w-4 mr-2' />
                                Allow
                              </>
                            )}
                          </Button>
                        </PermissionGate>
                        <PermissionGate perm='PRODUCT_ASSIGNMENTS_DELETE'>
                          <Button variant='ghost' size='sm' onClick={() => setDeleteTarget(assignment)}>
                            <Trash2 className='h-4 w-4 mr-2' />
                            Remove
                          </Button>
                        </PermissionGate>
                      </DataTableCell>
                    </DataTableRow>
                  ))}
                </tbody>
              </DataTable>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className='sm:max-w-[520px]'>
          <DialogHeader>
            <DialogTitle>Assign Products</DialogTitle>
            <DialogDescription>Select products to assign to the chosen scope.</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <div className="flex items-center justify-between">
                <label className='text-sm font-medium text-foreground'>Search & Select</label>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => {
                    const allIds = filteredProducts.map(p => p.id);
                    setSelectedProductIds([...new Set([...selectedProductIds, ...allIds])]);
                  }}>Select All</Button>
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedProductIds([])}>Clear</Button>
                </div>
              </div>
              <Input
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
                placeholder='Search by name or SKU'
              />
            </div>

            <div className='space-y-2 border rounded-md p-2 h-60 overflow-y-auto'>
              {filteredProducts.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 text-sm">No products found</div>
              ) : (
                filteredProducts.map((product) => (
                  <label key={product.id} className="flex items-start gap-2 p-2 hover:bg-secondary/50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-primary"
                      checked={selectedProductIds.includes(product.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProductIds(prev => [...prev, product.id])
                        } else {
                          setSelectedProductIds(prev => prev.filter(id => id !== product.id))
                        }
                      }}
                    />
                    <div className="text-sm">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">SKU: {product.sku} — {formatAmount(product.defaultSalePrice)}</div>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className='flex items-center justify-between text-sm text-muted-foreground'>
              <span>{selectedProductIds.length} products selected</span>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-foreground'>Price override (Optional)</label>
              <Input
                type='number'
                value={assignPriceOverride}
                onChange={(event) => setAssignPriceOverride(event.target.value)}
                placeholder='Leave blank to use base price'
              />
              <p className='text-xs text-muted-foreground'>
                Applied to all selected products.
              </p>
            </div>
            <label className='flex items-center gap-2 text-sm text-foreground'>
              <input
                type='checkbox'
                checked={assignAllowed}
                onChange={(event) => setAssignAllowed(event.target.checked)}
                className='h-4 w-4 rounded border-border'
              />
              Allow products for this scope
            </label>
          </div>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button variant='ghost' onClick={() => setAssignOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={assignMutation.isPending || selectedProductIds.length === 0}>
              {assignMutation.isPending ? 'Assigning...' : `Assign ${selectedProductIds.length} Products`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => setDeleteTarget(open ? deleteTarget : null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title='Remove assignment?'
        description='This product will no longer be available for the selected scope.'
        confirmText='Remove'
        variant='destructive'
        loading={deleteMutation.isPending}
      />

    </div>
  )
}
