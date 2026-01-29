import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Building2, MapPin, Map, Store, Pencil, Power, PowerOff, Users, Boxes, Trash2, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip, AreaChart, Area
} from 'recharts'

import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
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
import { companyService } from '@/services/super/company-service'
import { CompanyForm } from '@/components/super/companies/CompanyForm'

const editScopeSchema = z.object({
  name: z.string().min(2, 'Name is required'),
})

type EditScopeFormValues = z.infer<typeof editScopeSchema>

const scopeTypeLabels: Record<string, string> = {
  '0': 'System Root',
  '1': 'Company',
  '2': 'State',
  '3': 'District',
  '4': 'Local',
}

const scopeTypeIcons: Record<string, React.JSX.Element> = {
  '0': <Building2 className='h-4 w-4 mb-1' />,
  '1': <Building2 className='h-4 w-4 text-secondary' />,
  '2': <Map className='h-4 w-4 text-green-400' />,
  '3': <MapPin className='h-4 w-4 text-orange-400' />,
  '4': <Store className='h-4 w-4 text-pink-400' />,
}

const VIBRANT_COLORS = ['#8b5cf6', '#3b82f6', '#f97316', '#ec4899', '#10b981'];

const getScopeTypeNumeric = (type: number | string): number => {
  if (typeof type === 'number') return type
  const map: Record<string, number> = {
    'SuperAdmin': 0,
    'Company': 1,
    'State': 2,
    'District': 3,
    'Local': 4
  }
  return map[type] ?? Number(type)
}

const formatScopeType = (scopeType: ScopeNode['scopeType']) => {
  const typeNum = getScopeTypeNumeric(scopeType)
  const label = scopeTypeLabels[String(typeNum)] ?? `Scope ${scopeType}`
  if (typeNum === 0) return label
  return `Level ${typeNum}: ${label}`
}

const formatStat = (value?: number) => (typeof value === 'number' ? value.toLocaleString() : '—')

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

