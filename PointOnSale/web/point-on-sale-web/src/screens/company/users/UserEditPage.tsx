import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Users } from 'lucide-react'
import { scopesService } from '@/services/company/scopes-service'
import { usersService, type UserSummary } from '@/services/company/users-service'
import { rolesService } from '@/services/company/roles-service'
import { useAuthStore } from '@/store/use-auth-store'
import { formatScopeOptionLabel, getAccessibleScopeOptions } from './user-scope-utils'

const updateUserSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().optional(),
  roleId: z.string().min(1, 'Select a role'),
})

type UpdateUserValues = z.infer<typeof updateUserSchema>

export default function UserEditPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams()
  const { userProfile } = useAuthStore()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const userFromState = (location.state as { user?: UserSummary } | null)?.user ?? null
  const fallbackScopeId = searchParams.get('scopeNodeId')
  const userScopeId = userFromState?.scopeNodeId ?? (fallbackScopeId ? Number(fallbackScopeId) : undefined)

  const { data: tree = [] } = useQuery({
    queryKey: ['scopes-tree'],
    queryFn: scopesService.getTree,
  })

  const scopeOptions = useMemo(
    () => getAccessibleScopeOptions(tree, userProfile?.scopeNodeId ? Number(userProfile.scopeNodeId) : undefined),
    [tree, userProfile?.scopeNodeId],
  )

  const selectedScope = scopeOptions.find((option) => option.id === userScopeId)

  const { data: scopedUsers = [] } = useQuery({
    queryKey: ['users', userScopeId],
    queryFn: () => usersService.getUsers(Number(userScopeId)),
    enabled: !!userScopeId && !userFromState,
  })

  const user = useMemo(() => {
    if (userFromState) {
      return userFromState
    }
    return scopedUsers.find((entry) => String(entry.id) === id) ?? null
  }, [id, scopedUsers, userFromState])

  const { data: roles = [] } = useQuery({
    queryKey: ['roles', selectedScope?.scopeType],
    queryFn: () => rolesService.getRoles(selectedScope?.scopeType),
    enabled: !!selectedScope,
  })

  const form = useForm<UpdateUserValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      roleId: '',
    },
  })

  useEffect(() => {
    if (user) {
      form.setValue('fullName', user.fullName)
      form.setValue('phone', user.phone || '')
      if (roles.length > 0 && user.roles.length > 0) {
        const matchedRole = roles.find((role) => role.name === user.roles[0])
        if (matchedRole) {
          form.setValue('roleId', String(matchedRole.id))
        }
      } else if (roles.length > 0 && !form.getValues('roleId')) {
        form.setValue('roleId', String(roles[0].id))
      }
    }
  }, [form, roles, user])

  const updateMutation = useMutation({
    mutationFn: (values: UpdateUserValues) =>
      usersService.updateUser(Number(id), { fullName: values.fullName, phone: values.phone || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userScopeId] })
      toast.success('User updated successfully')
    },
    onError: () => toast.error('Failed to update user'),
  })

  const roleMutation = useMutation({
    mutationFn: (roleId: number) => usersService.assignRoles(Number(id), [roleId]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', userScopeId] })
      toast.success('Roles updated successfully')
    },
    onError: () => toast.error('Failed to update roles'),
  })

  const handleSubmit = (values: UpdateUserValues) => {
    updateMutation.mutate(values)
    if (values.roleId) {
      roleMutation.mutate(Number(values.roleId))
    }
  }

  return (
    <div className='space-y-6 max-w-3xl mx-auto'>
      <PageHeader title='Edit User' description='Update user profile and role.' onBack={() => navigate('/users')} />

      <Card className='premium-card'>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          {!user ? (
            <EmptyState
              icon={<Users className='h-8 w-8 text-muted-foreground/50' />}
              title='User Not Found'
              description='Select a scope and try again.'
            />
          ) : (
            <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Scope Node</label>
                <select
                  className='h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
                  value={user.scopeNodeId}
                  disabled
                >
                  {scopeOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {formatScopeOptionLabel(option)}
                    </option>
                  ))}
                </select>
              </div>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Full Name</label>
                  <Input placeholder='Full name' {...form.register('fullName')} />
                  {form.formState.errors.fullName && (
                    <p className='text-sm text-destructive'>{form.formState.errors.fullName.message}</p>
                  )}
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Email</label>
                  <Input value={user.email} disabled />
                </div>
              </div>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Phone</label>
                  <Input placeholder='+1 234 567 890' {...form.register('phone')} />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Role</label>
                  <select
                    className='h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
                    {...form.register('roleId')}
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.roleId && (
                    <p className='text-sm text-destructive'>{form.formState.errors.roleId.message}</p>
                  )}
                </div>
              </div>
              <div className='flex justify-end gap-3'>
                <Button type='button' variant='ghost' onClick={() => navigate('/users')}>
                  Cancel
                </Button>
                <Button type='submit' disabled={updateMutation.isPending || roleMutation.isPending}>
                  {updateMutation.isPending || roleMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
