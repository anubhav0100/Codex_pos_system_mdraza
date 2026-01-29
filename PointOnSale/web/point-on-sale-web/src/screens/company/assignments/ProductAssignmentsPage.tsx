import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/utils/utils'
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
  const [productSearch, setProductSearch] = useState('')
  const [priceOverrides, setPriceOverrides] = useState<Record<number, string>>({})
  const [dialogPriceOverrides, setDialogPriceOverrides] = useState<Record<number, string>>({})
  const [updateExisting, setUpdateExisting] = useState(false)

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
      setDialogPriceOverrides({})
      setUpdateExisting(false)
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
    mutationFn: ({ scopeNodeId, productId, payload }: { scopeNodeId: number, productId: number; payload: { isAllowed: boolean; priceOverride?: number | null } }) =>
      productAssignmentsService.updateAssignment(scopeNodeId, productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scope-products'] })
      toast.success('Assignment updated')
    },
    onError: () => toast.error('Failed to update assignment'),
  })

  const deleteMutation = useMutation({
    mutationFn: ({ scopeNodeId, productId }: { scopeNodeId: number, productId: number }) => productAssignmentsService.deleteAssignment(scopeNodeId, productId),
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

    const assignments = selectedProductIds.map(productId => ({
      productId,
      priceOverride: parsePriceOverride(dialogPriceOverrides[productId])
    }))

    assignMutation.mutate({
      scopeNodeId: selectedScope.id,
      assignments,
      isAllowed: assignAllowed,
      updateExisting
    })
  }

  const handleToggleAllowed = (assignment: ScopeProductAssignment) => {
    const overrideValue = parsePriceOverride(priceOverrides[assignment.id])
    updateMutation.mutate({
      scopeNodeId: assignment.scopeNodeId ?? selectedScopeId!,
      productId: assignment.productId,
      payload: {
        isAllowed: !assignment.isAllowed,
        priceOverride: overrideValue,
      },
    })
  }

  const handleSaveOverride = (assignment: ScopeProductAssignment) => {
    const overrideValue = parsePriceOverride(priceOverrides[assignment.id])
    updateMutation.mutate({
      scopeNodeId: assignment.scopeNodeId ?? selectedScopeId!,
      productId: assignment.productId,
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
        className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all duration-300 group ${selectedScope?.id === node.id
          ? 'bg-rainbow-blue/10 text-rainbow-blue shadow-[0_0_15px_rgba(var(--rainbow-blue),0.1)]'
          : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
          }`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        <div className={cn(
          'p-1.5 rounded-lg transition-colors',
          selectedScope?.id === node.id ? 'bg-rainbow-blue text-white' : 'bg-secondary'
        )}>
          {scopeTypeIcons[String(node.scopeType)] ?? <Boxes className='h-4 w-4' />}
        </div>
        <span className={cn('flex-1 truncate text-left font-semibold', selectedScope?.id === node.id && 'text-rainbow-blue')}>
          {node.name}
        </span>
        {!node.isActive && <Badge variant='secondary' className="opacity-50">Inactive</Badge>}
      </button>
      {node.children?.length ? node.children.map((child) => renderNode(child, depth + 1)) : null}
    </div>
  )

  return (
    <div className='space-y-6'>
      <PageHeader
        title={<span className="bg-gradient-to-r from-rainbow-blue via-rainbow-violet to-rainbow-red bg-clip-text text-transparent font-bold">Product Assignments</span>}
        description='Control which products are available and priced per location/scope.'
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
          <CardHeader className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-border/10'>
            <div>
              <CardTitle className='text-rainbow-blue font-bold'>Assigned Products</CardTitle>
              <p className='text-sm text-muted-foreground'>
                {selectedScope ? `Scope: ${selectedScope.name}` : 'Select a scope to view assignments.'}
              </p>
            </div>
            <PermissionGate perm='PRODUCT_ASSIGNMENTS_ASSIGN'>
              <Button onClick={() => setAssignOpen(true)} disabled={!selectedScope} className='vibrant-button bg-gradient-to-r from-rainbow-blue to-rainbow-violet text-white border-0 shadow-lg shadow-rainbow-blue/20'>
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
              <div className='p-6 text-center'>
                <EmptyState
                  icon={<Boxes className='h-8 w-8 text-muted-foreground/50' />}
                  title='No Assignments'
                  description='Assign products to the selected scope to see them here.'
                />
              </div>
            ) : (
              <DataTable className='border-0 shadow-none'>
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
                      <DataTableCell className='font-bold text-rainbow-blue'>{assignment.name}</DataTableCell>
                      <DataTableCell className='text-rainbow-cyan font-semibold'>{assignment.sku}</DataTableCell>
                      <DataTableCell className='text-muted-foreground'>₹{formatAmount(assignment.defaultSalePrice)}</DataTableCell>
                      <DataTableCell>
                        <div className='flex items-center gap-2'>
                          <Input
                            type='number'
                            className='w-28 glass-card border-none ring-1 ring-border/50'
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
                              variant='outline'
                              size='sm'
                              className='vibrant-button border-rainbow-cyan/30 text-rainbow-cyan'
                              onClick={() => handleSaveOverride(assignment)}
                              disabled={updateMutation.isPending}
                            >
                              Save
                            </Button>
                          </PermissionGate>
                        </div>
                      </DataTableCell>
                      <DataTableCell className='font-black text-lg'>₹{formatAmount(getEffectivePrice(assignment))}</DataTableCell>
                      <DataTableCell>
                        {assignment.isAllowed ? (
                          <Badge className='bg-rainbow-green text-white shadow-sm'>ALLOWED</Badge>
                        ) : (
                          <Badge className='bg-rainbow-red text-white shadow-sm'>BLOCKED</Badge>
                        )}
                      </DataTableCell>
                      <DataTableCell className='text-right space-x-2'>
                        <PermissionGate perm='PRODUCT_ASSIGNMENTS_EDIT'>
                          <Button
                            variant='outline'
                            size='sm'
                            className={cn(
                              'vibrant-button border-0 text-white',
                              assignment.isAllowed ? 'bg-rainbow-orange shadow-rainbow-orange/20' : 'bg-rainbow-green shadow-rainbow-green/20'
                            )}
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
                          <Button variant='ghost' size='sm' className='text-destructive hover:bg-destructive/10' onClick={() => setDeleteTarget(assignment)}>
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
        <DialogContent className='sm:max-w-[620px] glass-card border-none p-0 overflow-hidden'>
          <DialogHeader className='p-6 bg-gradient-to-r from-rainbow-blue to-rainbow-violet text-white'>
            <DialogTitle className='text-2xl font-bold'>Assign Products</DialogTitle>
            <DialogDescription className='text-white/80'>Select products to assign to the chosen scope.</DialogDescription>
          </DialogHeader>
          <div className='p-6 space-y-6'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <label className='text-sm font-bold text-rainbow-blue uppercase tracking-wider'>Search Products</label>
                <Input
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder='Name or SKU...'
                  className='glass-card border-none ring-1 ring-border/50'
                />
              </div>
              <div className='flex items-end justify-end gap-2'>
                <Button variant="outline" size="sm" className="vibrant-button border-rainbow-cyan/30 text-rainbow-cyan" onClick={() => {
                  const allIds = filteredProducts.map(p => p.id);
                  setSelectedProductIds([...new Set([...selectedProductIds, ...allIds])]);
                }}>Select All</Button>
                <Button variant="outline" size="sm" className="vibrant-button border-rainbow-red/30 text-rainbow-red" onClick={() => setSelectedProductIds([])}>Clear All</Button>
              </div>
            </div>

            <ScrollArea className='h-[350px] pr-4 border rounded-2xl border-border/50'>
              <div className='grid grid-cols-1 gap-2 p-1'>
                {filteredProducts.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12 text-sm italic">No products matched your search</div>
                ) : (
                  filteredProducts.map((product) => {
                    const isSelected = selectedProductIds.includes(product.id)
                    return (
                      <div key={product.id} className={cn(
                        "p-3 rounded-xl transition-all cursor-pointer group",
                        isSelected ? "bg-rainbow-blue/10 border-rainbow-blue/20" : "hover:bg-secondary/50 border-transparent"
                      )}>
                        <label className="flex items-center gap-4 cursor-pointer">
                          <input
                            type="checkbox"
                            className="h-5 w-5 rounded-lg border-2 border-rainbow-blue accent-rainbow-blue"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProductIds(prev => [...prev, product.id])
                              } else {
                                setSelectedProductIds(prev => prev.filter(id => id !== product.id))
                                setDialogPriceOverrides(prev => {
                                  const next = { ...prev }
                                  delete next[product.id]
                                  return next
                                })
                              }
                            }}
                          />
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center justify-between'>
                              <span className='font-bold text-foreground truncate'>{product.name}</span>
                              <span className='text-[10px] bg-secondary px-2 py-0.5 rounded font-mono'>{product.sku}</span>
                            </div>
                            <div className='flex items-center gap-2 mt-1'>
                              <span className='text-xs text-muted-foreground'>MRP: ₹{formatAmount(product.mrp)}</span>
                              <div className='h-1 w-1 rounded-full bg-border' />
                              <span className='text-xs font-bold text-rainbow-green'>Base: ₹{formatAmount(product.defaultSalePrice)}</span>
                            </div>
                          </div>
                        </label>
                        {isSelected && (
                          <div className='mt-3 pl-9 animate-in slide-in-from-top-2'>
                            <div className='flex items-center gap-3'>
                              <label className='text-[10px] font-black uppercase text-rainbow-orange'>Price Override</label>
                              <Input
                                type='number'
                                placeholder='Leave empty for base'
                                className='h-8 text-xs glass-card border-none ring-1 ring-border/50 w-32'
                                value={dialogPriceOverrides[product.id] ?? ''}
                                onChange={(e) => setDialogPriceOverrides(prev => ({ ...prev, [product.id]: e.target.value }))}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter className='p-6 bg-secondary/30'>
            <Button variant='ghost' onClick={() => setAssignOpen(false)} className="rounded-xl">Cancel</Button>
            <Button
              onClick={handleAssign}
              disabled={assignMutation.isPending || selectedProductIds.length === 0}
              className='vibrant-button bg-gradient-to-r from-rainbow-blue to-rainbow-violet text-white border-0 px-8'
            >
              {assignMutation.isPending ? 'Assigning...' : `Assign ${selectedProductIds.length} Products`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => setDeleteTarget(open ? deleteTarget : null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate({ scopeNodeId: deleteTarget.scopeNodeId ?? selectedScopeId!, productId: deleteTarget.productId })}
        title='Remove assignment?'
        description='This product will no longer be available for the selected scope.'
        confirmText='Remove'
        variant='destructive'
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
