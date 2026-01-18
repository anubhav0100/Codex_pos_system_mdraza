import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Power, PowerOff } from 'lucide-react'
import { toast } from 'sonner'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DataTable, DataTableCell, DataTableRow } from '@/components/ui/data-table'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { PermissionGate } from '@/components/auth/permission-gate'
import {
    subscriptionPlanService,
    type SubscriptionPlan,
} from '@/services/super/subscription-plan-service'

const createPlanSchema = z.object({
    name: z.string().min(2, 'Plan name is required'),
    monthlyPrice: z
        .preprocess((value) => Number(value), z.number().min(0, 'Monthly price must be 0 or higher')),
    limitsJson: z.string().optional(),
})

type CreatePlanFormValues = z.infer<typeof createPlanSchema>

const updatePlanSchema = z.object({
    name: z.string().min(2, 'Plan name is required'),
    monthlyPrice: z
        .preprocess((value) => Number(value), z.number().min(0, 'Monthly price must be 0 or higher')),
    limitsJson: z.string().optional(),
    isActive: z.boolean(),
})

type UpdatePlanFormValues = z.infer<typeof updatePlanSchema>

export default function SubscriptionPlansPage() {
    const queryClient = useQueryClient()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editPlan, setEditPlan] = useState<SubscriptionPlan | null>(null)
    const [deletePlanId, setDeletePlanId] = useState<number | null>(null)

    const { data: plans = [], isLoading } = useQuery({
        queryKey: ['subscription-plans'],
        queryFn: () => subscriptionPlanService.getPlans(),
    })

    const createForm = useForm<CreatePlanFormValues>({
        resolver: zodResolver(createPlanSchema),
        defaultValues: {
            name: '',
            monthlyPrice: 0,
            limitsJson: '{}',
        },
    })

    const updateForm = useForm<UpdatePlanFormValues>({
        resolver: zodResolver(updatePlanSchema),
        defaultValues: {
            name: '',
            monthlyPrice: 0,
            limitsJson: '{}',
            isActive: true,
        },
    })

    useEffect(() => {
        if (editPlan) {
            updateForm.reset({
                name: editPlan.name,
                monthlyPrice: editPlan.monthlyPrice,
                limitsJson: editPlan.limitsJson || '{}',
                isActive: editPlan.isActive,
            })
        }
    }, [editPlan, updateForm])

    const createMutation = useMutation({
        mutationFn: (values: CreatePlanFormValues) =>
            subscriptionPlanService.createPlan({
                name: values.name,
                monthlyPrice: values.monthlyPrice,
                limitsJson: values.limitsJson || '{}',
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
            setIsCreateOpen(false)
            createForm.reset({ name: '', monthlyPrice: 0, limitsJson: '{}' })
            toast.success('Subscription plan created')
        },
        onError: () => {
            toast.error('Failed to create subscription plan')
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ planId, values }: { planId: number; values: UpdatePlanFormValues }) =>
            subscriptionPlanService.updatePlan(planId, {
                name: values.name,
                monthlyPrice: values.monthlyPrice,
                limitsJson: values.limitsJson || '{}',
                isActive: values.isActive,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
            setEditPlan(null)
            toast.success('Subscription plan updated')
        },
        onError: () => {
            toast.error('Failed to update subscription plan')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (planId: number) => subscriptionPlanService.deletePlan(planId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
            setDeletePlanId(null)
            toast.success('Subscription plan deleted')
        },
        onError: () => {
            toast.error('Failed to delete subscription plan')
        },
    })

    const toggleMutation = useMutation({
        mutationFn: (plan: SubscriptionPlan) =>
            subscriptionPlanService.updatePlan(plan.id, {
                name: plan.name,
                monthlyPrice: plan.monthlyPrice,
                limitsJson: plan.limitsJson,
                isActive: !plan.isActive,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })
            toast.success('Subscription plan status updated')
        },
        onError: () => {
            toast.error('Failed to update status')
        },
    })

    const createErrors = createForm.formState.errors
    const updateErrors = updateForm.formState.errors

    const formattedPlans = useMemo(
        () =>
            plans.map((plan) => ({
                ...plan,
                displayPrice: `₹${plan.monthlyPrice.toFixed(2)}`,
            })),
        [plans],
    )

    return (
        <div className='space-y-6'>
            <PageHeader
                title='Subscription Plans'
                description='Create and manage subscription plans for companies.'
            >
                <PermissionGate perm='SUBSCRIPTIONS_CREATE'>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className='h-4 w-4 mr-2' />
                        Add Plan
                    </Button>
                </PermissionGate>
            </PageHeader>

            <DataTable>
                <thead>
                    <DataTableRow>
                        <DataTableCell isHeader>Name</DataTableCell>
                        <DataTableCell isHeader>Monthly Price</DataTableCell>
                        <DataTableCell isHeader>Status</DataTableCell>
                        <DataTableCell isHeader>Limits</DataTableCell>
                        <DataTableCell isHeader className='text-right'>Actions</DataTableCell>
                    </DataTableRow>
                </thead>
                <tbody>
                    {isLoading ? (
                        <DataTableRow>
                            <DataTableCell colSpan={5} className='text-center py-8 text-foreground'>
                                Loading subscription plans...
                            </DataTableCell>
                        </DataTableRow>
                    ) : formattedPlans.length === 0 ? (
                        <DataTableRow>
                            <DataTableCell colSpan={5} className='text-center py-8 text-muted-foreground'>
                                No subscription plans found.
                            </DataTableCell>
                        </DataTableRow>
                    ) : (
                        formattedPlans.map((plan) => (
                            <DataTableRow key={plan.id}>
                                <DataTableCell className='font-medium text-foreground'>
                                    {plan.name}
                                </DataTableCell>
                                <DataTableCell className='text-foreground'>{plan.displayPrice}</DataTableCell>
                                <DataTableCell>
                                    <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                                        {plan.isActive ? 'ACTIVE' : 'INACTIVE'}
                                    </Badge>
                                </DataTableCell>
                                <DataTableCell className='text-muted-foreground truncate max-w-[240px]'>
                                    {plan.limitsJson || '{}'}
                                </DataTableCell>
                                <DataTableCell className='text-right space-x-2'>
                                    <PermissionGate perm='SUBSCRIPTIONS_UPDATE'>
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() => setEditPlan(plan)}
                                        >
                                            <Pencil className='h-4 w-4 mr-2' />
                                            Edit
                                        </Button>
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() => toggleMutation.mutate(plan)}
                                        >
                                            {plan.isActive ? (
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
                                    <PermissionGate perm='SUBSCRIPTIONS_DELETE'>
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            className='text-destructive'
                                            onClick={() => setDeletePlanId(plan.id)}
                                        >
                                            <Trash2 className='h-4 w-4 mr-2' />
                                            Delete
                                        </Button>
                                    </PermissionGate>
                                </DataTableCell>
                            </DataTableRow>
                        ))
                    )}
                </tbody>
            </DataTable>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className='sm:max-w-lg'>
                    <DialogHeader>
                        <DialogTitle>Create Subscription Plan</DialogTitle>
                        <DialogDescription>Define pricing and limits for a new plan.</DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={createForm.handleSubmit((values) => createMutation.mutate(values))}
                        className='space-y-4'
                    >
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Plan Name</label>
                            <Input placeholder='Starter Plan' {...createForm.register('name')} />
                            {createErrors.name && (
                                <p className='text-xs text-destructive'>{createErrors.name.message}</p>
                            )}
                        </div>
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Monthly Price</label>
                            <Input
                                type='number'
                                step='0.01'
                                {...createForm.register('monthlyPrice', { valueAsNumber: true })}
                            />
                            {createErrors.monthlyPrice && (
                                <p className='text-xs text-destructive'>{createErrors.monthlyPrice.message}</p>
                            )}
                        </div>
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Limits (JSON)</label>
                            <Input
                                placeholder='{"users": 10, "locations": 3}'
                                {...createForm.register('limitsJson')}
                            />
                        </div>
                        <DialogFooter>
                            <Button type='button' variant='ghost' onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button type='submit' disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Creating...' : 'Create Plan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!editPlan} onOpenChange={(open) => (!open ? setEditPlan(null) : undefined)}>
                <DialogContent className='sm:max-w-lg'>
                    <DialogHeader>
                        <DialogTitle>Edit Subscription Plan</DialogTitle>
                        <DialogDescription>Update pricing, limits, or activation status.</DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={updateForm.handleSubmit((values) =>
                            editPlan && updateMutation.mutate({ planId: editPlan.id, values }),
                        )}
                        className='space-y-4'
                    >
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Plan Name</label>
                            <Input placeholder='Starter Plan' {...updateForm.register('name')} />
                            {updateErrors.name && (
                                <p className='text-xs text-destructive'>{updateErrors.name.message}</p>
                            )}
                        </div>
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Monthly Price</label>
                            <Input
                                type='number'
                                step='0.01'
                                {...updateForm.register('monthlyPrice', { valueAsNumber: true })}
                            />
                            {updateErrors.monthlyPrice && (
                                <p className='text-xs text-destructive'>{updateErrors.monthlyPrice.message}</p>
                            )}
                        </div>
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Limits (JSON)</label>
                            <Input
                                placeholder='{"users": 10, "locations": 3}'
                                {...updateForm.register('limitsJson')}
                            />
                        </div>
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Status</label>
                            <Controller
                                control={updateForm.control}
                                name='isActive'
                                render={({ field }) => (
                                    <select
                                        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                                        value={field.value ? 'true' : 'false'}
                                        onChange={(event) => field.onChange(event.target.value === 'true')}
                                    >
                                        <option value='true'>Active</option>
                                        <option value='false'>Inactive</option>
                                    </select>
                                )}
                            />
                        </div>
                        <DialogFooter>
                            <Button type='button' variant='ghost' onClick={() => setEditPlan(null)}>
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
                open={deletePlanId !== null}
                onOpenChange={(open) => (!open ? setDeletePlanId(null) : undefined)}
                onConfirm={() => deletePlanId !== null && deleteMutation.mutate(deletePlanId)}
                title='Delete Subscription Plan'
                description='Are you sure you want to delete this plan? This action cannot be undone.'
                loading={deleteMutation.isPending}
            />
        </div>
    )
}
