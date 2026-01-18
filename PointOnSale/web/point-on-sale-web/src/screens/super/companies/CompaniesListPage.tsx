import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, MoreHorizontal, Edit, Trash2, ShieldCheck, Power, PowerOff, CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { DataTable, DataTableRow, DataTableCell } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { PermissionGate } from '@/components/auth/permission-gate'
import { companyService, type CompanyQueryParams } from '../../../services/super/company-service'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { subscriptionPlanService } from '@/services/super/subscription-plan-service'

export default function CompaniesListPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [params, setParams] = useState<CompanyQueryParams>({
        page: 1,
        pageSize: 10,
        search: '',
        status: 'ALL',
    })
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [assignCompanyId, setAssignCompanyId] = useState<string | null>(null)
    const [assignPlanId, setAssignPlanId] = useState<string>('')
    const [assignStartDate, setAssignStartDate] = useState<string>('')
    const [assignEndDate, setAssignEndDate] = useState<string>('')

    const { data, isLoading } = useQuery({
        queryKey: ['super-companies', params],
        queryFn: () => companyService.getCompanies(params),
    })

    const { data: plans = [] } = useQuery({
        queryKey: ['subscription-plans'],
        queryFn: () => subscriptionPlanService.getPlans(),
        enabled: !!assignCompanyId,
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => companyService.deleteCompany(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['super-companies'] })
            toast.success('Company deleted successfully')
            setDeleteId(null)
        },
    })

    const toggleMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            companyService.toggleStatus(id, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['super-companies'] })
            toast.success('Company status updated')
        },
    })

    const assignMutation = useMutation({
        mutationFn: ({
            companyId,
            planId,
            startDate,
            endDate,
        }: {
            companyId: string
            planId: number
            startDate: string
            endDate: string
        }) =>
            subscriptionPlanService.assignPlanToCompany(companyId, {
                planId,
                startDate,
                endDate,
            }),
        onSuccess: () => {
            toast.success('Subscription assigned successfully')
            setAssignCompanyId(null)
            setAssignPlanId('')
            setAssignStartDate('')
            setAssignEndDate('')
        },
        onError: () => {
            toast.error('Failed to assign subscription')
        },
    })

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setParams((prev) => ({ ...prev, page: 1 }))
    }

    const activePlans = useMemo(() => plans.filter((plan) => plan.isActive), [plans])
    const canSubmitAssignment = assignCompanyId && assignPlanId && assignStartDate && assignEndDate

    return (
        <div className='space-y-6'>
            <PageHeader
                title='Companies'
                description='Manage all registered companies and their accounts.'
            >
                <PermissionGate perm='COMPANIES_CREATE'>
                    <Button onClick={() => navigate('/super/companies/new')}>
                        <Plus className='h-4 w-4 mr-2' />
                        Add Company
                    </Button>
                </PermissionGate>
            </PageHeader>

            <div className='flex flex-col sm:flex-row gap-4'>
                <form onSubmit={handleSearch} className='relative flex-1'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder='Search by name or GSTIN...'
                        className='pl-9'
                        value={params.search || ''}
                        onChange={(e) => setParams((prev) => ({ ...prev, search: e.target.value }))}
                    />
                </form>
                <div className='w-full sm:w-48'>
                    <Select
                        value={params.status || 'ALL'}
                        onValueChange={(val: string) => setParams((prev) => ({ ...prev, status: val, page: 1 }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder='Filter by status' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='ALL'>All Statuses</SelectItem>
                            <SelectItem value='ACTIVE'>Active</SelectItem>
                            <SelectItem value='INACTIVE'>Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <DataTable>
                <thead>
                    <DataTableRow>
                        <DataTableCell isHeader>Company Name</DataTableCell>
                        <DataTableCell isHeader>GSTIN</DataTableCell>
                        <DataTableCell isHeader>Status</DataTableCell>
                        <DataTableCell isHeader>Created At</DataTableCell>
                        <DataTableCell isHeader className='text-right'>Actions</DataTableCell>
                    </DataTableRow>
                </thead>
                <tbody>
                    {isLoading ? (
                        <DataTableRow>
                            <DataTableCell colSpan={5} className='text-center py-8 text-foreground'>Loading companies...</DataTableCell>
                        </DataTableRow>
                    ) : data?.items.length === 0 ? (
                        <DataTableRow>
                            <DataTableCell colSpan={5} className='text-center py-8 text-muted-foreground'>
                                No companies found.
                            </DataTableCell>
                        </DataTableRow>
                    ) : (
                        data?.items.map((company) => (
                            <DataTableRow key={company.id}>
                                <DataTableCell className='font-medium text-foreground'>{company.name}</DataTableCell>
                                <DataTableCell className='text-foreground'>{company.gstin || 'N/A'}</DataTableCell>
                                <DataTableCell>
                                    <Badge variant={company.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                        {company.status}
                                    </Badge>
                                </DataTableCell>
                                <DataTableCell className='text-foreground'>{new Date(company.createdAt).toLocaleDateString()}</DataTableCell>
                                <DataTableCell className='text-right'>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant='ghost' size='icon'>
                                                <MoreHorizontal className='h-4 w-4' />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align='end' className='w-48'>
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => navigate(`/super/companies/${company.id}/edit`)}>
                                                <Edit className='h-4 w-4 mr-2' />
                                                Edit Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => navigate(`/super/companies/${company.id}/admins`)}>
                                                <ShieldCheck className='h-4 w-4 mr-2' />
                                                Manage Admins
                                            </DropdownMenuItem>
                                            <PermissionGate perm='SUBSCRIPTIONS_UPDATE'>
                                                <DropdownMenuItem onClick={() => setAssignCompanyId(company.id)}>
                                                    <CreditCard className='h-4 w-4 mr-2' />
                                                    Assign Plan
                                                </DropdownMenuItem>
                                            </PermissionGate>
                                            <DropdownMenuSeparator />
                                            <PermissionGate perm='COMPANIES_ACTIVATE'>
                                                <DropdownMenuItem
                                                    onClick={() => toggleMutation.mutate({ id: company.id, isActive: company.status !== 'ACTIVE' })}
                                                >
                                                    {company.status === 'ACTIVE' ? (
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
                                                </DropdownMenuItem>
                                            </PermissionGate>
                                            <PermissionGate perm='COMPANIES_DELETE'>
                                                <DropdownMenuItem
                                                    className='text-destructive'
                                                    onClick={() => setDeleteId(company.id)}
                                                >
                                                    <Trash2 className='h-4 w-4 mr-2' />
                                                    Delete Company
                                                </DropdownMenuItem>
                                            </PermissionGate>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </DataTableCell>
                            </DataTableRow>
                        ))
                    )}
                </tbody>
            </DataTable>

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => (!open ? setDeleteId(null) : undefined)}
                onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
                title='Delete Company'
                description='Are you sure you want to delete this company? This action cannot be undone and will affect all associated users and data.'
                loading={deleteMutation.isPending}
            />

            <Dialog
                open={!!assignCompanyId}
                onOpenChange={(open) => (!open ? setAssignCompanyId(null) : undefined)}
            >
                <DialogContent className='sm:max-w-lg'>
                    <DialogHeader>
                        <DialogTitle>Assign Subscription Plan</DialogTitle>
                        <DialogDescription>
                            Select a subscription plan and define the active period for this company.
                        </DialogDescription>
                    </DialogHeader>
                    <div className='space-y-4'>
                        <div className='space-y-2'>
                            <label className='text-sm font-medium'>Plan</label>
                            <select
                                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                                value={assignPlanId}
                                onChange={(event) => setAssignPlanId(event.target.value)}
                            >
                                <option value=''>Select a plan</option>
                                {activePlans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.name} • ₹{plan.monthlyPrice.toFixed(2)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='grid gap-4 sm:grid-cols-2'>
                            <div className='space-y-2'>
                                <label className='text-sm font-medium'>Start Date</label>
                                <Input
                                    type='date'
                                    value={assignStartDate}
                                    onChange={(event) => setAssignStartDate(event.target.value)}
                                />
                            </div>
                            <div className='space-y-2'>
                                <label className='text-sm font-medium'>End Date</label>
                                <Input
                                    type='date'
                                    value={assignEndDate}
                                    onChange={(event) => setAssignEndDate(event.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type='button' variant='ghost' onClick={() => setAssignCompanyId(null)}>
                            Cancel
                        </Button>
                        <Button
                            type='button'
                            disabled={!canSubmitAssignment || assignMutation.isPending}
                            onClick={() => {
                                if (!assignCompanyId) return
                                assignMutation.mutate({
                                    companyId: assignCompanyId,
                                    planId: Number(assignPlanId),
                                    startDate: new Date(assignStartDate).toISOString(),
                                    endDate: new Date(assignEndDate).toISOString(),
                                })
                            }}
                        >
                            {assignMutation.isPending ? 'Assigning...' : 'Assign Plan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
