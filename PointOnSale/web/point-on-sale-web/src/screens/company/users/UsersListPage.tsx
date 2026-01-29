import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UserPlus, Users, Pencil, Power, PowerOff } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { DataTable, DataTableCell, DataTableRow } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { PermissionGate } from '@/components/auth/permission-gate'
import { scopesService, type ScopeNode } from '@/services/company/scopes-service'
import { usersService, type UserSummary } from '@/services/company/users-service'
import { useAuthStore } from '@/store/use-auth-store'
import { formatScopeOptionLabel, getAccessibleScopeOptions } from './user-scope-utils'

const scopeTypeLabels: Record<string, string> = {
  1: 'Company',
  2: 'State',
  3: 'District',
  4: 'Local',
}

const formatScopeType = (scopeType: ScopeNode['scopeType']) => {
  if (typeof scopeType === 'number') {
    return scopeTypeLabels[String(scopeType)] ?? `Scope ${scopeType}`
  }
  return scopeTypeLabels[scopeType] ?? scopeType
}

export default function UsersListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { userProfile } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedScopeId, setSelectedScopeId] = useState<string>('')

  const { data: tree = [], isLoading: isScopesLoading } = useQuery({
    queryKey: ['scopes-tree'],
    queryFn: scopesService.getTree,
  })

  const scopeOptions = useMemo(
    () => getAccessibleScopeOptions(tree, userProfile?.scopeNodeId ? Number(userProfile.scopeNodeId) : undefined),
    [tree, userProfile?.scopeNodeId],
  )

  useEffect(() => {
    const scopeNodeIdParam = searchParams.get('scopeNodeId')
    if (scopeNodeIdParam) {
      setSelectedScopeId(scopeNodeIdParam)
      return
    }
    if (!selectedScopeId && scopeOptions.length > 0) {
      setSelectedScopeId(String(scopeOptions[0].id))
      setSearchParams({ scopeNodeId: String(scopeOptions[0].id) })
    }
  }, [scopeOptions, searchParams, selectedScopeId, setSearchParams])

  const selectedScope = useMemo(
    () => scopeOptions.find((option) => String(option.id) === selectedScopeId),
    [scopeOptions, selectedScopeId],
  )

  const { data: users = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ['users', selectedScopeId],
    queryFn: () => usersService.getUsers(Number(selectedScopeId)),
    enabled: !!selectedScopeId,
  })

  const statusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: number; isActive: boolean }) =>
      isActive ? usersService.deactivateUser(userId) : usersService.activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', selectedScopeId] })
      toast.success('User status updated')
    },
    onError: () => toast.error('Failed to update user status'),
  })

  const handleScopeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    setSelectedScopeId(value)
    setSearchParams({ scopeNodeId: value })
  }

  const handleEdit = (user: UserSummary) => {
    const query = selectedScopeId ? `?scopeNodeId=${selectedScopeId}` : ''
    navigate(`/users/${user.id}/edit${query}`, { state: { user } })
  }

  return (
    <div className='space-y-6'>
      <PageHeader
        title={<span className="bg-gradient-to-r from-rainbow-blue via-rainbow-violet to-rainbow-red bg-clip-text text-transparent font-bold">User Management</span>}
        description='Manage users assigned to your scope hierarchy.'
      >
        <PermissionGate perm='USERS_CREATE'>
          <Button onClick={() => navigate('/users/new')} className='gap-2 bg-gradient-to-r from-rainbow-blue to-rainbow-violet text-white border-0 shadow-lg shadow-rainbow-blue/20 vibrant-button'>
            <UserPlus className='h-4 w-4' />
            Add User
          </Button>
        </PermissionGate>
      </PageHeader>

      <div className='premium-card p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div className='space-y-1'>
          <p className='text-sm font-medium'>Scope Filter</p>
          <p className='text-xs text-muted-foreground'>
            Select the scope node to view assigned users.
          </p>
        </div>
        <div className='min-w-[240px]'>
          <select
            className='h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
            value={selectedScopeId}
            onChange={handleScopeChange}
            disabled={isScopesLoading || scopeOptions.length === 0}
          >
            {scopeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {formatScopeOptionLabel(option)}
              </option>
            ))}
          </select>
          {selectedScope && (
            <p className='mt-1 text-xs text-muted-foreground'>
              Scope type: {formatScopeType(selectedScope.scopeType)}
            </p>
          )}
        </div>
      </div>

      {isScopesLoading || isUsersLoading ? (
        <DataTable>
          <tbody>
            <DataTableRow>
              <DataTableCell colSpan={6} className='text-center py-8 text-foreground'>
                Loading users...
              </DataTableCell>
            </DataTableRow>
          </tbody>
        </DataTable>
      ) : scopeOptions.length === 0 ? (
        <EmptyState
          icon={<Users className='h-8 w-8 text-muted-foreground/50' />}
          title='No Accessible Scopes'
          description='You do not have any scope nodes available to manage users.'
        />
      ) : users.length === 0 ? (
        <EmptyState
          icon={<Users className='h-8 w-8 text-muted-foreground/50' />}
          title='No Users Found'
          description='Create a user for this scope to get started.'
        />
      ) : (
        <DataTable>
          <thead>
            <DataTableRow>
              <DataTableCell isHeader>Name</DataTableCell>
              <DataTableCell isHeader>Email</DataTableCell>
              <DataTableCell isHeader>Phone</DataTableCell>
              <DataTableCell isHeader>Roles</DataTableCell>
              <DataTableCell isHeader>Status</DataTableCell>
              <DataTableCell isHeader className='text-right'>Actions</DataTableCell>
            </DataTableRow>
          </thead>
          <tbody>
            {users.map((user) => (
              <DataTableRow key={user.id}>
                <DataTableCell className='font-medium text-foreground'>
                  {user.fullName}
                </DataTableCell>
                <DataTableCell className='text-foreground'>{user.email}</DataTableCell>
                <DataTableCell className='text-foreground'>{user.phone || '-'}</DataTableCell>
                <DataTableCell className='text-foreground'>
                  {user.roles.length > 0 ? user.roles.join(', ') : 'Unassigned'}
                </DataTableCell>
                <DataTableCell>
                  <Badge className={user.isActive ? 'bg-rainbow-green text-white hover:bg-rainbow-green/90' : 'bg-rainbow-red text-white hover:bg-rainbow-red/90'}>
                    {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </DataTableCell>
                <DataTableCell className='text-right space-x-2'>
                  <PermissionGate perm='USERS_EDIT'>
                    <Button variant='ghost' size='sm' onClick={() => handleEdit(user)}>
                      <Pencil className='h-4 w-4 mr-2' />
                      Edit
                    </Button>
                  </PermissionGate>
                  <PermissionGate perm='USERS_ACTIVATE'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => statusMutation.mutate({ userId: user.id, isActive: user.isActive })}
                    >
                      {user.isActive ? (
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
                  </PermissionGate>
                </DataTableCell>
              </DataTableRow>
            ))}
          </tbody>
        </DataTable>
      )}
    </div>
  )
}