export default function ScopesTreePage() {
  const queryClient = useQueryClient()
  const [selectedScopeId, setSelectedScopeId] = useState<number | null>(null)
  const [editScope, setEditScope] = useState<ScopeNode | null>(null)
  const [deleteScope, setDeleteScope] = useState<ScopeNode | null>(null)
  const [newSubScopeParent, setNewSubScopeParent] = useState<ScopeNode | null>(null)
  const [isCreateCompanyOpen, setIsCreateCompanyOpen] = useState(false)

  const { data: tree = [], isLoading } = useQuery({
    queryKey: ['scopes-tree'],
    queryFn: scopesService.getTree,
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

  const editForm = useForm<EditScopeFormValues>({
    resolver: zodResolver(editScopeSchema),
    defaultValues: {
      name: '',
    },
  })

  useEffect(() => {
    if (editScope) {
      editForm.reset({ name: editScope.name })
    }
  }, [editForm, editScope])

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => scopesService.updateScope(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scopes-tree'] })
      setEditScope(null)
      toast.success('Scope updated successfully')
    },
    onError: () => toast.error('Failed to update scope'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      isActive ? scopesService.deactivateScope(id) : scopesService.activateScope(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scopes-tree'] })
      toast.success('Scope status updated')
    },
    onError: () => toast.error('Failed to update scope status'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => scopesService.deleteScope(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scopes-tree'] })
      setDeleteScope(null)
      setSelectedScopeId(null)
      toast.success('Scope deleted successfully')
    },
    onError: () => toast.error('Failed to delete scope'),
  })

  const createMutation = useMutation({
    mutationFn: ({ parent, name }: { parent: ScopeNode; name: string }) => {
      const type = getScopeTypeNumeric(parent.scopeType)
      const data = { name, parentScopeId: parent.id }
      if (type === 1) return scopesService.createState(data)
      if (type === 2) return scopesService.createDistrict(data)
      if (type === 3) return scopesService.createLocal(data)
      throw new Error(`Cannot create sub-scope under parent type: ${type} (${parent.scopeType})`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scopes-tree'] })
      setNewSubScopeParent(null)
      toast.success('Sub-scope created successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create sub-scope')
    },
  })

  const companyMutation = useMutation({
    mutationFn: (values: any) => companyService.createCompany(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scopes-tree'] })
      setIsCreateCompanyOpen(false)
      toast.success('Company created successfully')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create company')
    },
  })

  const distributionData = useMemo(() => {
    if (!selectedScope?.children) return []
    const counts: Record<string, number> = {}
    selectedScope.children.forEach(child => {
      const typeNum = getScopeTypeNumeric(child.scopeType)
      const label = scopeTypeLabels[String(typeNum)] || 'Other'
      counts[label] = (counts[label] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [selectedScope])

  const activityData = useMemo(() => [
    { name: 'Mon', value: 400 },
    { name: 'Tue', value: 300 },
    { name: 'Wed', value: 600 },
    { name: 'Thu', value: 800 },
    { name: 'Fri', value: 500 },
    { name: 'Sat', value: 900 },
    { name: 'Sun', value: 700 },
  ], [])

  const renderNode = (node: ScopeNode, depth = 0) => {
    const typeNum = (node.name === 'System Root' || node.name === 'Super Admin') ? 0 : getScopeTypeNumeric(node.scopeType)
    return (
      <div key={node.id}>
        <button
          type='button'
          onClick={() => setSelectedScopeId(node.id)}
          className={`group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition ${selectedScope?.id === node.id ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/50'
            }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          {scopeTypeIcons[String(typeNum)] ?? <Building2 className='h-4 w-4 text-muted-foreground' />}
          <span className='flex-1 truncate text-left'>{node.name}</span>
          <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
            {!node.isActive && <Badge variant='secondary'>Inactive</Badge>}
            {typeNum < 4 && (
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6'
                onClick={(e) => {
                  e.stopPropagation()
                  if (typeNum === 0) {
                    setIsCreateCompanyOpen(true)
                  } else {
                    setNewSubScopeParent(node)
                  }
                }}
              >
                <Plus className='h-3 w-3' />
              </Button>
            )}
          </div>
        </button>
        {node.children?.length ? node.children.map((child) => renderNode(child, depth + 1)) : null}
      </div>
    )
  }

  const createActions = () => {
    if (!selectedScope) return null
    const scopeType = (selectedScope.name === 'System Root' || selectedScope.name === 'Super Admin') ? 0 : getScopeTypeNumeric(selectedScope.scopeType)

    if (scopeType === 0) {
      return (
        <Button className='vibrant-button' onClick={() => setIsCreateCompanyOpen(true)}>
          <Plus className='h-4 w-4 mr-2' />
          Add Level 1: Company
        </Button>
      )
    }

    if (scopeType === 1) {
      return (
        <Button className='vibrant-button' onClick={() => setNewSubScopeParent(selectedScope)}>
          <Plus className='h-4 w-4 mr-2' />
          Add Level 2: State
        </Button>
      )
    }

    if (scopeType === 2) {
      return (
        <Button className='vibrant-button' onClick={() => setNewSubScopeParent(selectedScope)}>
          <Plus className='h-4 w-4 mr-2' />
          Add Level 3: District
        </Button>
      )
    }

    if (scopeType === 3) {
      return (
        <Button className='vibrant-button' onClick={() => setNewSubScopeParent(selectedScope)}>
          <Plus className='h-4 w-4 mr-2' />
          Add Level 4: Local
        </Button>
      )
    }

    return null
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title={<span className="bg-gradient-to-r from-rainbow-cyan via-rainbow-blue to-rainbow-violet bg-clip-text text-transparent font-bold">Scopes Hierarchy</span>}
        description='Organize your company hierarchy across states, districts, and local branches.'
      />

      <div className='grid gap-6 lg:grid-cols-[320px_1fr]'>
        <Card className='premium-card'>
          <CardHeader>
            <CardTitle>Scope Tree</CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            <ScrollArea className='h-[520px]'>
              <div className='p-3'>
                {isLoading ? (
                  <div className='text-sm text-muted-foreground'>Loading scope tree...</div>
                ) : tree.length === 0 ? (
                  <EmptyState
                    icon={<Map className='h-8 w-8 text-muted-foreground/50' />}
                    title='No Scopes Found'
                    description='Create the first scope to begin organizing locations.'
                  />
                ) : (
                  tree.map((node) => renderNode(node))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className='space-y-6'>
          <Card className='premium-card'>
            <CardHeader className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
              <div>
                <CardTitle>Scope Details</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  {selectedScope ? 'Review scope details and manage permissions.' : 'Select a scope to view details.'}
                </p>
              </div>
              <div className='flex flex-wrap gap-2'>
                <PermissionGate perm='SCOPES_CREATE'>{createActions()}</PermissionGate>
                <PermissionGate perm='SCOPES_EDIT'>
                  {selectedScope && getScopeTypeNumeric(selectedScope.scopeType) !== 0 && getScopeTypeNumeric(selectedScope.scopeType) !== 1 && (
                    <Button variant='outline' onClick={() => setEditScope(selectedScope)}>
                      <Pencil className='h-4 w-4 mr-2' />
                      Edit
                    </Button>
                  )}
                </PermissionGate>
                <PermissionGate perm='SCOPES_ACTIVATE'>
                  {selectedScope && getScopeTypeNumeric(selectedScope.scopeType) !== 0 && getScopeTypeNumeric(selectedScope.scopeType) !== 1 && (
                    <Button
                      variant='ghost'
                      onClick={() =>
                        statusMutation.mutate({
                          id: selectedScope.id,
                          isActive: selectedScope.isActive,
                        })
                      }
                    >
                      {selectedScope.isActive ? (
                        <>
                          <PowerOff className='h-4 w-4 mr-2' />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Power className='h-4 w-4 mr-2' />
                          Activate
                        </>
                      )}
                    </Button>
                  )}
                </PermissionGate>
                <PermissionGate perm='SCOPES_DELETE'>
                  {selectedScope && getScopeTypeNumeric(selectedScope.scopeType) !== 0 && getScopeTypeNumeric(selectedScope.scopeType) !== 1 && (
                    <Button variant='destructive' onClick={() => setDeleteScope(selectedScope)}>
                      <Trash2 className='h-4 w-4 mr-2' />
                      Delete
                    </Button>
                  )}
                </PermissionGate>
              </div>
            </CardHeader>
            <CardContent className='space-y-8 p-6'>
              {selectedScope ? (
                <div className='space-y-8'>
                  <div className='flex flex-wrap items-center justify-between gap-4'>
                    <div className='flex items-center gap-4'>
                      <div className='p-3 rounded-2xl bg-gradient-vibrant glow-primary text-white'>
                        {scopeTypeIcons[String(getScopeTypeNumeric(selectedScope.scopeType))] ?? <Building2 className='h-6 w-6' />}
                      </div>
                      <div>
                        <h2 className='text-3xl font-bold tracking-tight text-gradient'>{selectedScope.name}</h2>
                        <div className='flex items-center gap-2 mt-1'>
                          <Badge variant={selectedScope.isActive ? 'default' : 'secondary'} className='bg-background/50 backdrop-blur-sm border-white/10'>
                            {selectedScope.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </Badge>
                          <span className='text-xs text-muted-foreground'>{formatScopeType(selectedScope.scopeType)}</span>
                        </div>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-xs uppercase tracking-widest text-muted-foreground'>Scope ID</p>
                      <p className='text-xl font-mono font-bold text-gradient'>#{selectedScope.id}</p>
                    </div>
                  </div>

                  {/* Dashboard Grid */}
                  <div className='grid gap-6 md:grid-cols-2'>
                    {/* Activity Chart */}
                    <div className='glass-panel rounded-3xl p-6 hover-lift'>
                      <h4 className='text-sm font-semibold mb-4 flex items-center gap-2'>
                        <Plus className='h-4 w-4 text-primary' /> Pulse Monitoring
                      </h4>
                      <div className='h-[200px] w-full'>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={activityData}>
                            <defs>
                              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(263, 70%, 50%)" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="hsl(263, 70%, 50%)" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <Tooltip
                              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                              itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="value" stroke="hsl(263, 70%, 50%)" fillOpacity={1} fill="url(#colorValue)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Distribution Chart */}
                    <div className='glass-panel rounded-3xl p-6 hover-lift'>
                      <h4 className='text-sm font-semibold mb-4 flex items-center gap-2'>
                        <Boxes className='h-4 w-4 text-secondary' /> Hierarchy Distribution
                      </h4>
                      <div className='h-[200px] w-full'>
                        {distributionData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={distributionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={8}
                                dataKey="value"
                              >
                                {distributionData.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={VIBRANT_COLORS[index % VIBRANT_COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                                itemStyle={{ color: '#fff' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className='flex items-center justify-center h-full text-muted-foreground text-xs'>
                            No children to visualize
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sub-Scopes Section */}
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <h4 className='text-lg font-bold flex items-center gap-2'>
                        <Store className='h-5 w-5 text-gradient' /> Sub-Scopes
                      </h4>
                      <Badge variant='outline' className='bg-primary/10 text-primary border-primary/20'>
                        {selectedScope.children?.length ?? 0} Children
                      </Badge>
                    </div>

                    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                      {!selectedScope.children?.length ? (
                        <div className='col-span-full p-12 text-center glass-panel rounded-3xl'>
                          <p className='text-muted-foreground mb-4'>Deep hierarchy yields more results.</p>
                          {createActions()}
                        </div>
                      ) : (
                        selectedScope.children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => setSelectedScopeId(child.id)}
                            className='glass-panel p-4 rounded-2xl flex items-center gap-4 text-left transition-all hover:border-primary/50 hover:bg-white/10'
                          >
                            <div className='p-2 rounded-xl bg-background/50 border border-white/10'>
                              {scopeTypeIcons[String(getScopeTypeNumeric(child.scopeType))] ?? <Building2 className='h-4 w-4' />}
                            </div>
                            <div className='min-w-0 flex-1'>
                              <p className='text-sm font-bold truncate'>{child.name}</p>
                              <p className='text-[10px] uppercase tracking-wider text-muted-foreground'>{formatScopeType(child.scopeType).split(': ')[1]}</p>
                            </div>
                            <div className={`h-2 w-2 rounded-full ${child.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-muted'}`} />
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={<Map className='h-12 w-12 text-primary/20' />}
                  title='Select a Universe'
                  description='Explore your points of sale across the globe.'
                />
              )}
            </CardContent>
          </Card>

          <div className='grid gap-6 md:grid-cols-3'>
            <div className='premium-card hover-lift bg-gradient-to-br from-purple-500/10 to-transparent'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-2 rounded-lg bg-purple-500/20 text-purple-400'>
                  <Users className='h-4 w-4' />
                </div>
                <h4 className='text-sm font-semibold'>Personnel</h4>
              </div>
              <div className='text-3xl font-bold text-gradient'>{selectedScope ? formatStat(selectedScope.usersCount) : '—'}</div>
              <p className='text-xs text-muted-foreground mt-2'>Verified users in this branch</p>
            </div>

            <div className='premium-card hover-lift bg-gradient-to-br from-blue-500/10 to-transparent'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-2 rounded-lg bg-blue-500/20 text-blue-400'>
                  <Boxes className='h-4 w-4' />
                </div>
                <h4 className='text-sm font-semibold'>Inventory</h4>
              </div>
              <div className='text-3xl font-bold text-gradient'>{selectedScope ? formatStat(selectedScope.stockSummary?.totalItems) : '—'}</div>
              <p className='text-xs text-muted-foreground mt-2'>Total SKUs registered</p>
            </div>

            <div className='premium-card hover-lift bg-gradient-to-br from-orange-500/10 to-transparent'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-2 rounded-lg bg-orange-500/20 text-orange-400'>
                  <Plus className='h-4 w-4' />
                </div>
                <h4 className='text-sm font-semibold'>Low Stock</h4>
              </div>
              <div className='text-3xl font-bold text-orange-500'>{selectedScope ? formatStat(selectedScope.stockSummary?.lowStockItems) : '—'}</div>
              <p className='text-xs text-muted-foreground mt-2'>Alerts requiring attention</p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!editScope} onOpenChange={(open) => (!open ? setEditScope(null) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Scope</DialogTitle>
            <DialogDescription>Update the selected scope name.</DialogDescription>
          </DialogHeader>
          <form
            className='space-y-4'
            onSubmit={editForm.handleSubmit((values) => {
              if (!editScope) return
              updateMutation.mutate({ id: editScope.id, name: values.name })
            })}
          >
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Scope Name</label>
              <Input placeholder='Enter scope name' {...editForm.register('name')} />
              {editForm.formState.errors.name && (
                <p className='text-sm text-destructive'>{editForm.formState.errors.name.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type='button' variant='ghost' onClick={() => setEditScope(null)}>
                Cancel
              </Button>
              <Button type='submit' disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteScope}
        onOpenChange={(open) => (!open ? setDeleteScope(null) : null)}
        title='Delete scope'
        description='This will permanently remove the selected scope. This action cannot be undone.'
        confirmText='Delete'
        variant='destructive'
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleteScope) return
          deleteMutation.mutate(deleteScope.id)
        }}
      />

      <Dialog
        open={!!newSubScopeParent}
        onOpenChange={(open) => (!open ? setNewSubScopeParent(null) : null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {(() => {
                if (!newSubScopeParent) return 'DEBUG: No Parent Selected';
                const type = getScopeTypeNumeric(newSubScopeParent.scopeType);
                const parentName = newSubScopeParent.name;

                if (type === 0 || parentName === 'System Root') return 'Add Level 1: Company';
                if (type === 1) return 'Add Level 2: State';
                if (type === 2) return 'Add Level 3: District';
                if (type === 3) return 'Add Level 4: Local';

                return `Add Sub-scope (Parent Type: ${type}, Name: ${parentName})`;
              })()}
            </DialogTitle>
            <DialogDescription>
              Creating a new sub-scope under <strong>{newSubScopeParent?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <form
            className='space-y-4'
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const name = formData.get('name') as string
              if (newSubScopeParent) {
                createMutation.mutate({ parent: newSubScopeParent, name })
              }
            }}
          >
            <div className='space-y-2'>
              <label className='text-sm font-medium text-muted-foreground'>Name</label>
              <Input
                name='name'
                placeholder='Enter name'
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type='button' variant='ghost' onClick={() => setNewSubScopeParent(null)}>
                Cancel
              </Button>
              <Button type='submit' disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateCompanyOpen} onOpenChange={setIsCreateCompanyOpen}>
        <DialogContent className='sm:max-w-[480px]'>
          <DialogHeader>
            <DialogTitle>Add Level 1: Company</DialogTitle>
            <DialogDescription>
              Create a new company at the root level of the system.
            </DialogDescription>
          </DialogHeader>
          <div className='pt-4'>
            <CompanyForm
              onSubmit={async (values) => {
                await companyMutation.mutateAsync(values)
              }}
              isLoading={companyMutation.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
