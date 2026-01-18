import { useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Map } from 'lucide-react'
import { scopesService, type ScopeNode } from '@/services/company/scopes-service'

const createStateSchema = z.object({
  name: z.string().min(2, 'State name is required'),
  parentScopeId: z.string().min(1, 'Select a company'),
})

type CreateStateValues = z.infer<typeof createStateSchema>

const flattenScopes = (nodes: ScopeNode[]): ScopeNode[] =>
  nodes.flatMap((node) => [node, ...(node.children ? flattenScopes(node.children) : [])])

export default function ScopeCreateStatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()

  const { data: tree = [], isLoading } = useQuery({
    queryKey: ['scopes-tree'],
    queryFn: scopesService.getTree,
  })

  const companyScopes = useMemo(
    () => flattenScopes(tree).filter((scope) => Number(scope.scopeType) === 1),
    [tree],
  )

  const form = useForm<CreateStateValues>({
    resolver: zodResolver(createStateSchema),
    defaultValues: {
      name: '',
      parentScopeId: '',
    },
  })

  useEffect(() => {
    const parentId = searchParams.get('parentId') ?? ''
    if (!form.getValues('parentScopeId')) {
      form.setValue('parentScopeId', parentId || String(companyScopes[0]?.id ?? ''))
    }
  }, [companyScopes, form, searchParams])

  const mutation = useMutation({
    mutationFn: (values: CreateStateValues) =>
      scopesService.createState({
        name: values.name,
        parentScopeId: Number(values.parentScopeId),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scopes-tree'] })
      toast.success('State created successfully')
      navigate('/scopes/tree')
    },
    onError: () => toast.error('Failed to create state'),
  })

  return (
    <div className='space-y-6 max-w-2xl mx-auto'>
      <PageHeader
        title='Create State'
        description='Add a new state under the company scope.'
        onBack={() => navigate('/scopes/tree')}
      />

      <Card className='premium-card'>
        <CardHeader>
          <CardTitle>State Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='text-sm text-muted-foreground'>Loading company scopes...</div>
          ) : companyScopes.length === 0 ? (
            <EmptyState
              icon={<Map className='h-8 w-8 text-muted-foreground/50' />}
              title='No Company Scope'
              description='Create a company scope before adding states.'
            />
          ) : (
            <form
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
              className='space-y-4'
            >
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Company Scope</label>
                <select
                  className='h-10 w-full rounded-md border border-input bg-background px-3 text-sm'
                  {...form.register('parentScopeId')}
                >
                  {companyScopes.map((scope) => (
                    <option key={scope.id} value={scope.id}>
                      {scope.name}
                    </option>
                  ))}
                </select>
                {form.formState.errors.parentScopeId && (
                  <p className='text-sm text-destructive'>{form.formState.errors.parentScopeId.message}</p>
                )}
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>State Name</label>
                <Input placeholder='Enter state name' {...form.register('name')} />
                {form.formState.errors.name && (
                  <p className='text-sm text-destructive'>{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className='flex justify-end'>
                <Button type='submit' disabled={mutation.isPending}>
                  {mutation.isPending ? 'Creating...' : 'Create State'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
