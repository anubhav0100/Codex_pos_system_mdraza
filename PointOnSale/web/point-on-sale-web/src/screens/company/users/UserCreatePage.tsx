import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Users } from 'lucide-react'
import { scopesService } from '@/services/company/scopes-service'
import { usersService } from '@/services/company/users-service'
import { rolesService } from '@/services/company/roles-service'
import { useAuthStore } from '@/store/use-auth-store'
import { formatScopeOptionLabel, getAccessibleScopeOptions } from './user-scope-utils'

const createUserSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  scopeNodeId: z.string().min(1, 'Select a scope'),
  roleId: z.string().min(1, 'Select a role'),
})

type CreateUserValues = z.infer<typeof createUserSchema>

export default function UserCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { userProfile } = useAuthStore()
  const [showTempPassword, setShowTempPassword] = useState(false)
  const [tempPassword, setTempPassword] = useState('')

  const { data: tree = [], isLoading: isScopesLoading } = useQuery({
    queryKey: ['scopes-tree'],
    queryFn: scopesService.getTree,
  })

  const scopeOptions = useMemo(
    () => getAccessibleScopeOptions(tree, userProfile?.scopeNodeId ? Number(userProfile.scopeNodeId) : undefined),
    [tree, userProfile?.scopeNodeId],
  )

  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      scopeNodeId: '',
      roleId: '',
    },
  })

  const selectedScopeId = form.watch('scopeNodeId')
  const selectedScope = scopeOptions.find((option) => String(option.id) === selectedScopeId)

  useEffect(() => {
    if (!selectedScopeId && scopeOptions.length > 0) {
      form.setValue('scopeNodeId', String(scopeOptions[0].id))
    }
  }, [form, scopeOptions, selectedScopeId])

  const { data: roles = [], isLoading: isRolesLoading } = useQuery({
    queryKey: ['roles', selectedScope?.scopeType],
    queryFn: () => rolesService.getRoles(selectedScope?.scopeType),
    enabled: !!selectedScope,
  })

  useEffect(() => {
    if (roles.length > 0 && !form.getValues('roleId')) {
      form.setValue('roleId', String(roles[0].id))
    }
  }, [form, roles])

  const mutation = useMutation({
    mutationFn: (values: CreateUserValues) =>
      usersService.createUser({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone || undefined,
        scopeNodeId: Number(values.scopeNodeId),
        roleIds: values.roleId ? [Number(values.roleId)] : [],
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      const password =
        (data as { temporaryPassword?: string }).temporaryPassword ??
        (data as { TemporaryPassword?: string }).TemporaryPassword ??
        ''
      setTempPassword(password)
      setShowTempPassword(true)
      toast.success('User created successfully')
      form.reset()
    },
    onError: () => toast.error('Failed to create user'),
  })

  return (
    <div className='space-y-6 max-w-3xl mx-auto'>
      <PageHeader
        title='Create User'
        description='Create a new user and assign them to a scope node.'
        onBack={() => navigate('/users')}
      />

      <Card className='premium-card'>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isScopesLoading ? (
            <div className='text-sm text-muted-foreground'>Loading scope nodes...</div>
          ) : scopeOptions.length === 0 ? (
            <EmptyState
              icon={<Users className='h-8 w-8 text-muted-foreground/50' />}
              title='No Accessible Scopes'
              description='You do not have access to any scope nodes to create users.'
            />
          ) : (
            <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Scope Node</label>
                <select
                  className='h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
                  {...form.register('scopeNodeId')}
                >
                  {scopeOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {formatScopeOptionLabel(option)}
                    </option>
                  ))}
                </select>
                {form.formState.errors.scopeNodeId && (
                  <p className='text-sm text-destructive'>{form.formState.errors.scopeNodeId.message}</p>
                )}
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
                  <Input type='email' placeholder='user@company.com' {...form.register('email')} />
                  {form.formState.errors.email && (
                    <p className='text-sm text-destructive'>{form.formState.errors.email.message}</p>
                  )}
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
                    disabled={!selectedScope || isRolesLoading}
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
              <div className='flex justify-end'>
                <Button type='submit' disabled={mutation.isPending}>
                  {mutation.isPending ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={showTempPassword}
        onOpenChange={(open) => {
          if (!open) {
            setShowTempPassword(false)
            setTempPassword('')
            navigate('/users')
          }
        }}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Temporary Password</DialogTitle>
            <DialogDescription>
              Share this password with the user. It will only be shown once.
            </DialogDescription>
          </DialogHeader>
          <div className='rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 p-4 text-center text-lg font-semibold'>
            {tempPassword || 'Generated password will appear here'}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowTempPassword(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
