import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, MoreHorizontal, Edit, Trash2, ShieldCheck, Power, PowerOff } from 'lucide-react'
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
import { companyService, CompanyQueryParams } from '@/services/super/company-service'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

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

    const { data, isLoading } = useQuery({
        queryKey: ['super-companies', params],
        queryFn: () => companyService.getCompanies(params),
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setParams((prev) => ({ ...prev, page: 1 }))
    }

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
                        value={params.search}
                        onChange={(e) => setParams((prev) => ({ ...prev, search: e.target.value }))}
                    />
                </form>
                <div className='w-full sm:w-48'>
                    <Select
                        value={params.status}
                        onValueChange={(val) => setParams((prev) => ({ ...prev, status: val, page: 1 }))}
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
                            <DataTableCell colSpan={5} className='text-center py-8'>Loading companies...</DataTableCell>
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
                                <DataTableCell className='font-medium'>{company.name}</DataTableCell>
                                <DataTableCell>{company.gstin || 'N/A'}</DataTableCell>
                                <DataTableCell>
                                    <Badge variant={company.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                        {company.status}
                                    </Badge>
                                </DataTableCell>
                                <DataTableCell>{new Date(company.createdAt).toLocaleDateString()}</DataTableCell>
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
                onOpenChange={(open) => !open && setDeleteId(null)}
                onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
                title='Delete Company'
                description='Are you sure you want to delete this company? This action cannot be undone and will affect all associated users and data.'
                loading={deleteMutation.isPending}
            />
        </div>
    )
}
