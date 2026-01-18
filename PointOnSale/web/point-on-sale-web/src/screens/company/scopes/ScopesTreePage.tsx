import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Building2, MapPin, Map, Store, Pencil, Power, PowerOff, Users, Boxes, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { StatCard } from '@/components/ui/stat-card'
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

const editScopeSchema = z.object({
  name: z.string().min(2, 'Name is required'),
})

type EditScopeFormValues = z.infer<typeof editScopeSchema>

const scopeTypeLabels: Record<string, string> = {
  '0': 'Super Admin',
  '1': 'Company',
  '2': 'State',
  '3': 'District',
  '4': 'Local',
}

const scopeTypeIcons: Record<string, JSX.Element> = {
  '1': <Building2 className='h-4 w-4 text-muted-foreground' />,
  '2': <Map className='h-4 w-4 text-muted-foreground' />,
  '3': <MapPin className='h-4 w-4 text-muted-foreground' />,
  '4': <Store className='h-4 w-4 text-muted-foreground' />,
}

const formatScopeType = (scopeType: ScopeNode['scopeType']) => {
  if (typeof scopeType === 'number') {
    return scopeTypeLabels[String(scopeType)] ?? `Scope ${scopeType}`
  }
  return scopeTypeLabels[scopeType] ?? scopeType
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
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedScopeId, setSelectedScopeId] = useState<number | null>(null)
  const [editScope, setEditScope] = useState<ScopeNode | null>(null)
  const [deleteScope, setDeleteScope] = useState<ScopeNode | null>(null)

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

  const renderNode = (node: ScopeNode, depth = 0) => (
    <div key={node.id}>
      <button
        type='button'
        onClick={() => setSelectedScopeId(node.id)}
        className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
          selectedScope?.id === node.id ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/50'
        }`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        {scopeTypeIcons[String(node.scopeType)] ?? <Building2 className='h-4 w-4 text-muted-foreground' />}
        <span className='flex-1 truncate text-left'>{node.name}</span>
        {!node.isActive && <Badge variant='secondary'>Inactive</Badge>}
      </button>
      {node.children?.length ? node.children.map((child) => renderNode(child, depth + 1)) : null}
    </div>
  )

  const createActions = () => {
    if (!selectedScope) return null
    const scopeType = Number(selectedScope.scopeType)

    if (scopeType === 1) {
      return (
        <Button onClick={() => navigate(`/scopes/new-state?parentId=${selectedScope.id}`)}>
          Create State
        </Button>
      )
    }

    if (scopeType === 2) {
      return (
        <Button onClick={() => navigate(`/scopes/new-district?parentId=${selectedScope.id}`)}>
          Create District
        </Button>
      )
    }

    if (scopeType === 3) {
      return (
        <Button onClick={() => navigate(`/scopes/new-local?parentId=${selectedScope.id}`)}>
          Create Local
        </Button>
      )
    }

    return null
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title='Scopes'
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
                  {selectedScope && Number(selectedScope.scopeType) !== 1 && (
                    <Button variant='outline' onClick={() => setEditScope(selectedScope)}>
                      <Pencil className='h-4 w-4 mr-2' />
                      Edit
                    </Button>
                  )}
                </PermissionGate>
                <PermissionGate perm='SCOPES_ACTIVATE'>
                  {selectedScope && Number(selectedScope.scopeType) !== 1 && (
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
                  {selectedScope && Number(selectedScope.scopeType) !== 1 && (
                    <Button variant='destructive' onClick={() => setDeleteScope(selectedScope)}>
                      <Trash2 className='h-4 w-4 mr-2' />
                      Delete
                    </Button>
                  )}
                </PermissionGate>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              {selectedScope ? (
                <div className='space-y-4'>
                  <div className='flex flex-wrap items-center gap-3'>
                    <div className='flex items-center gap-2 text-lg font-semibold'>
                      {scopeTypeIcons[String(selectedScope.scopeType)] ?? <Building2 className='h-5 w-5' />}
                      <span>{selectedScope.name}</span>
                    </div>
                    <Badge variant={selectedScope.isActive ? 'default' : 'secondary'}>
                      {selectedScope.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Badge>
                  </div>
                  <div className='grid gap-3 text-sm text-muted-foreground sm:grid-cols-2'>
                    <div>
                      <p className='text-xs uppercase tracking-wide'>Scope Type</p>
                      <p className='text-foreground'>{formatScopeType(selectedScope.scopeType)}</p>
                    </div>
                    <div>
                      <p className='text-xs uppercase tracking-wide'>Scope ID</p>
                      <p className='text-foreground'>#{selectedScope.id}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={<Map className='h-8 w-8 text-muted-foreground/50' />}
                  title='Select a Scope'
                  description='Pick a scope from the tree to see metrics and manage settings.'
                />
              )}
            </CardContent>
          </Card>

          <div className='grid gap-4 md:grid-cols-3'>
            <StatCard
              title='Users Assigned'
              value={selectedScope ? formatStat(selectedScope.usersCount) : '—'}
              description='Active users linked to this scope.'
              icon={<Users className='h-4 w-4' />}
            />
            <StatCard
              title='Total Items'
              value={selectedScope ? formatStat(selectedScope.stockSummary?.totalItems) : '—'}
              description='Items in stock across this scope.'
              icon={<Boxes className='h-4 w-4' />}
            />
            <StatCard
              title='Low Stock'
              value={selectedScope ? formatStat(selectedScope.stockSummary?.lowStockItems) : '—'}
              description='Items needing replenishment.'
              icon={<Boxes className='h-4 w-4' />}
            />
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
    </div>
  )
}
