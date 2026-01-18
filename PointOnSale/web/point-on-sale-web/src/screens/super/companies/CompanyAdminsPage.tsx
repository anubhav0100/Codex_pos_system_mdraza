import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Users, UserPlus, Pencil, Power, PowerOff } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { DataTable, DataTableCell, DataTableRow } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { PermissionGate } from '@/components/auth/permission-gate'
import { companyAdminsService, type CompanyAdmin } from '@/services/super/company-admins-service'
import { companyService } from '@/services/super/company-service'

const createAdminSchema = z.object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(6, 'Valid phone number is required'),
})

type CreateAdminFormValues = z.infer<typeof createAdminSchema>

const updateAdminSchema = z.object({
    fullName: z.string().min(2, 'Full name is required'),
    phone: z.string().min(6, 'Valid phone number is required'),
})

type UpdateAdminFormValues = z.infer<typeof updateAdminSchema>

export default function CompanyAdminsPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const queryClient = useQueryClient()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editAdmin, setEditAdmin] = useState<CompanyAdmin | null>(null)
    const [tempPassword, setTempPassword] = useState<string | null>(null)
    const [showTempPassword, setShowTempPassword] = useState(false)

    const companyId = id ?? ''

    const { data: company } = useQuery({
        queryKey: ['super-company', companyId],
        queryFn: () => companyService.getCompany(companyId),
        enabled: !!companyId,
    })

    const { data: admins = [], isLoading } = useQuery({
        queryKey: ['company-admins', companyId],
        queryFn: () => companyAdminsService.getCompanyAdmins(companyId),
        enabled: !!companyId,
    })

    const createForm = useForm<CreateAdminFormValues>({
        resolver: zodResolver(createAdminSchema),
        defaultValues: {
            fullName: '',
            email: '',
            phone: '',
        },
    })

    const updateForm = useForm<UpdateAdminFormValues>({
        resolver: zodResolver(updateAdminSchema),
        defaultValues: {
            fullName: '',
            phone: '',
        },
    })

    useEffect(() => {
        if (editAdmin) {
            updateForm.reset({
                fullName: editAdmin.fullName,
                phone: editAdmin.phone,
            })
        }
    }, [editAdmin, updateForm])

    const createMutation = useMutation({
        mutationFn: (values: CreateAdminFormValues) =>
            companyAdminsService.createCompanyAdmin(companyId, values),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['company-admins', companyId] })
            const password =
                (data as { temporaryPassword?: string }).temporaryPassword ??
                (data as { TemporaryPassword?: string }).TemporaryPassword ??
                ''
            setTempPassword(password)
            setShowTempPassword(true)
            setIsCreateOpen(false)
            createForm.reset()
            toast.success('Company admin created successfully')
        },
        onError: () => {
            toast.error('Failed to create company admin')
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({ userId, values }: { userId: number; values: UpdateAdminFormValues }) =>
            companyAdminsService.updateCompanyAdmin(userId, values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['company-admins', companyId] })
            setEditAdmin(null)
            toast.success('Company admin updated successfully')
        },
        onError: () => {
            toast.error('Failed to update company admin')
        },
    })

    const statusMutation = useMutation({
        mutationFn: ({ userId, isActive }: { userId: number; isActive: boolean }) =>
            isActive
                ? companyAdminsService.deactivateCompanyAdmin(userId)
                : companyAdminsService.activateCompanyAdmin(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['company-admins', companyId] })
            toast.success('Company admin status updated')
        },
        onError: () => {
            toast.error('Failed to update status')
        },
    })

    const formErrors = createForm.formState.errors
    const updateErrors = updateForm.formState.errors

    const companyName = useMemo(() => company?.name ?? 'Company', [company?.name])

    return (
        <div className='space-y-6'>
            <PageHeader
                title='Company Administrators'
                description={`Manage administrative users for ${companyName}.`}
                onBack={() => navigate('/super/companies')}
            >
                <PermissionGate perm='COMPANY_ADMINS_CREATE'>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <UserPlus className='h-4 w-4 mr-2' />
                        Add Admin
                    </Button>
                </PermissionGate>
            </PageHeader>

            {isLoading ? (
                <DataTable>
                    <tbody>
                        <DataTableRow>
                            <DataTableCell colSpan={5} className='text-center py-8 text-foreground'>
                                Loading administrators...
                            </DataTableCell>
                        </DataTableRow>
                    </tbody>
                </DataTable>
            ) : admins.length === 0 ? (
                <EmptyState
                    icon={<Users className='h-8 w-8 text-muted-foreground/50' />}
                    title='No Admins Assigned'
                    description='Create the first company administrator to manage this company.'
                />
            ) : (
                <DataTable>
                    <thead>
                        <DataTableRow>
                            <DataTableCell isHeader>Name</DataTableCell>
                            <DataTableCell isHeader>Email</DataTableCell>
                            <DataTableCell isHeader>Phone</DataTableCell>
                            <DataTableCell isHeader>Status</DataTableCell>
                            <DataTableCell isHeader className='text-right'>Actions</DataTableCell>
                        </DataTableRow>
                    </thead>
                    <tbody>
                        {admins.map((admin) => (
                            <DataTableRow key={admin.id}>
                                <DataTableCell className='font-medium text-foreground'>
                                    {admin.fullName}
                                </DataTableCell>
                                <DataTableCell className='text-foreground'>
                                    {admin.email}
                                </DataTableCell>
                                <DataTableCell className='text-foreground'>
                                    {admin.phone}
                                </DataTableCell>
                                <DataTableCell>
                                    <Badge variant={admin.isActive ? 'default' : 'secondary'}>
                                        {admin.isActive ? 'ACTIVE' : 'INACTIVE'}
                                    </Badge>
                                </DataTableCell>
                                <DataTableCell className='text-right space-x-2'>
                                    <PermissionGate perm='COMPANY_ADMINS_UPDATE'>
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() => setEditAdmin(admin)}
                                        >
                                            <Pencil className='h-4 w-4 mr-2' />
                                            Edit
                                        </Button>
                                    </PermissionGate>
                                    <PermissionGate perm='COMPANY_ADMINS_ACTIVATE'>
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() =>
                                                statusMutation.mutate({
                                                    userId: admin.id,
                                                    isActive: admin.isActive,
                                                })
                                            }
                                        >
                                            {admin.isActive ? (
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

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className='sm:max-w-lg'>
                    <DialogHeader>
                        <DialogTitle>Create Company Admin</DialogTitle>
                        <DialogDescription>
                            Provide the details for the new administrator. A temporary password will be generated.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={createForm.handleSubmit((values) => createMutation.mutate(values))}
                        className='space-y-4'
                    >
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Full Name</label>
                            <Input placeholder='Full name' {...createForm.register('fullName')} />
                            {formErrors.fullName && (
                                <p className='text-xs text-destructive'>{formErrors.fullName.message}</p>
                            )}
                        </div>
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Email</label>
                            <Input type='email' placeholder='admin@company.com' {...createForm.register('email')} />
                            {formErrors.email && (
                                <p className='text-xs text-destructive'>{formErrors.email.message}</p>
                            )}
                        </div>
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Phone</label>
                            <Input placeholder='+91 9876543210' {...createForm.register('phone')} />
                            {formErrors.phone && (
                                <p className='text-xs text-destructive'>{formErrors.phone.message}</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type='button' variant='ghost' onClick={() => setIsCreateOpen(false)}>
                                Cancel
                            </Button>
                            <Button type='submit' disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Creating...' : 'Create Admin'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!editAdmin} onOpenChange={(open) => (!open ? setEditAdmin(null) : undefined)}>
                <DialogContent className='sm:max-w-lg'>
                    <DialogHeader>
                        <DialogTitle>Edit Company Admin</DialogTitle>
                        <DialogDescription>Update contact details for this administrator.</DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={updateForm.handleSubmit((values) =>
                            editAdmin && updateMutation.mutate({ userId: editAdmin.id, values }),
                        )}
                        className='space-y-4'
                    >
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Full Name</label>
                            <Input placeholder='Full name' {...updateForm.register('fullName')} />
                            {updateErrors.fullName && (
                                <p className='text-xs text-destructive'>{updateErrors.fullName.message}</p>
                            )}
                        </div>
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Phone</label>
                            <Input placeholder='+91 9876543210' {...updateForm.register('phone')} />
                            {updateErrors.phone && (
                                <p className='text-xs text-destructive'>{updateErrors.phone.message}</p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type='button' variant='ghost' onClick={() => setEditAdmin(null)}>
                                Cancel
                            </Button>
                            <Button type='submit' disabled={updateMutation.isPending}>
                                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={showTempPassword}
                onOpenChange={(open) => {
                    if (!open) {
                        setShowTempPassword(false)
                        setTempPassword(null)
                    }
                }}
            >
                <DialogContent className='sm:max-w-md'>
                    <DialogHeader>
                        <DialogTitle>Temporary Password</DialogTitle>
                        <DialogDescription>
                            Share this password with the administrator. It will only be shown once.
                        </DialogDescription>
                    </DialogHeader>
                    <div className='rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 p-4 text-center text-lg font-semibold'>
                        {tempPassword}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowTempPassword(false)}>Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
